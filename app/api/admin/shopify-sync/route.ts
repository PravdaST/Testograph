import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface ShopifyAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string | null;
  name: string;
}

interface ShopifyFulfillment {
  id: number;
  tracking_number: string | null;
  tracking_url: string | null;
  tracking_company: string | null;
  tracking_numbers: string[];
  tracking_urls: string[];
  status: string;
}

interface ShopifyOrder {
  id: string;
  order_number: number;
  email: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  fulfillments?: ShopifyFulfillment[];
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  } | null;
  shipping_address: ShopifyAddress | null;
  billing_address: ShopifyAddress | null;
  phone: string | null;
  line_items: Array<{
    title: string;
    quantity: number;
    sku: string;
    price: string;
  }>;
}

// Extract tracking info from fulfillments
function extractTrackingInfo(fulfillments?: ShopifyFulfillment[]): {
  tracking_number: string | null;
  tracking_url: string | null;
  tracking_company: string | null;
  fulfillment_status: string;
} {
  if (!fulfillments || fulfillments.length === 0) {
    return {
      tracking_number: null,
      tracking_url: null,
      tracking_company: null,
      fulfillment_status: 'unfulfilled',
    };
  }

  const fulfillmentWithTracking = fulfillments.find(f =>
    f.tracking_number || (f.tracking_numbers && f.tracking_numbers.length > 0)
  );

  if (fulfillmentWithTracking) {
    return {
      tracking_number: fulfillmentWithTracking.tracking_number ||
        (fulfillmentWithTracking.tracking_numbers?.[0] ?? null),
      tracking_url: fulfillmentWithTracking.tracking_url ||
        (fulfillmentWithTracking.tracking_urls?.[0] ?? null),
      tracking_company: fulfillmentWithTracking.tracking_company,
      fulfillment_status: 'fulfilled',
    };
  }

  return {
    tracking_number: null,
    tracking_url: null,
    tracking_company: null,
    fulfillment_status: fulfillments.some(f => f.status === 'success') ? 'fulfilled' : 'partial',
  };
}

