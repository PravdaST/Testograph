/**
 * VAT Invoice Downloader using Persistent Browser Context
 *
 * This script uses a persistent browser profile that remembers your Shopify login.
 * On first run, you'll need to log in. After that, it will remember the session.
 *
 * Usage:
 *   node scripts/download-vat-invoices-persistent.mjs 2025-11
 */

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const SHOPIFY_STORE_ID = '9j8fjr-64';
const SHOPIFY_ADMIN_BASE = `https://admin.shopify.com/store/${SHOPIFY_STORE_ID}`;

// Persistent browser data directory
const USER_DATA_DIR = path.join(__dirname, '..', '.playwright-data');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getOrdersForMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  console.log(`Fetching orders from ${startDate.slice(0, 10)} to ${endDate.slice(0, 10)}...`);

  const { data: orders, error } = await supabase
    .from('pending_orders')
    .select('id, order_id, order_number, email, customer_name, total_price, created_at, paid_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return [];
  }

  console.log(`Found ${orders.length} orders for ${yearMonth}`);
  return orders;
}

function createOutputDir(yearMonth) {
  const outputDir = path.join(__dirname, '..', 'vat-invoices', yearMonth);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  return outputDir;
}

function isAlreadyDownloaded(outputDir, orderNumber) {
  const cleanNumber = orderNumber.replace('#', '');
  const files = fs.readdirSync(outputDir);
  return files.some(f => f.includes(cleanNumber));
}

async function extractVatInvoiceUrl(page) {
  return await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="tax_invoices"][href*="download"]'));
    if (links.length > 0) return links[0].href;

    const html = document.body.innerHTML;
    const match = html.match(/href="([^"]*\/tax_invoices\/[^"]*\/download\/[^"]+\.pdf)"/);
    if (match) {
      let url = match[1];
      if (!url.startsWith('http')) {
        url = 'https://admin.shopify.com/store/9j8fjr-64' + url;
      }
      return url;
    }
    return null;
  });
}

async function downloadVatInvoice(page, order, outputDir) {
  const orderUrl = `${SHOPIFY_ADMIN_BASE}/orders/${order.order_id}`;
  const cleanOrderNumber = order.order_number.replace('#', '');

  try {
    await page.goto(orderUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const vatInvoiceUrl = await extractVatInvoiceUrl(page);

    if (!vatInvoiceUrl) {
      return { success: false, reason: 'no_invoice' };
    }

    const invoiceMatch = vatInvoiceUrl.match(/vat_invoice_(\d+)\.pdf/);
    const invoiceNumber = invoiceMatch ? invoiceMatch[1] : cleanOrderNumber;
    const filename = `VAT_${invoiceNumber}_order${cleanOrderNumber}.pdf`;
    const filepath = path.join(outputDir, filename);

    // Download using fetch in browser context
    const pdfBuffer = await page.evaluate(async (url) => {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      return Array.from(new Uint8Array(buffer));
    }, vatInvoiceUrl);

    fs.writeFileSync(filepath, Buffer.from(pdfBuffer));
    return { success: true, filename };

  } catch (error) {
    return { success: false, reason: error.message };
  }
}

async function waitForShopifyLogin(page) {
  console.log('\nNavigating to Shopify Admin...');
  await page.goto(`${SHOPIFY_ADMIN_BASE}/orders`, { waitUntil: 'domcontentloaded' });

  const currentUrl = page.url();
  if (currentUrl.includes('accounts.shopify.com') || currentUrl.includes('login')) {
    console.log('\n========================================');
    console.log('Please log in to Shopify in the browser window.');
    console.log('Waiting for login... (5 min timeout)');
    console.log('========================================\n');

    // Wait until we're on the admin orders page (auto-detect login)
    await page.waitForURL(`${SHOPIFY_ADMIN_BASE}/**`, { timeout: 300000 });
    await page.waitForTimeout(2000);
  }

  console.log('Logged in to Shopify Admin!');
}

async function main() {
  const yearMonth = process.argv[2];

  if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
    console.log('Usage: node scripts/download-vat-invoices-persistent.mjs YYYY-MM');
    console.log('Example: node scripts/download-vat-invoices-persistent.mjs 2025-11');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  VAT Invoice Downloader for ${yearMonth}`);
  console.log(`${'='.repeat(50)}\n`);

  const orders = await getOrdersForMonth(yearMonth);
  if (orders.length === 0) {
    console.log('No orders found.');
    return;
  }

  const outputDir = createOutputDir(yearMonth);
  console.log(`Output: ${outputDir}\n`);

  const ordersToDownload = orders.filter(o => !isAlreadyDownloaded(outputDir, o.order_number));
  const skipped = orders.length - ordersToDownload.length;

  if (skipped > 0) console.log(`Skipping ${skipped} already downloaded`);
  if (ordersToDownload.length === 0) {
    console.log('All invoices downloaded!');
    return;
  }

  console.log(`Downloading ${ordersToDownload.length} invoices...\n`);

  // Create persistent browser context
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    acceptDownloads: true,
  });

  const page = context.pages()[0] || await context.newPage();

  // Wait for login if needed
  await waitForShopifyLogin(page);

  const results = { downloaded: 0, noInvoice: 0, failed: 0 };

  for (let i = 0; i < ordersToDownload.length; i++) {
    const order = ordersToDownload[i];
    process.stdout.write(`[${i + 1}/${ordersToDownload.length}] ${order.order_number}... `);

    const result = await downloadVatInvoice(page, order, outputDir);

    if (result.success) {
      console.log(`OK - ${result.filename}`);
      results.downloaded++;
    } else if (result.reason === 'no_invoice') {
      console.log('No VAT invoice');
      results.noInvoice++;
    } else {
      console.log(`FAILED - ${result.reason}`);
      results.failed++;
    }

    await page.waitForTimeout(500);
  }

  await context.close();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Downloaded: ${results.downloaded}`);
  console.log(`No invoice: ${results.noInvoice}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`${'='.repeat(50)}`);
  console.log(`\nFiles: ${outputDir}`);
}

main().catch(console.error);
