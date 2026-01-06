import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Increase timeout to 60 seconds for Econt + Shopify API calls
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// Shopify API configuration
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '9j8fjr-64.myshopify.com';
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
  status: 'synced' | 'already_synced' | 'failed' | 'no_fulfillment' | 'cancelled';
  message?: string;
  paymentMarked?: boolean;
  econtStatus?: string;
}

/**
 * Fetch tracking status from Econt API with batching (max 1000 per request)
 */
async function getEcontTrackingStatus(trackingNumbers: string[]): Promise<Map<string, EcontShipmentStatus>> {
  const statusMap = new Map<string, EcontShipmentStatus>();

  if (!ECONT_USERNAME || !ECONT_PASSWORD || trackingNumbers.length === 0) {
    return statusMap;
  }

  // Econt API limits to 1000 shipments per request - batch them
  const BATCH_SIZE = 1000;
  const batches: string[][] = [];
  for (let i = 0; i < trackingNumbers.length; i += BATCH_SIZE) {
    batches.push(trackingNumbers.slice(i, i + BATCH_SIZE));
  }

  console.log(`[Econt] Processing ${trackingNumbers.length} tracking numbers in ${batches.length} batch(es)`);

  const authHeader = 'Basic ' + Buffer.from(`${ECONT_USERNAME}:${ECONT_PASSWORD}`).toString('base64');

  const processBatch = async (batch: string[]): Promise<void> => {
    try {
      const response = await fetch(ECONT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ shipmentNumbers: batch }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Econt] API error:', response.status, errorText);
        return;
      }

      const data = await response.json();
      const rawShipments = Array.isArray(data) ? data : (data.shipments || data.shipmentStatuses || []);

      for (const item of rawShipments) {
        const shipment: EcontShipmentStatus = item.status || item;
        if (shipment.shipmentNumber) {
          statusMap.set(shipment.shipmentNumber, shipment);
        }
      }
    } catch (error) {
      console.error('[Econt] Batch tracking error:', error);
    }
  };

  // Process all batches sequentially
  for (const batch of batches) {
    await processBatch(batch);
  }

  console.log(`[Econt] Got status for ${statusMap.size} shipments`);
  return statusMap;
}

/**
 * Check if tracking number looks like an Econt tracking number
 * Econt tracking numbers are typically 13 digits starting with 108, 109, 110, etc.
 */
