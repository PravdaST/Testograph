import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface OperationsCustomer {
  id: string;
  email: string;
  customerName: string | null;
  orderId: string;
  orderTotal: number;
  orderDate: string;
  paymentStatus: 'paid' | 'pending' | 'cancelled';
  productType: string | null;
  bottles: number;
  capsules: number;
  // Quiz data
  quizCompleted: boolean;
  quizCategory: string | null;
  quizLevel: string | null;
  quizScore: number | null;
  quizDate: string | null;
  // App access data
  hasAppAccess: boolean;
  capsulesRemaining: number;
  isRegisteredInApp: boolean;
  appRegistrationDate: string | null;
  // Derived status
  operationalStatus: 'active' | 'pending_payment' | 'needs_quiz' | 'needs_activation' | 'inactive';
}

/**
 * GET /api/admin/operations
 *
 * Comprehensive operations management view:
 * - All Shopify orders (paid + pending)
 * - Quiz completion status
 * - App access status
 * - Actionable insights for operations
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const filter = searchParams.get('filter'); // 'all', 'paid', 'pending', 'needs_quiz', 'needs_activation'
    const search = searchParams.get('search') || '';

    // 1. Get ALL orders from pending_orders (source of truth for all Shopify orders)
    let ordersQuery = supabase
      .from('pending_orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filter === 'paid') {
      ordersQuery = ordersQuery.eq('status', 'paid');
    } else if (filter === 'pending') {
      ordersQuery = ordersQuery.eq('status', 'pending');
    }

    if (search) {
      ordersQuery = ordersQuery.or(`email.ilike.%${search}%,customer_name.ilike.%${search}%,shopify_order_id.ilike.%${search}%`);
    }

    const { data: orders, error: ordersError, count: totalOrders } = await ordersQuery;

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        customers: [],
        total: 0,
        stats: getEmptyStats(),
      });
    }

    // 2. Get unique emails from orders
    const emails = [...new Set(orders.map(o => o.email).filter(Boolean))];

    // 3. Batch fetch quiz results for these emails
    const { data: quizResults } = await supabase
      .from('quiz_results_v2')
      .select('email, category, determined_level, total_score, created_at')
      .in('email', emails)
      .order('created_at', { ascending: false });

    // Get most recent quiz per email
    const quizByEmail = new Map<string, typeof quizResults[0]>();
    quizResults?.forEach(quiz => {
      if (!quizByEmail.has(quiz.email)) {
        quizByEmail.set(quiz.email, quiz);
      }
    });

    // 4. Batch fetch inventory (app access) for these emails
    const { data: inventoryData } = await supabase
      .from('testoup_inventory')
      .select('email, capsules_remaining, bottles_purchased, last_purchase_date')
      .in('email', emails);

    const inventoryByEmail = new Map(inventoryData?.map(i => [i.email, i]) || []);

    // 5. Batch fetch app registration from users table
    const { data: usersData } = await supabase
      .from('users')
      .select('email, id, has_active_subscription, created_at')
      .in('email', emails);

    const usersByEmail = new Map(usersData?.map(u => [u.email, u]) || []);

    // 6. Enrich orders with all data
    const customers: OperationsCustomer[] = orders.map(order => {
      const email = order.email;
      const quiz = quizByEmail.get(email);
      const inventory = inventoryByEmail.get(email);
      const user = usersByEmail.get(email);

      const isPaid = order.status === 'paid';
      const hasQuiz = !!quiz;
      const hasAccess = (inventory?.capsules_remaining || 0) > 0;
      const isRegistered = !!user;

      // Determine operational status
      let operationalStatus: OperationsCustomer['operationalStatus'];
      if (!isPaid) {
        operationalStatus = 'pending_payment';
      } else if (!hasQuiz) {
        operationalStatus = 'needs_quiz';
      } else if (!hasAccess && isPaid) {
        operationalStatus = 'needs_activation';
      } else if (hasAccess) {
        operationalStatus = 'active';
      } else {
        operationalStatus = 'inactive';
      }

      return {
        id: order.id,
        email: email,
        customerName: order.customer_name || null,
        orderId: order.shopify_order_id,
        orderTotal: parseFloat(order.order_total) || 0,
        orderDate: order.created_at,
        paymentStatus: order.status as 'paid' | 'pending' | 'cancelled',
        productType: order.product_type,
        bottles: order.bottles_purchased || 0,
        capsules: order.capsules_to_add || 0,
        // Quiz
        quizCompleted: hasQuiz,
        quizCategory: quiz?.category || null,
        quizLevel: quiz?.determined_level || null,
        quizScore: quiz?.total_score || null,
        quizDate: quiz?.created_at || null,
        // App
        hasAppAccess: hasAccess,
        capsulesRemaining: inventory?.capsules_remaining || 0,
        isRegisteredInApp: isRegistered,
        appRegistrationDate: user?.created_at || null,
        // Status
        operationalStatus,
      };
    });

    // 7. Apply status filter (needs to be done after enrichment)
    let filteredCustomers = customers;
    if (filter === 'needs_quiz') {
      filteredCustomers = customers.filter(c => c.paymentStatus === 'paid' && !c.quizCompleted);
    } else if (filter === 'needs_activation') {
      filteredCustomers = customers.filter(c => c.paymentStatus === 'paid' && !c.hasAppAccess);
    } else if (filter === 'active') {
      filteredCustomers = customers.filter(c => c.operationalStatus === 'active');
    }

    // 8. Apply pagination
    const paginatedCustomers = filteredCustomers.slice(offset, offset + limit);

    // 9. Calculate stats
    const stats = calculateStats(customers);

    return NextResponse.json({
      success: true,
      customers: paginatedCustomers,
      total: filter && filter !== 'all' && filter !== 'paid' && filter !== 'pending'
        ? filteredCustomers.length
        : (totalOrders || 0),
      stats,
    });

  } catch (error: any) {
    console.error('Error fetching operations data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch operations data' },
      { status: 500 }
    );
  }
}

function calculateStats(customers: OperationsCustomer[]) {
  const total = customers.length;
  const paid = customers.filter(c => c.paymentStatus === 'paid').length;
  const pending = customers.filter(c => c.paymentStatus === 'pending').length;
  const withQuiz = customers.filter(c => c.quizCompleted).length;
  const withAccess = customers.filter(c => c.hasAppAccess).length;
  const registered = customers.filter(c => c.isRegisteredInApp).length;

  const paidCustomers = customers.filter(c => c.paymentStatus === 'paid');
  const needsQuiz = paidCustomers.filter(c => !c.quizCompleted).length;
  const needsActivation = paidCustomers.filter(c => !c.hasAppAccess).length;
  const active = paidCustomers.filter(c => c.hasAppAccess && c.quizCompleted).length;

  const totalRevenue = customers
    .filter(c => c.paymentStatus === 'paid')
    .reduce((sum, c) => sum + c.orderTotal, 0);

  const pendingRevenue = customers
    .filter(c => c.paymentStatus === 'pending')
    .reduce((sum, c) => sum + c.orderTotal, 0);

  return {
    totalOrders: total,
    paidOrders: paid,
    pendingOrders: pending,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    pendingRevenue: Math.round(pendingRevenue * 100) / 100,
    // Funnel stats
    withQuiz,
    withoutQuiz: paid - withQuiz,
    withAccess,
    registered,
    // Actionable
    needsQuiz,
    needsActivation,
    activeUsers: active,
    // Rates
    quizCompletionRate: paid > 0 ? Math.round((withQuiz / paid) * 100) : 0,
    activationRate: paid > 0 ? Math.round((withAccess / paid) * 100) : 0,
    registrationRate: paid > 0 ? Math.round((registered / paid) * 100) : 0,
  };
}

function getEmptyStats() {
  return {
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    withQuiz: 0,
    withoutQuiz: 0,
    withAccess: 0,
    registered: 0,
    needsQuiz: 0,
    needsActivation: 0,
    activeUsers: 0,
    quizCompletionRate: 0,
    activationRate: 0,
    registrationRate: 0,
  };
}
