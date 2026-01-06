import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Increase timeout to 60 seconds for Econt API calls
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// Econt API configuration
const ECONT_API_URL = process.env.ECONT_API_URL || 'https://ee.econt.com/services/Shipments/ShipmentService.getShipmentStatuses.json';
const ECONT_USERNAME = process.env.ECONT_USERNAME;
const ECONT_PASSWORD = process.env.ECONT_PASSWORD;

interface EcontTrackingEvent {
  destinationType: string;
  officeName?: string;
  cityName?: string;
  time: string;
  officeCode?: string;
}

interface EcontShipmentStatus {
  shipmentNumber: string;
  shortDeliveryStatus?: string;
  shortDeliveryStatusEn?: string;
  createdTime?: string;
  sendTime?: string;
  deliveryTime?: string;
  trackingEvents?: EcontTrackingEvent[];
  weight?: number;
  packCount?: number;
  shipmentType?: string;
  senderDeliveryType?: string;
  receiverDeliveryType?: string;
  error?: string;
}

/**
 * Fetch tracking status from Econt API
 */
async function getEcontTrackingStatus(trackingNumbers: string[]): Promise<Map<string, EcontShipmentStatus>> {
  const statusMap = new Map<string, EcontShipmentStatus>();

  if (!ECONT_USERNAME || !ECONT_PASSWORD) {
    console.error('[Econt] Missing credentials');
    return statusMap;
  }

  if (trackingNumbers.length === 0) {
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

  // Process batches in parallel (up to 3 concurrent requests to avoid overwhelming the API)
  const processBatch = async (batch: string[]): Promise<void> => {
    try {
      const response = await fetch(ECONT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          shipmentNumbers: batch,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Econt] API error:', response.status, errorText);
        return;
      }

      const data = await response.json();

      // Handle response - Econt API returns { shipmentStatuses: [{ status: {...}, error: null }] }
      const rawShipments = Array.isArray(data)
        ? data
        : (data.shipments || data.shipmentStatuses || []);

      for (const item of rawShipments) {
        // Econt wraps the actual status in a "status" object
        const shipment: EcontShipmentStatus = item.status || item;
        if (shipment.shipmentNumber) {
          statusMap.set(shipment.shipmentNumber, shipment);
        }
      }
    } catch (error) {
      console.error('[Econt] Batch tracking error:', error);
    }
  };

  // Process all batches (sequentially to be safe with API rate limits)
  for (const batch of batches) {
    await processBatch(batch);
  }

  console.log(`[Econt] Got status for ${statusMap.size} shipments`);
  return statusMap;
}

/**
 * Check if shipment is delivered based on status
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
 * Check if tracking number looks like an Econt tracking number
 * Econt tracking numbers are typically 13 digits starting with 108, 109, 110, etc.
 */
function isEcontTrackingNumber(trackingNumber?: string): boolean {
  if (!trackingNumber) return false;
  // Econt tracking numbers: 13 digits, often starting with 108, 109, 110, 111, etc.
  const econtPattern = /^(108|109|110|111|112)\d{10}$/;
  return econtPattern.test(trackingNumber);
}

/**
 * Check if shipment is returned/refused based on status
 */
function isReturned(status?: string): boolean {
  if (!status) return false;
  const returnedStatuses = [
    'returned', 'върната', 'върнато', 'върнат',
    'refused', 'отказана', 'отказано', 'отказ',
    'неуспешна доставка', 'недоставена',
    'returned to sender', 'върната на подател',
    'върната и доставена към подател', // Exact Econt status
    'анулирана' // Cancelled
  ];
  return returnedStatuses.some(s => status.toLowerCase().includes(s.toLowerCase()));
}

