import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// Check if product is a digital product (not capsules)
function isDigitalProduct(sku: string, title: string): boolean {
  const skuLower = (sku || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  // TESTOGRAPH and related digital products
  if (skuLower.includes('testograph')) return true;
  if (titleLower.includes('testograph')) return true;

  // Digital guides by SKU
  const digitalSkus = [
    'exercise-guide',
    'meal-planner',
    'lab-testing',
    'sleep-protocol',
    'supplement-timing',
  ];
  if (digitalSkus.some(ds => skuLower.includes(ds))) return true;

  // Digital guides by title keywords
  if (titleLower.includes('ръководство')) return true;
  if (titleLower.includes('guide')) return true;
  if (titleLower.includes('book')) return true;
  if (titleLower.includes('книга')) return true;
  if (titleLower.includes('planner')) return true;
  if (titleLower.includes('protocol')) return true;

  return false;
}

/**
 * POST /api/admin/fix-testograph-capsules
 * Fixes existing orders where digital products incorrectly have capsules count
 * Digital products (TESTOGRAPH, guides, etc.) should have capsules = 0
 */
export async function POST() {
  try {
    // Get all orders
    const { data: allOrders, error: allError } = await supabase
      .from('pending_orders')
      .select('id, order_number, products');

    if (allError) {
      return NextResponse.json({ error: allError.message }, { status: 500 });
    }

    // Filter orders that contain digital products with capsules > 0
    const ordersToFix = allOrders?.filter(order => {
      if (!order.products || !Array.isArray(order.products)) return false;
      return order.products.some((p: any) => {
        const isDigital = isDigitalProduct(p.sku, p.title);
        return isDigital && (p.capsules > 0 || p.totalCapsules > 0);
      });
    }) || [];

    let updatedCount = 0;
    const errors: string[] = [];

    for (const order of ordersToFix) {
      const updatedProducts = order.products.map((p: any) => {
        if (isDigitalProduct(p.sku, p.title)) {
          return {
            ...p,
            type: 'digital',
            capsules: 0,
            totalCapsules: 0
          };
        }
        return p;
      });

      const { error: updateError } = await supabase
        .from('pending_orders')
        .update({ products: updatedProducts })
        .eq('id', order.id);

      if (updateError) {
        errors.push(`Order #${order.order_number}: ${updateError.message}`);
      } else {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${updatedCount} orders with digital products`,
      totalFound: ordersToFix.length,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('[Fix Digital Products] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix digital product capsules' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Count orders with digital products that have capsules > 0
    const { data: allOrders, error } = await supabase
      .from('pending_orders')
      .select('id, order_number, products');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const ordersToFix = allOrders?.filter(order => {
      if (!order.products || !Array.isArray(order.products)) return false;
      return order.products.some((p: any) => {
        const isDigital = isDigitalProduct(p.sku, p.title);
        return isDigital && (p.capsules > 0 || p.totalCapsules > 0);
      });
    }) || [];

    return NextResponse.json({
      message: `Found ${ordersToFix.length} orders with digital products that need fixing`,
      count: ordersToFix.length,
      sampleOrders: ordersToFix.slice(0, 5).map(o => ({
        orderNumber: o.order_number,
        products: o.products
      }))
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
