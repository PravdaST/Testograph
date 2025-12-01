import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filters
    const searchQuery = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const registrationStatus = searchParams.get('registrationStatus'); // 'registered', 'not_registered', 'all'

    // Build query for quiz_results_v2
    let query = supabase
      .from('quiz_results_v2')
      .select('*', { count: 'exact' });

    // Apply filters
    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (level) {
      query = query.eq('determined_level', level);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: quizResults, error, count } = await query;

    if (error) {
      console.error('Error fetching quiz results:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get all unique emails from quiz results
    const emails = [...new Set(quizResults?.map(r => r.email).filter(Boolean))];

    // Fetch user data for these emails from users table
    const { data: usersData } = await supabase
      .from('users')
      .select('email, id, has_active_subscription, subscription_expires_at, current_day, created_at, category, current_level')
      .in('email', emails);

    // Fetch profile data (for shopify info and last login) - profiles are linked by user id
    const userIds = usersData?.map(u => u.id).filter(Boolean) || [];
    const { data: profilesData } = userIds.length > 0
      ? await supabase
          .from('profiles')
          .select('id, shopify_customer_id, total_spent, onboarding_completed, last_login_at')
          .in('id', userIds)
      : { data: [] };

    // Create lookup maps
    const usersByEmail = new Map(usersData?.map(u => [u.email, u]) || []);
    const profilesById = new Map(profilesData?.map(p => [p.id, p]) || []);

    // Enrich quiz results with user journey data
    const enrichedResults = quizResults?.map(quiz => {
      const user = usersByEmail.get(quiz.email);
      const profile = user ? profilesById.get(user.id) : null;

      return {
        ...quiz,
        // User journey data
        userJourney: {
          isRegistered: !!user,
          registeredAt: user?.created_at || null,
          hasActiveSubscription: user?.has_active_subscription || false,
          subscriptionExpiresAt: user?.subscription_expires_at || null,
          currentDay: user?.current_day || null,
          lastSignIn: profile?.last_login_at || null,
          userId: user?.id || null,
          // Profile/Purchase data
          hasPurchased: !!profile?.shopify_customer_id || (profile?.total_spent || 0) > 0,
          totalSpent: profile?.total_spent || 0,
          onboardingCompleted: profile?.onboarding_completed || false,
        }
      };
    }) || [];

    // Filter by registration status if specified
    let filteredResults = enrichedResults;
    if (registrationStatus === 'registered') {
      filteredResults = enrichedResults.filter(r => r.userJourney.isRegistered);
    } else if (registrationStatus === 'not_registered') {
      filteredResults = enrichedResults.filter(r => !r.userJourney.isRegistered);
    }

    // Calculate statistics
    const { data: allQuizData } = await supabase
      .from('quiz_results_v2')
      .select('total_score, category, determined_level, email');

    // Get all registered users count
    const allQuizEmails = [...new Set(allQuizData?.map(r => r.email).filter(Boolean))];
    const { data: allUsersData } = await supabase
      .from('users')
      .select('email, has_active_subscription')
      .in('email', allQuizEmails);

    const registeredEmails = new Set(allUsersData?.map(u => u.email) || []);
    const subscribedEmails = new Set(allUsersData?.filter(u => u.has_active_subscription).map(u => u.email) || []);

    const stats = {
      total: count || 0,
      avgScore: allQuizData ? calculateAverage(allQuizData.map(r => r.total_score)) : 0,
      byCategory: {
        energy: allQuizData?.filter(r => r.category === 'energy').length || 0,
        libido: allQuizData?.filter(r => r.category === 'libido').length || 0,
        muscle: allQuizData?.filter(r => r.category === 'muscle').length || 0,
      },
      byLevel: {
        beginner: allQuizData?.filter(r => r.determined_level === 'beginner').length || 0,
        intermediate: allQuizData?.filter(r => r.determined_level === 'intermediate').length || 0,
        advanced: allQuizData?.filter(r => r.determined_level === 'advanced').length || 0,
      },
      // Conversion stats
      conversion: {
        totalQuizSubmissions: allQuizEmails.length,
        registeredInApp: registeredEmails.size,
        withSubscription: subscribedEmails.size,
        registrationRate: allQuizEmails.length > 0
          ? Math.round((registeredEmails.size / allQuizEmails.length) * 100)
          : 0,
        subscriptionRate: registeredEmails.size > 0
          ? Math.round((subscribedEmails.size / registeredEmails.size) * 100)
          : 0,
        notRegisteredCount: allQuizEmails.length - registeredEmails.size,
      }
    };

    return NextResponse.json({
      success: true,
      results: filteredResults,
      count: registrationStatus ? filteredResults.length : (count || 0),
      limit,
      offset,
      stats
    });

  } catch (error: any) {
    console.error('Error in quiz results API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quiz results' },
      { status: 500 }
    );
  }
}

function calculateAverage(numbers: (number | null)[]): number {
  const validNumbers = numbers.filter(n => n !== null && !isNaN(n)) as number[];
  if (validNumbers.length === 0) return 0;
  const sum = validNumbers.reduce((acc, n) => acc + n, 0);
  return Math.round((sum / validNumbers.length) * 10) / 10;
}
