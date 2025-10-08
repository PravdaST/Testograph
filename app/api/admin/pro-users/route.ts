import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

interface ProUserData {
  userId: string;
  email: string;
  name: string | null;
  protocolStartDate: string;
  daysOnProtocol: number;
  currentStreak: number;
  longestStreak: number;
  complianceRate: number;
  totalEntries: number;
  missedDays: number;
  averageFeeling: number | null;
  averageEnergy: number | null;
  averageCompliance: number | null;
  weightChange: number | null;
  startWeight: number | null;
  currentWeight: number | null;
  lastActivityDate: string | null;
}

function calculateStreaks(entries: any[], startDate: string, totalDays: number) {
  if (!entries || entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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

  return { currentStreak, longestStreak };
}

export async function GET() {
  try {
    // Get all users with active PRO protocol
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, protocol_start_date_pro')
      .not('protocol_start_date_pro', 'is', null);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Get auth users to map emails
    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUsers = authData?.users || [];

    const proUsers: ProUserData[] = [];

    for (const profile of profiles) {
      const userId = profile.id;
      const protocolStartDate = profile.protocol_start_date_pro;

      // Find email from auth users
      const authUser = authUsers.find(u => u.id === userId);
      if (!authUser) continue;

      // Calculate days on protocol
      const start = new Date(protocolStartDate);
      const now = new Date();
      const diffTime = now.getTime() - start.getTime();
      const daysOnProtocol = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

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

      // Calculate statistics
      const totalEntries = dailyEntries?.length || 0;
      const missedDays = Math.max(0, daysOnProtocol - totalEntries);
      const complianceRate = daysOnProtocol > 0
        ? Math.round((totalEntries / daysOnProtocol) * 100)
        : 0;

      const averageFeeling = dailyEntries && dailyEntries.length > 0
        ? dailyEntries.reduce((sum, entry) => sum + (entry.overall_feeling || 0), 0) / dailyEntries.length
        : null;

      const averageEnergy = dailyEntries && dailyEntries.length > 0
        ? dailyEntries.reduce((sum, entry) => sum + (entry.energy_level || 0), 0) / dailyEntries.length
        : null;

      const averageCompliance = dailyEntries && dailyEntries.length > 0
        ? dailyEntries.reduce((sum, entry) => sum + (entry.plan_compliance || 0), 0) / dailyEntries.length
        : null;

      const { currentStreak, longestStreak } = calculateStreaks(
        dailyEntries || [],
        protocolStartDate,
        daysOnProtocol
      );

      // Weight calculations
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

      const lastActivityDate = dailyEntries && dailyEntries.length > 0
        ? dailyEntries[0].date
        : null;

      proUsers.push({
        userId,
        email: authUser.email || '',
        name: authUser.user_metadata?.first_name || null,
        protocolStartDate,
        daysOnProtocol,
        currentStreak,
        longestStreak,
        complianceRate,
        totalEntries,
        missedDays,
        averageFeeling: averageFeeling ? Math.round(averageFeeling * 10) / 10 : null,
        averageEnergy: averageEnergy ? Math.round(averageEnergy * 10) / 10 : null,
        averageCompliance: averageCompliance ? Math.round(averageCompliance * 10) / 10 : null,
        weightChange: weightChange ? Math.round(weightChange * 10) / 10 : null,
        startWeight,
        currentWeight,
        lastActivityDate,
      });
    }

    // Sort by compliance rate (descending)
    proUsers.sort((a, b) => b.complianceRate - a.complianceRate);

    return NextResponse.json({
      users: proUsers,
      total: proUsers.length,
    });
  } catch (error: any) {
    console.error('Error fetching PRO users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch PRO users' },
      { status: 500 }
    );
  }
}
