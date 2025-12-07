import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to check alerts against current metrics
async function checkAlerts() {
  // Get active alerts
  const { data: alerts, error: alertsError } = await supabase
    .from("admin_alerts")
    .select("*")
    .eq("is_active", true);

  if (alertsError || !alerts?.length) return [];

  // Get current stats for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Get quiz stats
  const { data: quizStats } = await supabase
    .from("quiz_step_events")
    .select("session_id, category")
    .gte("created_at", sevenDaysAgo.toISOString());

  const { data: completions } = await supabase
    .from("quiz_results_v2")
    .select("id, category")
    .gte("created_at", sevenDaysAgo.toISOString());

  const { data: orders } = await supabase
    .from("pending_orders")
    .select("id")
    .gte("created_at", sevenDaysAgo.toISOString());

  // Calculate metrics
  const uniqueSessions = new Set(quizStats?.map(s => s.session_id) || []);
  const totalSessions = uniqueSessions.size;
  const completedSessions = completions?.length || 0;
  const totalOrders = orders?.length || 0;

  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const abandonedRate = totalSessions > 0 ? ((totalSessions - completedSessions) / totalSessions) * 100 : 0;
  const conversionRate = completedSessions > 0 ? (totalOrders / completedSessions) * 100 : 0;
  const dailySessions = totalSessions / 7;

  const metrics: Record<string, number> = {
    completion_rate: completionRate,
    daily_sessions: dailySessions,
    conversion_rate: conversionRate,
    abandoned_rate: abandonedRate,
  };

  const triggeredAlerts = [];

  for (const alert of alerts) {
    const metricValue = metrics[alert.metric_type];
    if (metricValue === undefined) continue;

    let triggered = false;

    switch (alert.condition) {
      case "below":
        triggered = metricValue < alert.threshold;
        break;
      case "above":
        triggered = metricValue > alert.threshold;
        break;
      case "change_percent":
        // For now, just compare to threshold
        triggered = Math.abs(metricValue) > alert.threshold;
        break;
    }

    if (triggered) {
      triggeredAlerts.push({
        alert,
        metricValue,
        message: generateAlertMessage(alert, metricValue),
      });

      // Record in history
      await supabase.from("admin_alert_history").insert({
        alert_id: alert.id,
        metric_value: metricValue,
        threshold_value: alert.threshold,
        message: generateAlertMessage(alert, metricValue),
      });

      // Update alert trigger count
      await supabase
        .from("admin_alerts")
        .update({
          last_triggered_at: new Date().toISOString(),
          trigger_count: (alert.trigger_count || 0) + 1,
        })
        .eq("id", alert.id);
    }
  }

  return triggeredAlerts;
}

function generateAlertMessage(alert: any, value: number): string {
  const metricLabels: Record<string, string> = {
    completion_rate: "Completion Rate",
    daily_sessions: "Daily Sessions",
    conversion_rate: "Conversion Rate",
    abandoned_rate: "Abandoned Rate",
  };
  const conditionLabels: Record<string, string> = {
    below: "падна под",
    above: "надхвърли",
    change_percent: "се промени с",
  };

  const metricLabel = metricLabels[alert.metric_type] || alert.metric_type;
  const conditionLabel = conditionLabels[alert.condition] || alert.condition;
  const isPercent = ["completion_rate", "conversion_rate", "abandoned_rate"].includes(alert.metric_type);

  return `${alert.name}: ${metricLabel} ${conditionLabel} ${alert.threshold}${isPercent ? "%" : ""} (текуща стойност: ${value.toFixed(1)}${isPercent ? "%" : ""})`;
}

// GET - Fetch all alerts and unread notifications
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const view = searchParams.get("view") || "all";

  try {
    if (view === "check") {
      // Check alerts and return triggered ones
      const triggeredAlerts = await checkAlerts();
      return NextResponse.json({ triggered: triggeredAlerts });
    }

    if (view === "notifications") {
      // Get unread notifications
      const { data, error } = await supabase
        .from("admin_alert_history")
        .select("*, admin_alerts(name, metric_type)")
        .eq("is_read", false)
        .order("triggered_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return NextResponse.json({ notifications: data || [] });
    }

    // Get all alerts
    const { data, error } = await supabase
      .from("admin_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("admin_alert_history")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    return NextResponse.json({
      alerts: data || [],
      unreadCount: unreadCount || 0
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// POST - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, metric_type, condition, threshold, category = "all" } = body;

    if (!name || !metric_type || !condition || threshold === undefined) {
      return NextResponse.json(
        { error: "Name, metric_type, condition, and threshold are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("admin_alerts")
      .insert({
        name,
        description,
        metric_type,
        condition,
        threshold,
        category,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, alert: data });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

// PUT - Update an alert or mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, mark_read, is_active, ...updateFields } = body;

    if (mark_read) {
      // Mark notifications as read
      const { error } = await supabase
        .from("admin_alert_history")
        .update({ is_read: true })
        .eq("is_read", false);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Alert ID is required" },
        { status: 400 }
      );
    }

    // Toggle active status or update alert
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      ...updateFields
    };

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    const { data, error } = await supabase
      .from("admin_alerts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, alert: data });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an alert
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("admin_alerts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
