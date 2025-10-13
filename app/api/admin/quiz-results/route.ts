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
    const riskLevel = searchParams.get('riskLevel'); // good, moderate, critical
    const testosteroneCategory = searchParams.get('testosteroneCategory'); // low, normal, high
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query
    let query = supabase
      .from('quiz_results')
      .select('*', { count: 'exact' });

    // Apply filters
    if (searchQuery) {
      query = query.or(`first_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    if (riskLevel) {
      query = query.eq('risk_level', riskLevel);
    }

    if (testosteroneCategory) {
      query = query.eq('testosterone_category', testosteroneCategory);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      // Add one day to include the entire end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching quiz results:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Calculate statistics
    const { data: statsData } = await supabase
      .from('quiz_results')
      .select('score, testosterone_level, risk_level, testosterone_category');

    const stats = {
      total: count || 0,
      avgScore: statsData ? calculateAverage(statsData.map(r => r.score)) : 0,
      avgTestosterone: statsData ? calculateAverage(statsData.map(r => r.testosterone_level)) : 0,
      byRiskLevel: {
        good: statsData?.filter(r => r.risk_level === 'good').length || 0,
        moderate: statsData?.filter(r => r.risk_level === 'moderate').length || 0,
        critical: statsData?.filter(r => r.risk_level === 'critical').length || 0,
      },
      byTestosteroneCategory: {
        low: statsData?.filter(r => r.testosterone_category === 'low').length || 0,
        normal: statsData?.filter(r => r.testosterone_category === 'normal').length || 0,
        high: statsData?.filter(r => r.testosterone_category === 'high').length || 0,
      }
    };

    return NextResponse.json({
      success: true,
      results: data || [],
      count: count || 0,
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

// Helper function to calculate average
function calculateAverage(numbers: (number | null)[]): number {
  const validNumbers = numbers.filter(n => n !== null && !isNaN(n)) as number[];
  if (validNumbers.length === 0) return 0;
  const sum = validNumbers.reduce((acc, n) => acc + n, 0);
  return Math.round((sum / validNumbers.length) * 10) / 10;
}
