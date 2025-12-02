import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// Verify Shopify webhook signature
function verifyShopifyWebhook(body: string, signature: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured');
    return false;
  }

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(signature)
  );
}

// Check if product is a trial/sample pack
function isTrialProduct(sku: string, title: string): boolean {
  const skuLower = (sku || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  if (skuLower.includes('trial')) return true;
  if (skuLower.includes('s14')) return true;
  if (skuLower.includes('7d')) return true;

  if (titleLower.includes('7-дневен')) return true;
  if (titleLower.includes('7 дневен')) return true;
  if (titleLower.includes('проба')) return true;
  if (titleLower.includes('пробен')) return true;

  return false;
}

interface ShopifyWebhookOrder {
  id: number;
  order_number: number;
  email: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  } | null;
  shipping_address: {
    first_name: string;
    last_name: string;
    name: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string | null;
    country: string;
    zip: string;
    phone: string | null;
  } | null;
  billing_address: {
    first_name: string;
    last_name: string;
    name: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string | null;
    country: string;
    zip: string;
    phone: string | null;
  } | null;
  phone: string | null;
  line_items: Array<{
    title: string;
    quantity: number;
    sku: string;
    price: string;
  }>;
}

/**
 * POST /api/webhooks/shopify/orders
 * Receives order webhooks from Shopify (orders/create, orders/paid)
 * Webhooks contain FULL PII data even on Basic plan!
 */
export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-shopify-hmac-sha256') || '';
    const topic = request.headers.get('x-shopify-topic') || '';

    console.log(`[Shopify Webhook] Received topic: ${topic}`);

    // Verify signature
    if (!verifyShopifyWebhook(rawBody, signature)) {
      console.error('[Shopify Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const order: ShopifyWebhookOrder = JSON.parse(rawBody);

    console.log(`[Shopify Webhook] Processing order #${order.order_number} (ID: ${order.id})`);
    console.log(`[Shopify Webhook] Customer: ${order.customer?.first_name} ${order.customer?.last_name}`);
    console.log(`[Shopify Webhook] Shipping: ${order.shipping_address?.name}, ${order.shipping_address?.address1}, ${order.shipping_address?.city}`);

    // Check if order already exists
    const { data: existing } = await supabase
      .from('pending_orders')
      .select('id, status')
      .eq('order_id', order.id.toString())
      .single();

    // Extract product info
    const products = order.line_items.map(li => {
      const isTrial = isTrialProduct(li.sku, li.title);
      return {
        title: li.title,
        quantity: li.quantity,
        sku: li.sku,
        type: isTrial ? 'trial' : 'full',
        capsules: isTrial ? 10 : 60,
        totalCapsules: (isTrial ? 10 : 60) * li.quantity
      };
    });

    // Extract phone from multiple sources
    const phone = order.shipping_address?.phone
      || order.billing_address?.phone
      || order.customer?.phone
      || order.phone
      || null;

    // Get customer name from multiple sources
    const getCustomerName = (): string | null => {
      if (order.customer?.first_name || order.customer?.last_name) {
        const firstName = order.customer.first_name || '';
        const lastName = order.customer.last_name || '';
        const name = `${firstName} ${lastName}`.trim();
        if (name && name !== 'undefined' && name !== 'undefined undefined') {
          return name;
        }
      }
      if (order.shipping_address?.name) {
        return order.shipping_address.name;
      }
      if (order.shipping_address?.first_name || order.shipping_address?.last_name) {
        const firstName = order.shipping_address.first_name || '';
        const lastName = order.shipping_address.last_name || '';
        const name = `${firstName} ${lastName}`.trim();
        if (name && name !== 'undefined') {
          return name;
        }
      }
      if (order.billing_address?.name) {
        return order.billing_address.name;
      }
      return null;
    };

    const customerName = getCustomerName();
    const customerEmail = order.email || order.customer?.email || '';
    const isPaid = order.financial_status === 'paid';

    if (existing) {
      // Update existing order (e.g., when payment is received)
      console.log(`[Shopify Webhook] Updating existing order ${order.id}`);

      const updateData: Record<string, any> = {
        customer_name: customerName,
        phone,
        shipping_address: order.shipping_address,
        products,
      };

      // Update payment status if order is now paid
      if (isPaid && existing.status !== 'paid') {
        updateData.status = 'paid';
        updateData.paid_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('pending_orders')
        .update(updateData)
        .eq('id', existing.id);

      if (updateError) {
        console.error('[Shopify Webhook] Update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      console.log(`[Shopify Webhook] Order ${order.id} updated successfully`);
    } else {
      // Insert new order
      console.log(`[Shopify Webhook] Creating new order ${order.id}`);

      const { error: insertError } = await supabase
        .from('pending_orders')
        .insert({
          order_id: order.id.toString(),
          order_number: order.order_number.toString(),
          email: customerEmail,
          customer_name: customerName,
          total_price: parseFloat(order.total_price),
          currency: order.currency,
          status: isPaid ? 'paid' : 'pending',
          products,
          shipping_address: order.shipping_address,
          phone,
          created_at: order.created_at,
          paid_at: isPaid ? order.created_at : null,
        });

      if (insertError) {
        console.error('[Shopify Webhook] Insert error:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      console.log(`[Shopify Webhook] Order ${order.id} created successfully`);
    }

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: any) {
    console.error('[Shopify Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Shopify sends GET requests to verify webhook URL
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
