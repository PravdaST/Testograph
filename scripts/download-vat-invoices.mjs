/**
 * Bulk VAT Invoice Downloader for Shopify
 *
 * This script downloads all VAT invoices from Shopify for a specified month.
 * It uses Playwright to navigate to each order and extract the VAT invoice PDF.
 *
 * Usage:
 *   node scripts/download-vat-invoices.mjs 2024-12
 *   node scripts/download-vat-invoices.mjs 2024-11
 *
 * The script will:
 * 1. Open a browser window
 * 2. Navigate to Shopify Admin - you may need to log in manually
 * 3. Process each order and download VAT invoices
 * 4. Save to vat-invoices/YYYY-MM/ folder
 */

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
const SHOPIFY_STORE_ID = '9j8fjr-64';
const SHOPIFY_ADMIN_BASE = `https://admin.shopify.com/store/${SHOPIFY_STORE_ID}`;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Get all orders for a specific month from Supabase
 */
async function getOrdersForMonth(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  console.log(`Fetching orders from ${startDate.slice(0, 10)} to ${endDate.slice(0, 10)}...`);

  const { data: orders, error } = await supabase
    .from('pending_orders')
    .select('id, order_id, order_number, email, customer_name, total_price, created_at, paid_at, status')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  console.log(`Found ${orders.length} orders for ${yearMonth}`);
  return orders;
}

/**
 * Create output directory for the month
 */
function createOutputDir(yearMonth) {
  const outputDir = path.join(__dirname, '..', 'vat-invoices', yearMonth);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  return outputDir;
}

/**
 * Check if invoice is already downloaded
 */
function isAlreadyDownloaded(outputDir, orderNumber) {
  const cleanNumber = orderNumber.replace('#', '');
  const files = fs.readdirSync(outputDir);
  return files.some(f => f.includes(cleanNumber));
}

/**
 * Wait for user to log in to Shopify
 */
async function waitForShopifyLogin(page) {
  console.log('\nNavigating to Shopify Admin...');
  await page.goto(`${SHOPIFY_ADMIN_BASE}/orders`, { waitUntil: 'domcontentloaded' });

  // Check if we need to log in
  const currentUrl = page.url();
  if (currentUrl.includes('accounts.shopify.com') || currentUrl.includes('login')) {
    console.log('\n========================================');
    console.log('Please log in to Shopify in the browser window.');
    console.log('The script will continue automatically after login.');
    console.log('========================================\n');

    // Wait until we're on the admin orders page
    await page.waitForURL(`${SHOPIFY_ADMIN_BASE}/**`, { timeout: 300000 }); // 5 min timeout for login
    await page.waitForTimeout(2000);
  }

  console.log('Logged in to Shopify Admin!');
}

/**
 * Extract VAT invoice download URL from order page
 */
async function extractVatInvoiceUrl(page) {
  return await page.evaluate(() => {
    // Method 1: Look for direct download links
    const downloadLinks = Array.from(document.querySelectorAll('a[href*="tax_invoices"][href*="download"]'));
    if (downloadLinks.length > 0) {
      return downloadLinks[0].href;
    }

    // Method 2: Search in page HTML for the pattern
    const html = document.body.innerHTML;
    const patterns = [
      /href="([^"]*\/tax_invoices\/[^"]*\/download\/[^"]+\.pdf)"/,
      /(\/orders\/\d+\/tax_invoices\/[a-f0-9-]+\/download\/vat_invoice_[^"'\s]+\.pdf)/,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let url = match[1];
        if (!url.startsWith('http')) {
          url = 'https://admin.shopify.com/store/9j8fjr-64' + url;
        }
        return url;
      }
    }

    // Method 3: Look for "VAT invoice" text and find nearby link
    const vatElements = Array.from(document.querySelectorAll('*')).filter(el =>
      el.textContent?.toLowerCase().includes('vat invoice') ||
      el.textContent?.toLowerCase().includes('фактура')
    );

    for (const el of vatElements) {
      const link = el.querySelector('a[href*="download"]') || el.closest('a[href*="download"]');
      if (link?.href?.includes('tax_invoices')) {
        return link.href;
      }
    }

    return null;
  });
}

/**
 * Download VAT invoice for a single order
 */
