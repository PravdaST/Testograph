import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch profiles for user growth
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (profilesError) throw profilesError;

    // Fetch purchases for revenue trend
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('purchased_at, amount')
      .gte('purchased_at', startDate.toISOString())
      .order('purchased_at', { ascending: true });

    if (purchasesError) throw purchasesError;

    // Process user growth data - group by day
    const usersGrowthMap = new Map<string, number>();
    let cumulativeUsers = 0;

    // Get total users before start date
    const { count: previousUsersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', startDate.toISOString());

    cumulativeUsers = previousUsersCount || 0;

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      usersGrowthMap.set(dateKey, cumulativeUsers);
    }

    // Fill in actual user counts (cumulative)
    profiles?.forEach((profile: any) => {
      const dateKey = new Date(profile.created_at).toISOString().split('T')[0];
      cumulativeUsers++;
      usersGrowthMap.set(dateKey, cumulativeUsers);

      // Update all subsequent dates
      const profileDate = new Date(dateKey);
      for (let i = 0; i < days; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + i);
        const checkDateKey = checkDate.toISOString().split('T')[0];

        if (checkDate > profileDate) {
          const current = usersGrowthMap.get(checkDateKey) || cumulativeUsers;
          usersGrowthMap.set(checkDateKey, Math.max(current, cumulativeUsers));
        }
      }
    });

    // Process revenue data - group by day
    const revenueMap = new Map<string, number>();

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      revenueMap.set(dateKey, 0);
    }

    // Fill in actual revenue
    purchases?.forEach((purchase: any) => {
      const dateKey = new Date(purchase.purchased_at).toISOString().split('T')[0];
      const currentRevenue = revenueMap.get(dateKey) || 0;
      revenueMap.set(dateKey, currentRevenue + (purchase.amount || 0));
    });

    // Convert maps to arrays for charts
    const usersGrowth = Array.from(usersGrowthMap.entries())
      .map(([date, count]) => ({
        date,
        users: count,
        label: new Date(date).toLocaleDateString('bg-BG', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const revenueData = Array.from(revenueMap.entries())
      .map(([date, revenue]) => ({
        date,
        revenue: Math.round(revenue * 100) / 100, // Round to 2 decimals
        label: new Date(date).toLocaleDateString('bg-BG', { month: 'short', day: 'numeric' })
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      success: true,
      usersGrowth,
      revenueData,
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error fetching growth stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch growth stats' },
      { status: 500 }
    );
  }
}