// Check if product is a trial/sample pack
function isTrialProduct(sku: string, title: string): boolean {
  const skuLower = (sku || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  // Check SKU patterns for trial
  if (skuLower.includes('trial')) return true;
  if (skuLower.includes('s14')) return true; // TUP-S14 is trial
  if (skuLower.includes('7d')) return true;

  // Check title patterns for trial
  if (titleLower.includes('7-дневен')) return true;
  if (titleLower.includes('7 дневен')) return true;
  if (titleLower.includes('проба')) return true;
  if (titleLower.includes('пробен')) return true;

  return false;
}

interface SyncResult {
  shopifyOrders: number;
  dbOrders: number;
  missingInDb: ShopifyOrder[];
  missingInShopify: string[];
  statusMismatches: Array<{
    orderId: string;
    shopifyStatus: string;
    dbStatus: string;
  }>;
}

/**
 * GET /api/admin/shopify-sync
 * Fetches all orders from Shopify and compares with database
 */
export async function GET(request: Request) {
  try {
    const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopDomain || !accessToken) {
      return NextResponse.json({
        error: 'Shopify API not configured',
        setup: {
          step1: 'Go to: https://shop.testograph.eu/admin/settings/apps/development',
          step2: 'Create a custom app or use existing one',
          step3: 'Grant permissions: read_orders, read_customers',
          step4: 'Copy Admin API access token',
          step5: 'Add to .env.local: SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_..."',
        }
      }, { status: 400 });
    }

    // Fetch orders from Shopify Admin API (REST)
    const shopifyOrders = await fetchAllShopifyOrders(shopDomain, accessToken);

    // Fetch orders from database
    const { data: dbPurchases } = await supabase
      .from('testoup_purchase_history')
      .select('order_id, email, order_total, order_date, product_type')
      .not('order_id', 'in', '("MANUAL_REFILL","MANUAL_ADD_SHOPIFY")');

    const { data: dbPending } = await supabase
      .from('pending_orders')
      .select('order_id, email, total_price, status, created_at');

    // Create lookup maps
    const dbOrderIds = new Set([
      ...(dbPurchases?.map(p => p.order_id) || []),
      ...(dbPending?.map(p => p.order_id) || [])
    ]);

    const shopifyOrderIds = new Set(shopifyOrders.map(o => o.id.toString()));

    // Find missing orders
    const missingInDb = shopifyOrders.filter(o => !dbOrderIds.has(o.id.toString()));
    const missingInShopify = [...dbOrderIds].filter(id => !shopifyOrderIds.has(id));

    // Check status mismatches
    const statusMismatches: SyncResult['statusMismatches'] = [];
    for (const shopifyOrder of shopifyOrders) {
      const dbPendingOrder = dbPending?.find(p => p.order_id === shopifyOrder.id.toString());
      if (dbPendingOrder) {
        const expectedStatus = shopifyOrder.financial_status === 'paid' ? 'paid' : 'pending';
        if (dbPendingOrder.status !== expectedStatus) {
          statusMismatches.push({
            orderId: shopifyOrder.id.toString(),
            shopifyStatus: shopifyOrder.financial_status,
            dbStatus: dbPendingOrder.status
          });
        }
      }
    }

    const result: SyncResult = {
      shopifyOrders: shopifyOrders.length,
      dbOrders: dbOrderIds.size,
      missingInDb,
      missingInShopify: missingInShopify.filter(id => !id.startsWith('MANUAL')),
      statusMismatches
    };

    return NextResponse.json({
      success: true,
      summary: {
        shopifyTotal: result.shopifyOrders,
        databaseTotal: result.dbOrders,
        missingInDatabase: result.missingInDb.length,
        missingInShopify: result.missingInShopify.length,
        statusMismatches: result.statusMismatches.length,
      },
      details: {
        missingInDb: result.missingInDb.map(o => ({
          orderId: o.id,
          orderNumber: o.order_number,
          email: o.email || o.customer?.email,
          customerName: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : null,
          totalPrice: o.total_price,
          currency: o.currency,
          status: o.financial_status,
          createdAt: o.created_at,
          products: o.line_items.map(li => ({
            title: li.title,
            quantity: li.quantity,
            sku: li.sku
          }))
        })),
        statusMismatches: result.statusMismatches,
      }
    });

  } catch (error: any) {
    console.error('Error syncing with Shopify:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync with Shopify' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/shopify-sync
 * Syncs missing orders from Shopify to database
 */
export async function POST(request: Request) {
  try {
    const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        { error: 'Shopify API not configured' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, orderIds } = body;

    if (action === 'sync-missing') {
      // Fetch specific orders from Shopify
      const shopifyOrders = await fetchAllShopifyOrders(shopDomain, accessToken);
      const ordersToSync = orderIds
        ? shopifyOrders.filter(o => orderIds.includes(o.id.toString()))
        : shopifyOrders;

      let synced = 0;
      let errors: string[] = [];

      for (const order of ordersToSync) {
        try {
          // Check if already exists
          const { data: existing } = await supabase
            .from('pending_orders')
            .select('id')
            .eq('order_id', order.id.toString())
            .single();

          if (existing) continue;

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

          // Get customer name from multiple sources (fallback chain)
          const getCustomerName = (): string | null => {
            // Try customer object first
            if (order.customer?.first_name || order.customer?.last_name) {
              const firstName = order.customer.first_name || '';
              const lastName = order.customer.last_name || '';
              const name = `${firstName} ${lastName}`.trim();
              if (name && name !== 'undefined' && name !== 'undefined undefined') {
                return name;
              }
            }
            // Try shipping address
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
            // Try billing address
            if (order.billing_address?.name) {
              return order.billing_address.name;
            }
            if (order.billing_address?.first_name || order.billing_address?.last_name) {
              const firstName = order.billing_address.first_name || '';
              const lastName = order.billing_address.last_name || '';
              const name = `${firstName} ${lastName}`.trim();
              if (name && name !== 'undefined') {
                return name;
              }
            }
            return null;
          };

          // Insert into pending_orders
          const { error: insertError } = await supabase
            .from('pending_orders')
            .insert({
              order_id: order.id.toString(),
              order_number: order.order_number.toString(),
              email: order.email || order.customer?.email || '',
              customer_name: getCustomerName(),
              total_price: parseFloat(order.total_price),
              currency: order.currency,
              status: order.financial_status === 'paid' ? 'paid' : 'pending',
              products,
              shipping_address: order.shipping_address,
              phone,
              created_at: order.created_at,
              paid_at: order.financial_status === 'paid' ? order.created_at : null,
            });

          if (insertError) {
            errors.push(`Order ${order.id}: ${insertError.message}`);
          } else {
            synced++;
          }
        } catch (err: any) {
          errors.push(`Order ${order.id}: ${err.message}`);
        }
      }

      return NextResponse.json({
        success: true,
        synced,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    if (action === 'fix-status') {
      // Fix status mismatches
      const shopifyOrders = await fetchAllShopifyOrders(shopDomain, accessToken);
      let fixed = 0;

      for (const order of shopifyOrders) {
        if (order.financial_status === 'paid') {
          const { data: dbOrder } = await supabase
            .from('pending_orders')
            .select('id, status')
            .eq('order_id', order.id.toString())
            .single();

          if (dbOrder && dbOrder.status !== 'paid') {
            await supabase
              .from('pending_orders')
              .update({
                status: 'paid',
                paid_at: new Date().toISOString()
              })
              .eq('id', dbOrder.id);
            fixed++;
          }
        }
      }

      return NextResponse.json({ success: true, fixed });
    }

    if (action === 'update-shipping') {
      // Update shipping addresses for existing orders
      const shopifyOrders = await fetchAllShopifyOrders(shopDomain, accessToken);
      let updated = 0;

      for (const order of shopifyOrders) {
        const { data: dbOrder } = await supabase
          .from('pending_orders')
          .select('id, shipping_address, phone')
          .eq('order_id', order.id.toString())
          .single();

        if (dbOrder && (!dbOrder.shipping_address || !dbOrder.phone)) {
          const phone = order.shipping_address?.phone
            || order.billing_address?.phone
            || order.customer?.phone
            || order.phone
            || null;

          await supabase
            .from('pending_orders')
            .update({
              shipping_address: order.shipping_address,
              phone
            })
            .eq('id', dbOrder.id);
          updated++;
        }
      }

      return NextResponse.json({ success: true, updated });
    }

    if (action === 'fix-customer-names') {
      // Fix orders with missing or "undefined" customer names
      const { data: ordersToFix } = await supabase
        .from('pending_orders')
        .select('id, order_id, customer_name, shipping_address')
        .or('customer_name.is.null,customer_name.ilike.%undefined%');

      if (!ordersToFix || ordersToFix.length === 0) {
        return NextResponse.json({ success: true, fixed: 0, message: 'No orders need fixing' });
      }

      const shopifyOrders = await fetchAllShopifyOrders(shopDomain, accessToken);
      const shopifyOrdersMap = new Map(shopifyOrders.map(o => [o.id.toString(), o]));
      let fixed = 0;

      for (const dbOrder of ordersToFix) {
        const shopifyOrder = shopifyOrdersMap.get(dbOrder.order_id);
        if (!shopifyOrder) continue;

        // Get customer name from multiple sources (same logic as insert)
        let customerName: string | null = null;

        // Try customer object first
        if (shopifyOrder.customer?.first_name || shopifyOrder.customer?.last_name) {
          const firstName = shopifyOrder.customer.first_name || '';
          const lastName = shopifyOrder.customer.last_name || '';
          const name = `${firstName} ${lastName}`.trim();
          if (name && name !== 'undefined' && name !== 'undefined undefined') {
            customerName = name;
          }
        }
        // Try shipping address
        if (!customerName && shopifyOrder.shipping_address?.name) {
          customerName = shopifyOrder.shipping_address.name;
        }
        if (!customerName && (shopifyOrder.shipping_address?.first_name || shopifyOrder.shipping_address?.last_name)) {
          const firstName = shopifyOrder.shipping_address.first_name || '';
          const lastName = shopifyOrder.shipping_address.last_name || '';
          const name = `${firstName} ${lastName}`.trim();
          if (name && name !== 'undefined') {
            customerName = name;
          }
        }
        // Try billing address
        if (!customerName && shopifyOrder.billing_address?.name) {
          customerName = shopifyOrder.billing_address.name;
        }
        if (!customerName && (shopifyOrder.billing_address?.first_name || shopifyOrder.billing_address?.last_name)) {
          const firstName = shopifyOrder.billing_address.first_name || '';
          const lastName = shopifyOrder.billing_address.last_name || '';
          const name = `${firstName} ${lastName}`.trim();
          if (name && name !== 'undefined') {
            customerName = name;
          }
        }

        if (customerName) {
          await supabase
            .from('pending_orders')
            .update({ customer_name: customerName })
            .eq('id', dbOrder.id);
          fixed++;
        }
      }

      return NextResponse.json({ success: true, fixed, total: ordersToFix.length });
    }

    if (action === 'sync-tracking') {
      // Sync tracking numbers from Shopify fulfillments
      const shopifyOrders = await fetchAllShopifyOrders(shopDomain, accessToken);
      let updated = 0;

      for (const order of shopifyOrders) {
        // Only process orders that have fulfillments
        if (!order.fulfillments || order.fulfillments.length === 0) continue;

        const trackingInfo = extractTrackingInfo(order.fulfillments);
        if (!trackingInfo.tracking_number) continue;

        const { data: dbOrder } = await supabase
          .from('pending_orders')
          .select('id, tracking_number')
          .eq('order_id', order.id.toString())
          .single();

        // Only update if order exists and tracking number is different or missing
        if (dbOrder && dbOrder.tracking_number !== trackingInfo.tracking_number) {
          const { error } = await supabase
            .from('pending_orders')
            .update({
              tracking_number: trackingInfo.tracking_number,
              tracking_url: trackingInfo.tracking_url,
              tracking_company: trackingInfo.tracking_company,
              fulfillment_status: trackingInfo.fulfillment_status,
            })
            .eq('id', dbOrder.id);

          if (!error) updated++;
        }
      }

      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in Shopify sync:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync' },
      { status: 500 }
    );
  }
}

/**
 * Fetches all orders from Shopify Admin API with pagination
 */
async function fetchAllShopifyOrders(
  shopDomain: string,
  accessToken: string
): Promise<ShopifyOrder[]> {
  const allOrders: ShopifyOrder[] = [];
  let pageInfo: string | null = null;
  const limit = 250;

  do {
    const url = pageInfo
      ? `https://${shopDomain}/admin/api/2024-10/orders.json?limit=${limit}&page_info=${pageInfo}`
      : `https://${shopDomain}/admin/api/2024-10/orders.json?limit=${limit}&status=any`;

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    allOrders.push(...data.orders);

    // Check for next page
    const linkHeader = response.headers.get('Link');
    pageInfo = null;
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<[^>]*page_info=([^>&]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) {
        pageInfo = nextMatch[1];
      }
    }

  } while (pageInfo);

  return allOrders;
}