async function downloadVatInvoice(page, order, outputDir) {
  const orderUrl = `${SHOPIFY_ADMIN_BASE}/orders/${order.order_id}`;
  const cleanOrderNumber = order.order_number.replace('#', '');

  try {
    // Navigate to order page
    await page.goto(orderUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Extract VAT invoice URL
    const vatInvoiceUrl = await extractVatInvoiceUrl(page);

    if (!vatInvoiceUrl) {
      return { success: false, reason: 'no_invoice' };
    }

    // Extract invoice number from URL
    const invoiceMatch = vatInvoiceUrl.match(/vat_invoice_(\d+)\.pdf/);
    const invoiceNumber = invoiceMatch ? invoiceMatch[1] : cleanOrderNumber;

    // Create filename: VAT_InvoiceNumber_OrderNumber.pdf
    const filename = `VAT_${invoiceNumber}_order${cleanOrderNumber}.pdf`;
    const filepath = path.join(outputDir, filename);

    // Set up download handler
    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });

    // Navigate to download URL
    const [download] = await Promise.all([
      downloadPromise.catch(() => null),
      page.goto(vatInvoiceUrl, { timeout: 20000 }).catch(() => null),
    ]);

    if (download) {
      await download.saveAs(filepath);
      return { success: true, filename };
    }

    // If no download event, try to get the response body directly
    const response = await page.goto(vatInvoiceUrl, { timeout: 20000 });
    if (response && response.ok()) {
      const buffer = await response.body();
      if (buffer && buffer.length > 0) {
        fs.writeFileSync(filepath, buffer);
        return { success: true, filename };
      }
    }

    return { success: false, reason: 'download_failed' };

  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Generate returned orders report
 */
async function generateReturnedOrdersReport(yearMonth, outputDir) {
  const [year, month] = yearMonth.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  // Get all orders with tracking for the month
  const { data: orders, error } = await supabase
    .from('pending_orders')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .not('tracking_number', 'is', null);

  if (error || !orders) {
    console.error('Error fetching orders for returned report:', error);
    return;
  }

  // Note: We can't determine returned status without Econt API call here
  // This report will be generated from the admin panel which has real-time Econt status

  const reportPath = path.join(outputDir, `orders_summary_${yearMonth}.csv`);
  const csvHeader = 'Order Number,Customer Name,Email,Total Price,Date,Status,Tracking Number\n';
  const csvRows = orders.map(o =>
    `${o.order_number},"${o.customer_name || ''}","${o.email}",${o.total_price},${o.created_at?.slice(0, 10)},${o.paid_at ? 'paid' : 'pending'},${o.tracking_number || ''}`
  ).join('\n');

  fs.writeFileSync(reportPath, csvHeader + csvRows);
  console.log(`\nOrders summary saved to: ${reportPath}`);
  console.log('Note: For returned orders list, use the /admin/shopify-orders page with "Returned" filter.');
}

/**
 * Main function
 */
async function main() {
  const yearMonth = process.argv[2];

  if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
    console.log('Usage: node scripts/download-vat-invoices.mjs YYYY-MM');
    console.log('Example: node scripts/download-vat-invoices.mjs 2024-12');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  VAT Invoice Downloader for ${yearMonth}`);
  console.log(`${'='.repeat(50)}\n`);

  // Get orders for the month
  const orders = await getOrdersForMonth(yearMonth);

  if (orders.length === 0) {
    console.log('No orders found for this month.');
    return;
  }

  // Create output directory
  const outputDir = createOutputDir(yearMonth);
  console.log(`Output directory: ${outputDir}\n`);

  // Filter out already downloaded invoices
  const ordersToDownload = [];
  const alreadyDownloaded = [];

  for (const order of orders) {
    if (isAlreadyDownloaded(outputDir, order.order_number)) {
      alreadyDownloaded.push(order.order_number);
    } else {
      ordersToDownload.push(order);
    }
  }

  if (alreadyDownloaded.length > 0) {
    console.log(`Skipping ${alreadyDownloaded.length} already downloaded invoices`);
  }

  if (ordersToDownload.length === 0) {
    console.log('\nAll invoices already downloaded!');
    await generateReturnedOrdersReport(yearMonth, outputDir);
    return;
  }

  console.log(`\nWill download ${ordersToDownload.length} invoices...\n`);

  // Launch browser
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    acceptDownloads: true,
  });

  const page = await context.newPage();

  // Wait for Shopify login
  await waitForShopifyLogin(page);

  // Track results
  const results = {
    downloaded: [],
    noInvoice: [],
    failed: [],
  };

  // Process each order
  for (let i = 0; i < ordersToDownload.length; i++) {
    const order = ordersToDownload[i];
    const progress = `[${i + 1}/${ordersToDownload.length}]`;
    process.stdout.write(`${progress} ${order.order_number} (${order.customer_name || order.email})... `);

    const result = await downloadVatInvoice(page, order, outputDir);

    if (result.success) {
      console.log(`OK - ${result.filename}`);
      results.downloaded.push({ order: order.order_number, file: result.filename });
    } else if (result.reason === 'no_invoice') {
      console.log('No VAT invoice');
      results.noInvoice.push(order.order_number);
    } else {
      console.log(`FAILED - ${result.reason}`);
      results.failed.push({ order: order.order_number, reason: result.reason });
    }

    // Small delay between requests
    await page.waitForTimeout(1000);
  }

  // Close browser
  await browser.close();

  // Generate orders summary report
  await generateReturnedOrdersReport(yearMonth, outputDir);

  // Print summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  Download Complete!`);
  console.log(`${'='.repeat(50)}`);
  console.log(`  Downloaded:    ${results.downloaded.length}`);
  console.log(`  No invoice:    ${results.noInvoice.length}`);
  console.log(`  Failed:        ${results.failed.length}`);
  console.log(`  Already had:   ${alreadyDownloaded.length}`);
  console.log(`${'='.repeat(50)}`);
  console.log(`\nFiles saved to: ${outputDir}`);

  if (results.failed.length > 0) {
    console.log('\nFailed orders:');
    results.failed.forEach(f => console.log(`  - ${f.order} (${f.reason})`));
  }

  if (results.noInvoice.length > 0) {
    console.log('\nOrders without VAT invoice:');
    results.noInvoice.forEach(o => console.log(`  - ${o}`));
  }
}

main().catch(console.error);