function isEcontTrackingNumber(trackingNumber?: string): boolean {
  if (!trackingNumber) return false;
  const econtPattern = /^(108|109|110|111|112)\d{10}$/;
  return econtPattern.test(trackingNumber);
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
 * Check if shipment is returned/refused
 */
function isReturned(status?: string): boolean {
  if (!status) return false;
  const returnedStatuses = [
    'returned', 'върната', 'върнато', 'върнат',
    'refused', 'отказана', 'отказано', 'отказ',
    'неуспешна доставка', 'недоставена',
    'returned to sender', 'върната на подател',
    'върната и доставена към подател',
    'анулирана'
  ];
  return returnedStatuses.some(s => status.toLowerCase().includes(s.toLowerCase()));
}

/**
 * Get order details from Shopify including financial status
 */
async function getShopifyOrder(orderId: string): Promise<{
  id: string;
  financial_status: string;
  total_price: string;
  currency: string;
  cancelled_at: string | null;
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
        cancelled_at: order.cancelled_at,
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
 */
async function markOrderAsPaid(orderId: string): Promise<boolean> {
  if (!SHOPIFY_ACCESS_TOKEN) return false;

  try {
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

    console.log(`[Shopify] Marking order ${orderId} as paid...`);

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

    if (!response.ok) {
      console.error(`[Shopify] Failed to mark as paid: ${response.status} ${responseText}`);
      return false;
    }

    const data = JSON.parse(responseText);

    if (data.errors && data.errors.length > 0) {
      console.error(`[Shopify] GraphQL errors:`, data.errors);
      return false;
    }

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
 * Cancel order in Shopify (for returned/refused shipments)
 */
async function cancelShopifyOrder(orderId: string, reason: string): Promise<boolean> {
  if (!SHOPIFY_ACCESS_TOKEN) return false;

  try {
    console.log(`[Shopify] Cancelling order ${orderId} - reason: ${reason}`);

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders/${orderId}/cancel.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'customer', // customer, fraud, inventory, declined, other
          email: false, // Don't send cancellation email
          restock: false, // Don't restock items
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Shopify] Failed to cancel order: ${response.status} ${errorText}`);
      return false;
    }

    console.log(`[Shopify] Order ${orderId} cancelled successfully`);
    return true;
  } catch (error) {
    console.error(`[Shopify] Error cancelling order:`, error);
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
 * Update local database when order is synced
 */
async function updateLocalOrderStatus(orderId: string, isPaid: boolean, isCancelled: boolean): Promise<void> {
  try {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (isPaid) {
      updates.paid_at = new Date().toISOString();
      updates.status = 'paid';
    }

    if (isCancelled) {
      updates.status = 'cancelled';
    }

    await supabase
      .from('pending_orders')
      .update(updates)
      .eq('order_id', orderId);
  } catch (error) {
    console.error(`[DB] Error updating order ${orderId}:`, error);
  }
}

/**
 * POST /api/admin/sync-delivery-status
 * Syncs delivered/returned orders from Econt to Shopify
 * NOW ONLY PROCESSES PENDING (UNPAID) ORDERS
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const testOrderId = body.testOrderId;
    const batchSize = Math.min(body.batchSize || 25, 50);
    const offset = body.offset || 0;

    if (!SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Missing Shopify access token' },
        { status: 500 }
      );
    }

    // Get ONLY PENDING orders with Econt tracking (paid_at IS NULL)
    let query = supabase
      .from('pending_orders')
      .select('id, order_id, order_number, tracking_number, tracking_company, fulfillment_status, paid_at')
      .not('tracking_number', 'is', null);

    // Only filter pending if not testing specific order
    if (!testOrderId) {
      query = query.is('paid_at', null); // Only pending (unpaid) orders
    } else {
      query = query.eq('order_id', testOrderId);
    }

    const { data: allOrders, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter to only include Econt orders
    const orders = allOrders?.filter(o =>
      o.tracking_company?.toLowerCase().includes('econt') ||
      isEcontTrackingNumber(o.tracking_number)
    ) || [];

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending orders with Econt tracking found',
        results: [],
        summary: { total: 0, synced: 0, alreadySynced: 0, failed: 0, noFulfillment: 0, paymentMarked: 0, cancelled: 0 },
        batch: { processed: 0, remaining: 0, isComplete: true },
      });
    }

    console.log(`[Sync] Found ${orders.length} pending orders with Econt tracking`);

    // Get Econt status for all tracking numbers
    const trackingNumbers = orders.map(o => o.tracking_number);
    const econtStatuses = await getEcontTrackingStatus(trackingNumbers);

    // Separate orders by Econt status
    const deliveredOrders: typeof orders = [];
    const returnedOrders: typeof orders = [];

    for (const order of orders) {
      const econtStatus = econtStatuses.get(order.tracking_number);
      const statusText = econtStatus?.shortDeliveryStatus || econtStatus?.shortDeliveryStatusEn;

      if (isDelivered(statusText)) {
        deliveredOrders.push(order);
      } else if (isReturned(statusText)) {
        returnedOrders.push(order);
      }
    }

    console.log(`[Sync] Delivered: ${deliveredOrders.length}, Returned: ${returnedOrders.length}`);

    // Combine for processing
    const ordersToProcess = [...deliveredOrders, ...returnedOrders];
    const totalToProcess = ordersToProcess.length;

    // Apply batch pagination
    const batchOrders = ordersToProcess.slice(offset, offset + batchSize);
    const remaining = Math.max(0, totalToProcess - offset - batchOrders.length);
    const isComplete = remaining === 0;

    console.log(`[Sync] Processing batch: ${batchOrders.length} orders (offset: ${offset}, total: ${totalToProcess}, remaining: ${remaining})`);

    const results: SyncResult[] = [];
    let synced = 0;
    let alreadySynced = 0;
    let failed = 0;
    let noFulfillment = 0;
    let paymentMarkedCount = 0;
    let cancelledCount = 0;

    const API_DELAY = 800;

    for (const order of batchOrders) {
      await new Promise(resolve => setTimeout(resolve, API_DELAY));

      const econtStatus = econtStatuses.get(order.tracking_number);
      const statusText = econtStatus?.shortDeliveryStatus || econtStatus?.shortDeliveryStatusEn || 'Unknown';
      const orderIsDelivered = isDelivered(statusText);
      const orderIsReturned = isReturned(statusText);

      // Get order details from Shopify
      const shopifyOrder = await getShopifyOrder(order.order_id);

      if (!shopifyOrder) {
        results.push({
          orderId: order.order_id,
          orderNumber: order.order_number,
          trackingNumber: order.tracking_number,
          status: 'failed',
          message: 'Could not fetch order from Shopify',
          econtStatus: statusText,
        });
        failed++;
        continue;
      }

      const messages: string[] = [];

      // Handle RETURNED orders - cancel in Shopify
      if (orderIsReturned) {
        if (shopifyOrder.cancelled_at) {
          messages.push('Already cancelled');
          results.push({
            orderId: order.order_id,
            orderNumber: order.order_number,
            trackingNumber: order.tracking_number,
            status: 'already_synced',
            message: messages.join(', '),
            econtStatus: statusText,
          });
          alreadySynced++;
        } else {
          if (!dryRun) {
            await new Promise(resolve => setTimeout(resolve, API_DELAY));
            const cancelSuccess = await cancelShopifyOrder(order.order_id, statusText);
            if (cancelSuccess) {
              messages.push('Cancelled in Shopify');
              await updateLocalOrderStatus(order.order_id, false, true);
              cancelledCount++;
              results.push({
                orderId: order.order_id,
                orderNumber: order.order_number,
                trackingNumber: order.tracking_number,
                status: 'cancelled',
                message: messages.join(', '),
                econtStatus: statusText,
              });
              synced++;
            } else {
              messages.push('Failed to cancel');
              results.push({
                orderId: order.order_id,
                orderNumber: order.order_number,
                trackingNumber: order.tracking_number,
                status: 'failed',
                message: messages.join(', '),
                econtStatus: statusText,
              });
              failed++;
            }
          } else {
            messages.push('[DRY RUN] Would cancel');
            cancelledCount++;
            results.push({
              orderId: order.order_id,
              orderNumber: order.order_number,
              trackingNumber: order.tracking_number,
              status: 'cancelled',
              message: messages.join(', '),
              econtStatus: statusText,
            });
            synced++;
          }
        }
        continue;
      }

      // Handle DELIVERED orders - mark as paid + delivered
      if (orderIsDelivered) {
        await new Promise(resolve => setTimeout(resolve, API_DELAY));
        const fulfillment = await getShopifyFulfillment(order.order_id);

        let deliveryMarked = false;
        let paymentMarked = false;

        // Check/update delivery status
        if (!fulfillment) {
          messages.push('No fulfillment found');
          noFulfillment++;
        } else if (fulfillment.status === 'delivered') {
          messages.push('Already delivered');
          deliveryMarked = true;
        } else {
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

        // Check/update payment status
        const isPaid = shopifyOrder.financial_status === 'paid' ||
                       shopifyOrder.financial_status === 'partially_paid' ||
                       shopifyOrder.financial_status === 'refunded' ||
                       shopifyOrder.financial_status === 'partially_refunded';

        if (isPaid) {
          messages.push('Already paid');
          paymentMarked = true;
        } else {
          if (!dryRun) {
            await new Promise(resolve => setTimeout(resolve, API_DELAY));
            const paymentSuccess = await markOrderAsPaid(order.order_id);
            if (paymentSuccess) {
              messages.push('Marked as paid');
              paymentMarked = true;
              paymentMarkedCount++;
              await updateLocalOrderStatus(order.order_id, true, false);
            } else {
              messages.push('Failed to mark paid');
            }
          } else {
            messages.push('[DRY RUN] Would mark paid');
            paymentMarked = true;
            paymentMarkedCount++;
          }
        }

        // Determine result status
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
            econtStatus: statusText,
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
            econtStatus: statusText,
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
            econtStatus: statusText,
          });
          failed++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      message: dryRun
        ? `[DRY RUN] Would sync ${synced} orders (${paymentMarkedCount} paid, ${cancelledCount} cancelled)`
        : `Synced ${synced} orders (${paymentMarkedCount} marked as paid, ${cancelledCount} cancelled)`,
      summary: {
        total: batchOrders.length,
        synced,
        alreadySynced,
        failed,
        noFulfillment,
        paymentMarked: paymentMarkedCount,
        cancelled: cancelledCount,
        pendingOrdersChecked: orders.length,
        deliveredFound: deliveredOrders.length,
        returnedFound: returnedOrders.length,
      },
      batch: {
        offset,
        batchSize,
        processed: batchOrders.length,
        totalToProcess,
        remaining,
        isComplete,
        nextOffset: isComplete ? null : offset + batchOrders.length,
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
 * Returns statistics about pending orders that need syncing
 */
export async function GET() {
  try {
    // Get ONLY PENDING orders with Econt tracking
    const { data: allOrders, error } = await supabase
      .from('pending_orders')
      .select('id, order_id, order_number, tracking_number, tracking_company')
      .not('tracking_number', 'is', null)
      .is('paid_at', null); // Only pending (unpaid) orders

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter to only include Econt orders
    const orders = allOrders?.filter(o =>
      o.tracking_company?.toLowerCase().includes('econt') ||
      isEcontTrackingNumber(o.tracking_number)
    ) || [];

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        pendingWithTracking: 0,
        deliveredCount: 0,
        returnedCount: 0,
        message: 'No pending orders with Econt tracking found',
      });
    }

    // Get Econt status for all tracking numbers
    const trackingNumbers = orders.map(o => o.tracking_number);
    const econtStatuses = await getEcontTrackingStatus(trackingNumbers);

    // Count by status
    let deliveredCount = 0;
    let returnedCount = 0;
    let inTransitCount = 0;

    for (const order of orders) {
      const econtStatus = econtStatuses.get(order.tracking_number);
      const statusText = econtStatus?.shortDeliveryStatus || econtStatus?.shortDeliveryStatusEn;

      if (isDelivered(statusText)) {
        deliveredCount++;
      } else if (isReturned(statusText)) {
        returnedCount++;
      } else {
        inTransitCount++;
      }
    }

    return NextResponse.json({
      success: true,
      pendingWithTracking: orders.length,
      deliveredCount,
      returnedCount,
      inTransitCount,
      message: `Found ${deliveredCount} delivered + ${returnedCount} returned orders to sync (${inTransitCount} still in transit)`,
    });

  } catch (error: any) {
    console.error('Error getting sync stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get sync stats' },
      { status: 500 }
    );
  }
}
