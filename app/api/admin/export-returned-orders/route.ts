import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

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
    const rawShipments = Array.isArray(data)
      ? data
      : (data.shipments || data.shipmentStatuses || []);

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
 * Check if shipment is returned/refused based on status
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
 * GET /api/admin/export-returned-orders
 * Returns CSV of returned orders for a specific month
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearMonth = searchParams.get('month'); // Format: YYYY-MM

    if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
      return NextResponse.json(
        { error: 'Missing or invalid month parameter. Use format: YYYY-MM' },
        { status: 400 }
      );
    }

    const [year, month] = yearMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    // Get all orders for the month with tracking numbers
    const { data: orders, error } = await supabase
      .from('pending_orders')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .not('tracking_number', 'is', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'No orders found for this month' }, { status: 404 });
    }

    // Get Econt tracking numbers
    const trackingNumbers = orders
      .filter(o => o.tracking_company?.toLowerCase().includes('econt'))
      .map(o => o.tracking_number);

    // Fetch Econt statuses
    const econtStatuses = await getEcontTrackingStatus(trackingNumbers);

    // Filter to only returned orders
    const returnedOrders = orders.filter(order => {
      if (!order.tracking_number) return false;
      const econtStatus = econtStatuses.get(order.tracking_number);
      const statusText = econtStatus?.shortDeliveryStatus || econtStatus?.shortDeliveryStatusEn;
      return isReturned(statusText);
    });

    if (returnedOrders.length === 0) {
      // Return empty CSV with headers
      const headers = 'Order Number,Customer Name,Email,Phone,Total Price,Currency,Order Date,Tracking Number,Econt Status\n';
      return new Response(headers, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="returned_orders_${yearMonth}.csv"`,
        },
      });
    }

    // Build CSV
    const csvHeader = 'Order Number,Customer Name,Email,Phone,Total Price,Currency,Order Date,Tracking Number,Econt Status\n';
    const csvRows = returnedOrders.map(order => {
      const econtStatus = econtStatuses.get(order.tracking_number);
      const statusText = econtStatus?.shortDeliveryStatus || econtStatus?.shortDeliveryStatusEn || '';

      return [
        order.order_number,
        `"${(order.customer_name || '').replace(/"/g, '""')}"`,
        order.email,
        order.phone || '',
        order.total_price,
        order.currency || 'BGN',
        order.created_at?.slice(0, 10) || '',
        order.tracking_number,
        `"${statusText.replace(/"/g, '""')}"`,
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="returned_orders_${yearMonth}.csv"`,
      },
    });

  } catch (error: any) {
    console.error('Error exporting returned orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export returned orders' },
      { status: 500 }
    );
  }
}
