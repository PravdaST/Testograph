import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// Shopify API configuration
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'shop.testograph.eu';
const SHOPIFY_MYSHOPIFY_DOMAIN = '9j8fjr-64.myshopify.com'; // Required for GraphQL API
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = '2024-01';

// Econt API configuration
const ECONT_API_URL = process.env.ECONT_API_URL || 'https://ee.econt.com/services/Shipments/ShipmentService.getShipmentStatuses.json';
const ECONT_USERNAME = process.env.ECONT_USERNAME;
const ECONT_PASSWORD = process.env.ECONT_PASSWORD;

interface EcontShipmentStatus {
  shipmentNumber: string;
  shortDeliveryStatus?: string;
  shortDeliveryStatusEn?: string;
  deliveryTime?: string;
}

interface SyncResult {
  orderId: string;
  orderNumber: string;
  trackingNumber: string;
  status: 'synced' | 'already_synced' | 'failed' | 'no_fulfillment';
  message?: string;
  paymentMarked?: boolean;
}

/**
 * Fetch tracking status from Econt API
 */
async function getEcontTrackingStatus(trackingNumbers: string[]): Promise<Map<string, EcontShipmentStatus>> {
  const statusMap = new Map<string, EcontShipmentStatus>();

  if (!ECONT_USERNAME || !ECONT_PASSWORD || trackingNumbers.length === 0) {
    return statusMap;
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${ECONT_USERNAME}:${ECONT_PASSWORD}`).toString('base64');

    const response = await fetch(ECONT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ shipmentNumbers: trackingNumbers }),
    });

    if (!response.ok) return statusMap;

    const data = await response.json();
    const rawShipments = Array.isArray(data) ? data : (data.shipments || data.shipmentStatuses || []);

    for (const item of rawShipments) {
      const shipment: EcontShipmentStatus = item.status || item;
      if (shipment.shipmentNumber) {
        statusMap.set(shipment.shipmentNumber, shipment);
      }
    }

    return statusMap;
  } catch (error) {
    console.error('[Econt] Tracking error:', error);
    return statusMap;
  }
}

/**
 * Check if shipment is delivered
 */
function isDelivered(status?: string): boolean {
  if (!status) return false;
  const deliveredStatuses = [
    'delivered', 'доставена', 'получена', 'връчена',
    'delivered to recipient', 'доставено на получател'
  ];
  return deliveredStatuses.some(s => status.toLowerCase().includes(s.toLowerCase()));
}

/**
 * Get order details from Shopify including financial status
 */
async function getShopifyOrder(orderId: string): Promise<{
  id: string;
  financial_status: string;
  total_price: string;
  currency: string;
} | null> {
  if (!SHOPIFY_ACCESS_TOKEN) return null;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders/${orderId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const order = data.order;

    if (order) {
      return {
        id: order.id,
        financial_status: order.financial_status,
        total_price: order.total_price,
        currency: order.currency,
      };
    }

    return null;
  } catch (error) {
    console.error(`[Shopify] Error fetching order ${orderId}:`, error);
    return null;
  }
}

/**
 * Mark order as paid in Shopify using GraphQL API
 * Uses orderMarkAsPaid mutation which works for manual payment gateways like COD
 */
async function markOrderAsPaid(orderId: string, amount: string, currency: string): Promise<boolean> {
  if (!SHOPIFY_ACCESS_TOKEN) return false;

  try {
    // Convert numeric order ID to Shopify GraphQL global ID format
    const globalOrderId = `gid://shopify/Order/${orderId}`;

    const mutation = `
      mutation orderMarkAsPaid($input: OrderMarkAsPaidInput!) {
        orderMarkAsPaid(input: $input) {
          order {
            id
            displayFinancialStatus
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        id: globalOrderId,
      },
    };

    console.log(`[Shopify] Marking order ${orderId} as paid via GraphQL...`);

    const response = await fetch(
      `https://${SHOPIFY_MYSHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: mutation, variables }),
      }
    );

    const responseText = await response.text();
    console.log(`[Shopify] GraphQL response for ${orderId}: ${response.status} ${responseText}`);

    if (!response.ok) {
      console.error(`[Shopify] Failed to mark as paid: ${response.status} ${responseText}`);
      return false;
    }

    const data = JSON.parse(responseText);

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      console.error(`[Shopify] GraphQL errors:`, data.errors);
      return false;
    }

    // Check for user errors
    const userErrors = data.data?.orderMarkAsPaid?.userErrors || [];
    if (userErrors.length > 0) {
      console.error(`[Shopify] User errors:`, userErrors);
      return false;
    }

    const financialStatus = data.data?.orderMarkAsPaid?.order?.displayFinancialStatus;
    console.log(`[Shopify] Order ${orderId} financial status: ${financialStatus}`);

    return financialStatus === 'PAID' || financialStatus === 'PARTIALLY_PAID';
  } catch (error) {
    console.error(`[Shopify] Error marking order as paid:`, error);
    return false;
  }
}

