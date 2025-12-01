import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS policies in server-side API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const categoryFilter = searchParams.get('category'); // 'libido' | 'muscle' | 'energy' | null (all)

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Fetch quiz results from quiz_results_v2 (the correct, active table)
    let query = supabase
      .from('quiz_results_v2')
      .select('*')
      .gte('created_at', dateThreshold.toISOString())
      .order('created_at', { ascending: false });

    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }

    const { data: quizResults, error: resultsError } = await query;

    if (resultsError) throw resultsError;

    // Calculate stats
    const totalQuizzes = quizResults?.length || 0;

    // Category breakdown
    const categoryBreakdown = {
      libido: quizResults?.filter(q => q.category === 'libido').length || 0,
      muscle: quizResults?.filter(q => q.category === 'muscle').length || 0,
      energy: quizResults?.filter(q => q.category === 'energy').length || 0,
    };

    // Level breakdown
    const levelBreakdown = {
      low: quizResults?.filter(q => q.determined_level === 'low').length || 0,
      moderate: quizResults?.filter(q => q.determined_level === 'moderate').length || 0,
      good: quizResults?.filter(q => q.determined_level === 'good').length || 0,
      optimal: quizResults?.filter(q => q.determined_level === 'optimal').length || 0,
    };

    // Workout location breakdown
    const workoutLocationBreakdown = {
      home: quizResults?.filter(q => q.workout_location === 'home').length || 0,
      gym: quizResults?.filter(q => q.workout_location === 'gym').length || 0,
    };

    // Average scores
    const avgTotalScore = totalQuizzes > 0
      ? Math.round(quizResults!.reduce((sum, q) => sum + (q.total_score || 0), 0) / totalQuizzes)
      : 0;

    const avgBreakdown = {
      symptoms: totalQuizzes > 0
        ? Math.round(quizResults!.reduce((sum, q) => sum + (q.breakdown_symptoms || 0), 0) / totalQuizzes * 10) / 10
        : 0,
      nutrition: totalQuizzes > 0
        ? Math.round(quizResults!.reduce((sum, q) => sum + (q.breakdown_nutrition || 0), 0) / totalQuizzes * 10) / 10
        : 0,
      training: totalQuizzes > 0
        ? Math.round(quizResults!.reduce((sum, q) => sum + (q.breakdown_training || 0), 0) / totalQuizzes * 10) / 10
        : 0,
      sleepRecovery: totalQuizzes > 0
        ? Math.round(quizResults!.reduce((sum, q) => sum + (q.breakdown_sleep_recovery || 0), 0) / totalQuizzes * 10) / 10
        : 0,
      context: totalQuizzes > 0
        ? Math.round(quizResults!.reduce((sum, q) => sum + (q.breakdown_context || 0), 0) / totalQuizzes * 10) / 10
        : 0,
    };

    // Daily trend data
    const dailyStats: Record<string, { total: number; categories: Record<string, number> }> = {};
    quizResults?.forEach((quiz) => {
      const date = new Date(quiz.created_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, categories: { libido: 0, muscle: 0, energy: 0 } };
      }
      dailyStats[date].total += 1;
      if (quiz.category) {
        dailyStats[date].categories[quiz.category] = (dailyStats[date].categories[quiz.category] || 0) + 1;
      }
    });

    const trendData = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        total: stats.total,
        ...stats.categories,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Quiz results list for table display
    const quizList = quizResults?.map((quiz) => ({
      id: quiz.id,
      email: quiz.email,
      firstName: quiz.first_name,
      category: quiz.category,
      totalScore: quiz.total_score,
      level: quiz.determined_level,
      workoutLocation: quiz.workout_location,
      breakdownSymptoms: quiz.breakdown_symptoms,
      breakdownNutrition: quiz.breakdown_nutrition,
      breakdownTraining: quiz.breakdown_training,
      breakdownSleepRecovery: quiz.breakdown_sleep_recovery,
      breakdownContext: quiz.breakdown_context,
      completedAt: quiz.completed_at,
      createdAt: quiz.created_at,
    })) || [];

    // Overall stats
    const stats = {
      totalQuizzes,
      avgTotalScore,
      mostCommonCategory: Object.entries(categoryBreakdown).reduce((a, b) => a[1] > b[1] ? a : b)[0],
      mostCommonLevel: Object.entries(levelBreakdown).reduce((a, b) => a[1] > b[1] ? a : b)[0],
      homeVsGymRatio: workoutLocationBreakdown.home > 0 || workoutLocationBreakdown.gym > 0
        ? Math.round((workoutLocationBreakdown.home / (workoutLocationBreakdown.home + workoutLocationBreakdown.gym)) * 100)
        : 0,
    };

    return NextResponse.json({
      stats,
      categoryBreakdown,
      levelBreakdown,
      workoutLocationBreakdown,
      avgBreakdown,
      trendData,
      quizList,
      dateRange: {
        from: dateThreshold.toISOString(),
        to: new Date().toISOString(),
        days,
      },
    });
  } catch (error: any) {
    console.error('Error fetching quiz stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
