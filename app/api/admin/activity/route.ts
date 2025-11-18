import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface ActivityEvent {
  id: string;
  type: 'quiz_completed' | 'meal_logged' | 'workout_logged' | 'sleep_logged' | 'testoup_logged' | 'purchase';
  timestamp: string;
  user: string;
  description: string;
  metadata?: any;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const activities: ActivityEvent[] = [];

    // Get profiles for user names
    const { data: profiles } = await supabase
      .from('profiles')
      .select('email, first_name');
    const profileMap = new Map(profiles?.map(p => [p.email, p.first_name]));

    // Get recent quiz completions
    const { data: quizResults } = await supabase
      .from('quiz_results_v2')
      .select('email, category, total_score, completed_at')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20);

    quizResults?.forEach((quiz) => {
      const firstName = profileMap.get(quiz.email) || quiz.email.split('@')[0];
      const categoryEmoji = quiz.category === 'energy' ? '⚡' : quiz.category === 'libido' ? '💪' : '🏋️';

      activities.push({
        id: `quiz-${quiz.email}-${quiz.completed_at}`,
        type: 'quiz_completed',
        timestamp: quiz.completed_at,
        user: firstName,
        description: `${categoryEmoji} Завърши ${quiz.category} quiz (Score: ${quiz.total_score})`,
      });
    });

    // Get recent meal completions
    const { data: mealLogs } = await supabase
      .from('meal_completions')
      .select('email, meal_time, date')
      .order('date', { ascending: false })
      .limit(15);

    mealLogs?.forEach((meal) => {
      const firstName = profileMap.get(meal.email) || meal.email.split('@')[0];

      activities.push({
        id: `meal-${meal.email}-${meal.date}-${meal.meal_time}`,
        type: 'meal_logged',
        timestamp: meal.date,
        user: firstName,
        description: `🍽️ Отбеляза ${meal.meal_time === 'breakfast' ? 'закуска' : meal.meal_time === 'lunch' ? 'обяд' : meal.meal_time === 'dinner' ? 'вечеря' : meal.meal_time}`,
      });
    });

    // Get recent workout sessions
    const { data: workoutLogs } = await supabase
      .from('workout_sessions')
      .select('email, date')
      .order('date', { ascending: false })
      .limit(15);

    workoutLogs?.forEach((workout) => {
      const firstName = profileMap.get(workout.email) || workout.email.split('@')[0];

      activities.push({
        id: `workout-${workout.email}-${workout.date}`,
        type: 'workout_logged',
        timestamp: workout.date,
        user: firstName,
        description: `💪 Завърши тренировка`,
      });
    });

    // Get recent sleep tracking
    const { data: sleepLogs } = await supabase
      .from('sleep_tracking')
      .select('email, date, hours_slept')
      .order('date', { ascending: false })
      .limit(10);

    sleepLogs?.forEach((sleep) => {
      const firstName = profileMap.get(sleep.email) || sleep.email.split('@')[0];

      activities.push({
        id: `sleep-${sleep.email}-${sleep.date}`,
        type: 'sleep_logged',
        timestamp: sleep.date,
        user: firstName,
        description: `😴 Записа ${sleep.hours_slept}ч сън`,
      });
    });

    // Get recent TestoUP tracking
    const { data: testoUpLogs } = await supabase
      .from('testoup_tracking')
      .select('email, date, morning_taken, evening_taken')
      .order('date', { ascending: false })
      .limit(10);

    testoUpLogs?.forEach((log) => {
      const firstName = profileMap.get(log.email) || log.email.split('@')[0];
      const doses = [];
      if (log.morning_taken) doses.push('сутрин');
      if (log.evening_taken) doses.push('вечер');

      if (doses.length > 0) {
        activities.push({
          id: `testoup-${log.email}-${log.date}`,
          type: 'testoup_logged',
          timestamp: log.date,
          user: firstName,
          description: `💊 Взе TestoUP (${doses.join(' + ')})`,
        });
      }
    });

    // Get recent purchases
    const { data: purchases } = await supabase
      .from('purchases')
      .select('id, user_id, product_name, amount, purchased_at')
      .eq('status', 'completed')
      .order('purchased_at', { ascending: false })
      .limit(10);

    if (purchases) {
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const userMap = new Map(authUsers?.users.map(u => [u.id, u.email]));

      purchases.forEach((purchase) => {
        const email = userMap.get(purchase.user_id);
        const firstName = email ? (profileMap.get(email) || email.split('@')[0]) : 'Unknown';

        activities.push({
          id: `purchase-${purchase.id}`,
          type: 'purchase',
          timestamp: purchase.purchased_at,
          user: firstName,
          description: `🛒 Закупи ${purchase.product_name} (${purchase.amount} лв)`,
        });
      });
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Limit to requested amount
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      activities: limitedActivities,
      total: limitedActivities.length,
    });
  } catch (error: any) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
