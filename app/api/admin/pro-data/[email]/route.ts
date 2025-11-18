import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface ProDataStats {
  protocolActive: boolean;
  protocolStartDate: string | null;
  daysOnProtocol: number;
  dailyEntries: {
    totalEntries: number;
    latestEntries: any[];
    complianceRate: number;
    averageFeeling: number | null;
    averageEnergy: number | null;
    averageCompliance: number | null;
    currentStreak: number;
    longestStreak: number;
    missedDays: number;
  };
  weeklyMeasurements: {
    totalMeasurements: number;
    latestMeasurements: any[];
    weightChange: number | null;
    startWeight: number | null;
    currentWeight: number | null;
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: emailParam } = await params;
    const email = decodeURIComponent(emailParam);

    // Get user_id from email via auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users.find((u) => u.email === email);

    if (!authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = authUser.id;

    // Fetch profile with protocol_start_date_pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('protocol_start_date_pro')
      .eq('id', userId)
      .single();

    const protocolStartDate = profile?.protocol_start_date_pro;
    const protocolActive = !!protocolStartDate;

    // Calculate days on protocol
    let daysOnProtocol = 0;
    if (protocolStartDate) {
      const start = new Date(protocolStartDate);
      const now = new Date();
      const diffTime = now.getTime() - start.getTime();
      daysOnProtocol = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Fetch daily entries
    const { data: dailyEntries } = await supabase
      .from('daily_entries_pro')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Fetch weekly measurements
    const { data: weeklyMeasurements } = await supabase
      .from('weekly_measurements_pro')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Calculate daily entries statistics
    const totalEntries = dailyEntries?.length || 0;
    const averageFeeling = dailyEntries && dailyEntries.length > 0
      ? dailyEntries.reduce((sum, entry) => sum + (entry.overall_feeling || 0), 0) / dailyEntries.length
      : null;
    const averageEnergy = dailyEntries && dailyEntries.length > 0
      ? dailyEntries.reduce((sum, entry) => sum + (entry.energy_level || 0), 0) / dailyEntries.length
      : null;
    const averageCompliance = dailyEntries && dailyEntries.length > 0
      ? dailyEntries.reduce((sum, entry) => sum + (entry.plan_compliance || 0), 0) / dailyEntries.length
      : null;

    // Calculate compliance rate
    const complianceRate = protocolActive && daysOnProtocol > 0
      ? Math.round((totalEntries / daysOnProtocol) * 100)
      : 0;

    // Calculate streaks
    const { currentStreak, longestStreak, missedDays } = calculateStreaks(
      dailyEntries || [],
      protocolStartDate,
      daysOnProtocol
    );

    // Calculate weight change
    let weightChange = null;
    let startWeight = null;
    let currentWeight = null;
    if (weeklyMeasurements && weeklyMeasurements.length > 0) {
      currentWeight = weeklyMeasurements[0]?.weight || null;
      startWeight = weeklyMeasurements[weeklyMeasurements.length - 1]?.weight || null;
      if (startWeight && currentWeight) {
        weightChange = currentWeight - startWeight;
      }
    }

    const stats: ProDataStats = {
      protocolActive,
      protocolStartDate,
      daysOnProtocol,
      dailyEntries: {
        totalEntries,
        latestEntries: dailyEntries?.slice(0, 10) || [],
        complianceRate,
        averageFeeling: averageFeeling ? Math.round(averageFeeling * 10) / 10 : null,
        averageEnergy: averageEnergy ? Math.round(averageEnergy * 10) / 10 : null,
        averageCompliance: averageCompliance ? Math.round(averageCompliance * 10) / 10 : null,
        currentStreak,
        longestStreak,
        missedDays,
      },
      weeklyMeasurements: {
        totalMeasurements: weeklyMeasurements?.length || 0,
        latestMeasurements: weeklyMeasurements?.slice(0, 10) || [],
        weightChange: weightChange ? Math.round(weightChange * 10) / 10 : null,
        startWeight,
        currentWeight,
      },
    };

    return NextResponse.json({
      email,
      userId,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching PRO data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch PRO data' },
      { status: 500 }
    );
  }
}

function calculateStreaks(entries: any[], startDate: string | null, totalDays: number) {
  if (!entries || entries.length === 0 || !startDate) {
    return { currentStreak: 0, longestStreak: 0, missedDays: 0 };
  }

  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Check if there's an entry for today or yesterday
  if (sortedEntries[0]?.date === today || sortedEntries[0]?.date === yesterday) {
    currentStreak = 1;
    let checkDate = sortedEntries[0]?.date;

    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const expectedDate = prevDate.toISOString().split('T')[0];

      if (sortedEntries[i].date === expectedDate) {
        currentStreak++;
        checkDate = sortedEntries[i].date;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const currentDate = new Date(sortedEntries[i].date);
    const nextDate = new Date(sortedEntries[i + 1].date);
    const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate missed days
  const missedDays = totalDays - entries.length;

  return { currentStreak, longestStreak, missedDays: Math.max(0, missedDays) };
}
