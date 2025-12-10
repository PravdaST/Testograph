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

// Rate limiting - simple in-memory store (in production, use Redis)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

// CORS headers for Shopify store
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://shop.testograph.eu',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
  error?: string;
}

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recentRequests = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

/**
 * Fetch tracking status from Econt API for a single tracking number
 */
async function getEcontTrackingStatus(trackingNumber: string): Promise<EcontShipmentStatus | null> {
  if (!ECONT_USERNAME || !ECONT_PASSWORD) {
    console.error('[Econt] Missing credentials');
    return null;
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${ECONT_USERNAME}:${ECONT_PASSWORD}`).toString('base64');

    const response = await fetch(ECONT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        shipmentNumbers: [trackingNumber],
      }),
    });

    if (!response.ok) {
      console.error('[Econt] API error:', response.status);
      return null;
    }

    const data = await response.json();
    const rawShipments = Array.isArray(data)
      ? data
      : (data.shipments || data.shipmentStatuses || []);

    if (rawShipments.length > 0) {
      const item = rawShipments[0];
      return item.status || item;
    }

    return null;
  } catch (error) {
    console.error('[Econt] Tracking error:', error);
    return null;
  }
}

/**
 * Get delivery status in Bulgarian
 */
function getStatusBg(status?: string): string {
  if (!status) return 'Неизвестен';

  const statusLower = status.toLowerCase();

  if (statusLower.includes('deliver') || statusLower.includes('достав') || statusLower.includes('получен') || statusLower.includes('връчен')) {
    return 'Доставена';
  }
  if (statusLower.includes('return') || statusLower.includes('върнат') || statusLower.includes('отказ')) {
    return 'Върната';
  }
  if (statusLower.includes('transit') || statusLower.includes('транзит') || statusLower.includes('на път')) {
    return 'В транзит';
  }
  if (statusLower.includes('processing') || statusLower.includes('обработ')) {
    return 'В обработка';
  }

  return status;
}

/**
 * Get status type for styling
 */
function getStatusType(status?: string): 'delivered' | 'returned' | 'in_transit' | 'processing' | 'unknown' {
  if (!status) return 'unknown';

  const statusLower = status.toLowerCase();

  if (statusLower.includes('deliver') || statusLower.includes('достав') || statusLower.includes('получен') || statusLower.includes('връчен')) {
    return 'delivered';
  }
  if (statusLower.includes('return') || statusLower.includes('върнат') || statusLower.includes('отказ')) {
    return 'returned';
  }
  if (statusLower.includes('transit') || statusLower.includes('транзит') || statusLower.includes('на път')) {
    return 'in_transit';
  }
  if (statusLower.includes('processing') || statusLower.includes('обработ')) {
    return 'processing';
  }

  return 'in_transit'; // Default to in transit
}

/**
 * OPTIONS - Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * GET /api/public/track?tracking=1080039456459
 * Returns order tracking status from Econt
 */
export async function GET(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Твърде много заявки. Моля, изчакайте минута.',
          error_code: 'RATE_LIMITED'
        },
        { status: 429, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('tracking')?.trim();

    // Validate tracking number
    if (!trackingNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Моля, въведете tracking номер.',
          error_code: 'MISSING_TRACKING'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Basic validation - Econt tracking numbers are typically 13 digits
    if (!/^\d{10,15}$/.test(trackingNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Невалиден tracking номер. Моля, проверете и опитайте отново.',
          error_code: 'INVALID_TRACKING'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Look up order in our database (optional - for additional order info)
    const { data: order } = await supabase
      .from('pending_orders')
      .select('order_number, created_at, total_price, currency')
      .eq('tracking_number', trackingNumber)
      .single();

    // Fetch live status from Econt
    const econtStatus = await getEcontTrackingStatus(trackingNumber);

    if (!econtStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Не можахме да намерим информация за тази пратка. Моля, проверете номера и опитайте отново.',
          error_code: 'NOT_FOUND'
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // Format timeline events (reverse chronological)
    const timeline = (econtStatus.trackingEvents || [])
      .map(event => ({
        time: event.time,
        event: event.destinationType || 'Събитие',
        location: [event.officeName, event.cityName].filter(Boolean).join(', ') || 'Неизвестно',
      }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Build response
    const response = {
      success: true,
      tracking_number: trackingNumber,
      order: order ? {
        order_number: order.order_number,
        created_at: order.created_at,
        total_price: order.total_price,
        currency: order.currency || 'BGN',
      } : null,
      delivery: {
        status: getStatusType(econtStatus.shortDeliveryStatus || econtStatus.shortDeliveryStatusEn),
        status_bg: getStatusBg(econtStatus.shortDeliveryStatus || econtStatus.shortDeliveryStatusEn),
        status_raw: econtStatus.shortDeliveryStatus || econtStatus.shortDeliveryStatusEn,
        delivered_at: econtStatus.deliveryTime || null,
        sent_at: econtStatus.sendTime || null,
        created_at: econtStatus.createdTime || null,
        carrier: 'Econt',
      },
      timeline,
    };

    return NextResponse.json(response, { headers: corsHeaders });

  } catch (error) {
    console.error('[Public Track API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Възникна грешка. Моля, опитайте по-късно.',
        error_code: 'SERVER_ERROR'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