/**
 * Get fulfillment for an order from Shopify
 */
async function getShopifyFulfillment(orderId: string): Promise<{ id: string; status: string } | null> {
  if (!SHOPIFY_ACCESS_TOKEN) return null;

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders/${orderId}/fulfillments.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const fulfillments = data.fulfillments || [];

    // Return the first fulfillment (most orders have one)
    if (fulfillments.length > 0) {
      return {
        id: fulfillments[0].id,
        status: fulfillments[0].shipment_status || fulfillments[0].status,
      };
    }

    return null;
  } catch (error) {
    console.error(`[Shopify] Error fetching fulfillment for order ${orderId}:`, error);
    return null;
  }
}

/**
 * Update fulfillment status in Shopify to "delivered"
 */
async function markFulfillmentDelivered(orderId: string, fulfillmentId: string): Promise<boolean> {
  if (!SHOPIFY_ACCESS_TOKEN) return false;

  try {
    // Create a fulfillment event with status "delivered"
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders/${orderId}/fulfillments/${fulfillmentId}/events.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            status: 'delivered',
            message: 'Delivered (synced from Econt tracking)',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Shopify] Failed to mark delivered: ${response.status} ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[Shopify] Error marking fulfillment delivered:`, error);
    return false;
  }
}

/**
 * POST /api/admin/sync-delivery-status
 * Syncs delivered orders from Econt to Shopify
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const testOrderId = body.testOrderId; // Optional: test with single order

    if (!SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Missing Shopify access token' },
        { status: 500 }
      );
    }

    // Get orders with Econt tracking (or single order if testOrderId provided)
    let query = supabase
      .from('pending_orders')
      .select('id, order_id, order_number, tracking_number, tracking_company, fulfillment_status')
      .not('tracking_number', 'is', null)
      .ilike('tracking_company', '%econt%');

    if (testOrderId) {
      query = query.eq('order_id', testOrderId);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orders with Econt tracking found',
        results: [],
        summary: { total: 0, synced: 0, alreadySynced: 0, failed: 0, noFulfillment: 0, paymentMarked: 0 },
      });
    }

    // Get Econt status for all tracking numbers
    const trackingNumbers = orders.map(o => o.tracking_number);
    const econtStatuses = await getEcontTrackingStatus(trackingNumbers);

    // Filter to only delivered orders
    const deliveredOrders = orders.filter(order => {
      const econtStatus = econtStatuses.get(order.tracking_number);
      const statusText = econtStatus?.shortDeliveryStatus || econtStatus?.shortDeliveryStatusEn;
      return isDelivered(statusText);
    });

    console.log(`[Sync] Found ${deliveredOrders.length} delivered orders out of ${orders.length} total`);

    const results: SyncResult[] = [];
    let synced = 0;
    let alreadySynced = 0;
    let failed = 0;
    let noFulfillment = 0;
    let paymentMarkedCount = 0;

    // Process each delivered order
    // Shopify rate limit: 2 requests/second = 500ms between calls
    // We make up to 4 calls per order, so need 2+ seconds per order to be safe
    const API_DELAY = 800; // 800ms between each API call

    for (const order of deliveredOrders) {
      // Initial delay before processing each order
      await new Promise(resolve => setTimeout(resolve, API_DELAY));

      // Get order details from Shopify (for financial status and amount)
      const shopifyOrder = await getShopifyOrder(order.order_id);

      if (!shopifyOrder) {
        results.push({
          orderId: order.order_id,
          orderNumber: order.order_number,
          trackingNumber: order.tracking_number,
          status: 'failed',
          message: 'Could not fetch order from Shopify',
        });
        failed++;
        continue;
      }

      // Get fulfillment from Shopify
      await new Promise(resolve => setTimeout(resolve, API_DELAY));
      const fulfillment = await getShopifyFulfillment(order.order_id);

      let deliveryMarked = false;
      let paymentMarked = false;
      const messages: string[] = [];

      // Check delivery status and mark as delivered if needed
      if (!fulfillment) {
        messages.push('No fulfillment found');
        noFulfillment++;
      } else if (fulfillment.status === 'delivered') {
        messages.push('Already delivered');
        deliveryMarked = true;
      } else {
        // Mark as delivered
        if (!dryRun) {
          await new Promise(resolve => setTimeout(resolve, API_DELAY));
          const deliverySuccess = await markFulfillmentDelivered(order.order_id, fulfillment.id);
          if (deliverySuccess) {
            messages.push('Marked as delivered');
            deliveryMarked = true;
          } else {
            messages.push('Failed to mark delivered');
          }
        } else {
          messages.push('[DRY RUN] Would mark delivered');
          deliveryMarked = true;
        }
      }

      // Check payment status and mark as paid if needed
      const isPaid = shopifyOrder.financial_status === 'paid' ||
                     shopifyOrder.financial_status === 'partially_paid' ||
                     shopifyOrder.financial_status === 'refunded' ||
                     shopifyOrder.financial_status === 'partially_refunded';

      if (isPaid) {
        messages.push('Already paid');
        paymentMarked = true;
      } else {
        // Mark as paid (COD order - delivery means payment collected)
        if (!dryRun) {
          await new Promise(resolve => setTimeout(resolve, API_DELAY));
          const paymentSuccess = await markOrderAsPaid(
            order.order_id,
            shopifyOrder.total_price,
            shopifyOrder.currency
          );
          if (paymentSuccess) {
            messages.push('Marked as paid');
            paymentMarked = true;
            paymentMarkedCount++;
          } else {
            messages.push('Failed to mark paid');
          }
        } else {
          messages.push('[DRY RUN] Would mark paid');
          paymentMarked = true;
          paymentMarkedCount++;
        }
      }

      // Determine overall status
      const isSuccess = deliveryMarked || paymentMarked;
      const wasAlreadySynced = fulfillment?.status === 'delivered' && isPaid;

      if (wasAlreadySynced) {
        results.push({
          orderId: order.order_id,
          orderNumber: order.order_number,
          trackingNumber: order.tracking_number,
          status: 'already_synced',
          message: messages.join(', '),
          paymentMarked,
        });
        alreadySynced++;
      } else if (isSuccess) {
        results.push({
          orderId: order.order_id,
          orderNumber: order.order_number,
          trackingNumber: order.tracking_number,
          status: 'synced',
          message: messages.join(', '),
          paymentMarked,
        });
        synced++;
      } else {
        results.push({
          orderId: order.order_id,
          orderNumber: order.order_number,
          trackingNumber: order.tracking_number,
          status: 'failed',
          message: messages.join(', '),
          paymentMarked: false,
        });
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      message: dryRun
        ? `[DRY RUN] Would sync ${synced} orders (${paymentMarkedCount} payments)`
        : `Synced ${synced} orders (${paymentMarkedCount} marked as paid)`,
      summary: {
        total: deliveredOrders.length,
        synced,
        alreadySynced,
        failed,
        noFulfillment,
        paymentMarked: paymentMarkedCount,
      },
      results,
    });

  } catch (error: any) {
    console.error('Error syncing delivery status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync delivery status' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync-delivery-status
 * Returns statistics about what would be synced
 */
export async function GET() {
  try {
    // Get all orders with Econt tracking
    const { data: orders, error } = await supabase
      .from('pending_orders')
      .select('id, order_id, order_number, tracking_number, tracking_company')
      .not('tracking_number', 'is', null)
      .ilike('tracking_company', '%econt%');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        totalWithTracking: 0,
        deliveredCount: 0,
        message: 'No orders with Econt tracking found',
      });
    }

    // Get Econt status for all tracking numbers
    const trackingNumbers = orders.map(o => o.tracking_number);
    const econtStatuses = await getEcontTrackingStatus(trackingNumbers);

    // Count delivered orders
    let deliveredCount = 0;
    for (const order of orders) {
      const econtStatus = econtStatuses.get(order.tracking_number);
      const statusText = econtStatus?.shortDeliveryStatus || econtStatus?.shortDeliveryStatusEn;
      if (isDelivered(statusText)) {
        deliveredCount++;
      }
    }

    return NextResponse.json({
      success: true,
      totalWithTracking: orders.length,
      deliveredCount,
      message: `Found ${deliveredCount} delivered orders that can be synced to Shopify`,
    });

  } catch (error: any) {
    console.error('Error getting sync stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get sync stats' },
      { status: 500 }
    );
  }
}