/**
 * GET /api/admin/shopify-orders
 * Returns all Shopify orders from the pending_orders table with Econt tracking status
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status'); // pending, paid, all
    const search = searchParams.get('search')?.trim(); // search by email, name, order number
    const trackingFilter = searchParams.get('tracking'); // all, delivered, in_transit, no_tracking
    const dateRange = searchParams.get('dateRange'); // all, today, week, month

    // Calculate date range boundaries
    let dateFrom: string | null = null;
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      if (dateRange === 'today') {
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        dateFrom = weekAgo.toISOString();
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        dateFrom = monthAgo.toISOString();
      }
    }

    // Get summary stats using proper count queries (not limited to 1000)
    const [
      { count: totalCount },
      { count: paidCount },
      { count: pendingCount },
      { data: paidOrdersData },
      { data: pendingOrdersData }
    ] = await Promise.all([
      supabase.from('pending_orders').select('*', { count: 'exact', head: true }),
      supabase.from('pending_orders').select('*', { count: 'exact', head: true }).not('paid_at', 'is', null),
      supabase.from('pending_orders').select('*', { count: 'exact', head: true }).is('paid_at', null),
      supabase.from('pending_orders').select('total_price').not('paid_at', 'is', null),
      supabase.from('pending_orders').select('total_price').is('paid_at', null)
    ]);

    // For revenue calculations, we need the actual price data (up to 1000 is usually enough for revenue)
    const paidOrders = paidOrdersData || [];
    const pendingOrders = pendingOrdersData || [];

    // Get ALL orders with Econt tracking for status checks (need to paginate to get all)
    let allOrders: any[] = [];
    let fetchOffset = 0;
    const batchSize = 1000;

    while (true) {
      const { data: batch } = await supabase
        .from('pending_orders')
        .select('id, status, total_price, paid_at, tracking_number, tracking_company, order_number')
        .range(fetchOffset, fetchOffset + batchSize - 1);

      if (!batch || batch.length === 0) break;
      allOrders = allOrders.concat(batch);
      if (batch.length < batchSize) break;
      fetchOffset += batchSize;
    }

    console.log(`[Shopify Orders] Fetched ${allOrders.length} orders for tracking stats`);

    // Calculate tracking stats from ALL orders
    // Include orders where tracking_company contains 'econt' OR tracking number looks like Econt format
    const allTrackingNumbers = (allOrders || [])
      .filter(o => o.tracking_number && (
        o.tracking_company?.toLowerCase().includes('econt') ||
        isEcontTrackingNumber(o.tracking_number)
      ))
      .map(o => o.tracking_number);

    // Fetch Econt status for all orders to calculate accurate stats AND for filtering
    const allEcontStatuses = await getEcontTrackingStatus(allTrackingNumbers);

    // Build maps of order ID to delivery/returned status for filtering
    // IMPORTANT: Check isReturned() FIRST because "Върната и доставена към подател"
    // contains "доставена" but means returned TO SENDER, not delivered to customer
    const orderDeliveryStatus = new Map<string, 'delivered' | 'returned' | 'in_transit'>();
    (allOrders || []).forEach(order => {
      if (order.tracking_number) {
        const econtStatus = allEcontStatuses.get(order.tracking_number);
        const statusText = econtStatus?.shortDeliveryStatus || econtStatus?.shortDeliveryStatusEn;
        if (isReturned(statusText)) {
          orderDeliveryStatus.set(order.id, 'returned');
        } else if (isDelivered(statusText)) {
          orderDeliveryStatus.set(order.id, 'delivered');
        } else {
          orderDeliveryStatus.set(order.id, 'in_transit');
        }
      }
    });

    let deliveredCount = 0;
    let inTransitCount = 0;
    let returnedCount = 0;
    (allOrders || []).forEach(order => {
      if (order.tracking_number) {
        const status = orderDeliveryStatus.get(order.id);
        if (status === 'delivered') {
          deliveredCount++;
        } else if (status === 'returned') {
          returnedCount++;
        } else {
          inTransitCount++;
        }
      }
    });

    // Helper to check if order is a test order (#1001-#1098)
    const isTestOrder = (orderNumber: string | null | undefined): boolean => {
      if (!orderNumber) return false;
      const num = parseInt(orderNumber.replace('#', ''), 10);
      return num >= 1001 && num <= 1098;
    };

    // Exclude test orders (#1001-#1098) from "Без Tracking" count
    const noTrackingCount = (allOrders || []).filter(o =>
      !o.tracking_number && !isTestOrder(o.order_number)
    ).length;
    const withTrackingCount = (allOrders || []).filter(o => o.tracking_number).length;

    // For tracking filters (delivered, in_transit), we need to filter by IDs
    let filteredOrderIds: string[] | null = null;

    if (trackingFilter === 'delivered') {
      filteredOrderIds = (allOrders || [])
        .filter(o => o.tracking_number && orderDeliveryStatus.get(o.id) === 'delivered')
        .map(o => o.id);
    } else if (trackingFilter === 'in_transit') {
      filteredOrderIds = (allOrders || [])
        .filter(o => o.tracking_number && orderDeliveryStatus.get(o.id) === 'in_transit')
        .map(o => o.id);
    } else if (trackingFilter === 'returned') {
      filteredOrderIds = (allOrders || [])
        .filter(o => o.tracking_number && orderDeliveryStatus.get(o.id) === 'returned')
        .map(o => o.id);
    } else if (trackingFilter === 'no_tracking') {
      // Exclude test orders (#1001-#1098) from "Без Tracking" filter
      filteredOrderIds = (allOrders || [])
        .filter(o => !o.tracking_number && !isTestOrder(o.order_number))
        .map(o => o.id);
    }

    // Build the query
    let query = supabase
      .from('pending_orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search && search.length > 0) {
      query = query.or(`email.ilike.%${search}%,customer_name.ilike.%${search}%,order_number.ilike.%${search}%,tracking_number.ilike.%${search}%`);
    }

    // Apply status filter (payment status)
    if (status && status !== 'all') {
      if (status === 'paid') {
        query = query.not('paid_at', 'is', null);
      } else if (status === 'pending') {
        query = query.is('paid_at', null);
      }
    }

    // Apply date range filter
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    // Apply tracking filter by IDs if set
    if (filteredOrderIds !== null) {
      if (filteredOrderIds.length === 0) {
        // No matching orders, return empty result
        return NextResponse.json({
          success: true,
          orders: [],
          count: 0,
          summary: {
            total: totalCount || 0,
            paid: paidCount || 0,
            pending: pendingCount || 0,
            totalRevenue: paidOrders.reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0),
            pendingRevenue: pendingOrders.reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0),
            withTracking: withTrackingCount,
            delivered: deliveredCount,
            inTransit: inTransitCount,
            returned: returnedCount,
            noTracking: noTrackingCount,
          },
          pagination: {
            page,
            limit,
            totalPages: 0,
            totalItems: 0,
          },
        });
      }
      query = query.in('id', filteredOrderIds);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Collect tracking numbers for Econt lookup (for displaying status in table)
    // Include orders where tracking_company contains 'econt' OR tracking number looks like Econt format
    const trackingNumbers = orders
      ?.filter(o => o.tracking_number && (
        o.tracking_company?.toLowerCase().includes('econt') ||
        isEcontTrackingNumber(o.tracking_number)
      ))
      .map(o => o.tracking_number) || [];

    // Use the already-fetched Econt statuses instead of fetching again
    // (allEcontStatuses already has all tracking statuses)

    // Transform orders to match expected format with Econt data
    const transformedOrders = orders?.map(order => {
      const econtStatus = order.tracking_number ? allEcontStatuses.get(order.tracking_number) : undefined;
      const statusText = econtStatus?.shortDeliveryStatus || econtStatus?.shortDeliveryStatusEn;
      // Check returned FIRST (same logic as above)
      const econtReturned = isReturned(statusText);
      const econtDelivered = !econtReturned && isDelivered(statusText);

      return {
        id: order.id,
        shopify_order_id: order.order_id,
        shopify_order_number: order.order_number,
        customer_email: order.email,
        customer_name: order.customer_name,
        customer_phone: order.phone,
        shipping_address: order.shipping_address,
        products: order.products,
        total_price: order.total_price,
        currency: order.currency,
        status: order.status,
        is_paid: order.paid_at !== null,
        paid_at: order.paid_at,
        created_at: order.created_at,
        updated_at: order.updated_at,
        tracking_number: order.tracking_number,
        tracking_url: order.tracking_url,
        tracking_company: order.tracking_company,
        fulfillment_status: order.fulfillment_status,
        // Econt tracking data
        econt_status: econtStatus?.shortDeliveryStatus,
        econt_status_en: econtStatus?.shortDeliveryStatusEn,
        econt_delivery_time: econtStatus?.deliveryTime,
        econt_events: econtStatus?.trackingEvents,
        econt_error: econtStatus?.error,
        is_delivered: econtDelivered,
        is_returned: econtReturned,
      };
    }) || [];

    const summary = {
      total: totalCount || 0,
      paid: paidCount || 0,
      pending: pendingCount || 0,
      totalRevenue: paidOrders.reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0),
      pendingRevenue: pendingOrders.reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0),
      // Tracking stats (for ALL orders)
      withTracking: withTrackingCount,
      delivered: deliveredCount,
      inTransit: inTransitCount,
      returned: returnedCount,
      noTracking: noTrackingCount,
    };

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      count: count,
      summary,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        totalItems: count || 0,
      },
    });
  } catch (error: any) {
    console.error('Error in shopify-orders API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
