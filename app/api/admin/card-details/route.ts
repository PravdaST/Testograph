import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to convert data to CSV
function toCSV(data: Record<string, unknown>[], columns: string[]): string {
  if (data.length === 0) return "";

  const header = columns.join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col];
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      })
      .join(",")
  );

  return [header, ...rows].join("\n");
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Common parameters
  const dataType = searchParams.get("dataType") || "quiz_completions";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "25", 10);
  const sortBy = searchParams.get("sortBy") || "created_at";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  // Filters
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  // Additional filters
  const completed = searchParams.get("completed");
  const status = searchParams.get("status");

  // Export mode
  const isExport = searchParams.get("export") === "true";
  const exportAll = searchParams.get("exportAll") === "true";

  try {
    let data: Record<string, unknown>[] = [];
    let totalCount = 0;
    let csvColumns: string[] = [];

    switch (dataType) {
      case "quiz_completions":
      case "quiz_results": {
        // Fetch from quiz_results_v2
        let query = supabase
          .from("quiz_results_v2")
          .select("*", { count: "exact" });

        // Apply filters
        if (search) {
          query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%`);
        }
        if (category) {
          query = query.eq("category", category);
        }
        if (level) {
          query = query.eq("determined_level", level);
        }
        if (dateFrom) {
          query = query.gte("created_at", `${dateFrom}T00:00:00`);
        }
        if (dateTo) {
          query = query.lte("created_at", `${dateTo}T23:59:59`);
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        // Apply pagination (unless exporting all)
        if (!isExport || !exportAll) {
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;
          query = query.range(from, to);
        }

        const { data: results, count, error } = await query;
        if (error) throw error;

        data = results || [];
        totalCount = count || 0;
        csvColumns = ["id", "email", "first_name", "category", "total_score", "determined_level", "workout_location", "created_at"];
        break;
      }

      case "quiz_sessions":
      case "all_sessions": {
        // Get aggregated session data from quiz_step_events
        let query = supabase
          .from("quiz_step_events")
          .select("session_id, email, category, step_number, created_at", { count: "exact" });

        if (category) {
          query = query.eq("category", category);
        }
        if (dateFrom) {
          query = query.gte("created_at", `${dateFrom}T00:00:00`);
        }
        if (dateTo) {
          query = query.lte("created_at", `${dateTo}T23:59:59`);
        }
        if (search) {
          query = query.ilike("email", `%${search}%`);
        }

        query = query.order("created_at", { ascending: sortOrder === "asc" });

        const { data: events, error } = await query;
        if (error) throw error;

        // Aggregate by session
        const sessionMap = new Map<string, {
          session_id: string;
          email: string;
          category: string;
          step_count: number;
          created_at: string;
          completed: boolean;
        }>();

        // Get completions to mark sessions as completed
        const { data: completions } = await supabase
          .from("quiz_results_v2")
          .select("email, created_at");

        const completedEmails = new Set(completions?.map((c) => c.email) || []);

        for (const event of events || []) {
          const existing = sessionMap.get(event.session_id);
          if (existing) {
            existing.step_count = Math.max(existing.step_count, event.step_number);
          } else {
            sessionMap.set(event.session_id, {
              session_id: event.session_id,
              email: event.email || "",
              category: event.category || "",
              step_count: event.step_number,
              created_at: event.created_at,
              completed: event.email ? completedEmails.has(event.email) : false,
            });
          }
        }

        let sessions = Array.from(sessionMap.values());

        // Filter by completion status
        if (completed === "true") {
          sessions = sessions.filter((s) => s.completed);
        } else if (completed === "false") {
          sessions = sessions.filter((s) => !s.completed);
        }

        totalCount = sessions.length;

        // Apply pagination
        if (!isExport || !exportAll) {
          const from = (page - 1) * pageSize;
          sessions = sessions.slice(from, from + pageSize);
        }

        data = sessions;
        csvColumns = ["session_id", "email", "category", "step_count", "completed", "created_at"];
        break;
      }

      case "abandoned_sessions": {
        // Get sessions that didn't complete
        const { data: events } = await supabase
          .from("quiz_step_events")
          .select("session_id, email, category, step_number, created_at");

        const { data: completions } = await supabase
          .from("quiz_results_v2")
          .select("email");

        const completedEmails = new Set(completions?.map((c) => c.email) || []);

        const sessionMap = new Map<string, {
          session_id: string;
          email: string;
          category: string;
          last_step: number;
          created_at: string;
          abandoned_at_step: string;
        }>();

        for (const event of events || []) {
          const existing = sessionMap.get(event.session_id);
          if (existing) {
            if (event.step_number > existing.last_step) {
              existing.last_step = event.step_number;
              existing.abandoned_at_step = `Step ${event.step_number}`;
            }
          } else {
            sessionMap.set(event.session_id, {
              session_id: event.session_id,
              email: event.email || "Anonymous",
              category: event.category || "",
              last_step: event.step_number,
              created_at: event.created_at,
              abandoned_at_step: `Step ${event.step_number}`,
            });
          }
        }

        // Filter to only abandoned (not completed)
        let abandoned = Array.from(sessionMap.values())
          .filter((s) => !s.email || !completedEmails.has(s.email));

        // Apply filters
        if (category) {
          abandoned = abandoned.filter((s) => s.category === category);
        }
        if (dateFrom) {
          abandoned = abandoned.filter((s) => new Date(s.created_at) >= new Date(dateFrom));
        }
        if (dateTo) {
          abandoned = abandoned.filter((s) => new Date(s.created_at) <= new Date(dateTo + "T23:59:59"));
        }
        if (search) {
          const searchLower = search.toLowerCase();
          abandoned = abandoned.filter((s) => s.email.toLowerCase().includes(searchLower));
        }

        // Sort
        abandoned.sort((a, b) => {
          const aVal = a[sortBy as keyof typeof a];
          const bVal = b[sortBy as keyof typeof b];
          if (sortOrder === "asc") {
            return aVal > bVal ? 1 : -1;
          }
          return aVal < bVal ? 1 : -1;
        });

        totalCount = abandoned.length;

        if (!isExport || !exportAll) {
          const from = (page - 1) * pageSize;
          abandoned = abandoned.slice(from, from + pageSize);
        }

        data = abandoned;
        csvColumns = ["session_id", "email", "category", "last_step", "abandoned_at_step", "created_at"];
        break;
      }

      case "orders":
      case "shopify_orders": {
        let query = supabase
          .from("pending_orders")
          .select("*", { count: "exact" });

        if (search) {
          query = query.or(`email.ilike.%${search}%,customer_name.ilike.%${search}%`);
        }
        if (status) {
          query = query.eq("status", status);
        }
        if (dateFrom) {
          query = query.gte("created_at", `${dateFrom}T00:00:00`);
        }
        if (dateTo) {
          query = query.lte("created_at", `${dateTo}T23:59:59`);
        }

        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        if (!isExport || !exportAll) {
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;
          query = query.range(from, to);
        }

        const { data: orders, count, error } = await query;
        if (error) throw error;

        data = orders || [];
        totalCount = count || 0;
        csvColumns = ["order_number", "email", "customer_name", "phone", "total_price", "currency", "status", "created_at"];
        break;
      }

      case "conversions":
      case "quiz_to_order": {
        // Get quiz completions that have orders
        const { data: completions } = await supabase
          .from("quiz_results_v2")
          .select("email, first_name, category, total_score, determined_level, created_at");

        const { data: orders } = await supabase
          .from("pending_orders")
          .select("email, order_number, total_price, status, created_at");

        const orderMap = new Map(orders?.map((o) => [o.email, o]) || []);

        let conversions = (completions || [])
          .filter((c) => orderMap.has(c.email))
          .map((c) => {
            const order = orderMap.get(c.email);
            return {
              email: c.email,
              first_name: c.first_name,
              category: c.category,
              total_score: c.total_score,
              determined_level: c.determined_level,
              quiz_date: c.created_at,
              order_number: order?.order_number,
              order_amount: order?.total_price,
              order_status: order?.status,
              order_date: order?.created_at,
            };
          });

        // Apply filters
        if (category) {
          conversions = conversions.filter((c) => c.category === category);
        }
        if (level) {
          conversions = conversions.filter((c) => c.determined_level === level);
        }
        if (search) {
          const searchLower = search.toLowerCase();
          conversions = conversions.filter((c) =>
            c.email.toLowerCase().includes(searchLower) ||
            (c.first_name || "").toLowerCase().includes(searchLower)
          );
        }
        if (dateFrom) {
          conversions = conversions.filter((c) => new Date(c.quiz_date) >= new Date(dateFrom));
        }
        if (dateTo) {
          conversions = conversions.filter((c) => new Date(c.quiz_date) <= new Date(dateTo + "T23:59:59"));
        }

        totalCount = conversions.length;

        if (!isExport || !exportAll) {
          const from = (page - 1) * pageSize;
          conversions = conversions.slice(from, from + pageSize);
        }

        data = conversions;
        csvColumns = ["email", "first_name", "category", "total_score", "determined_level", "quiz_date", "order_number", "order_amount", "order_status", "order_date"];
        break;
      }

      case "by_category": {
        const targetCategory = searchParams.get("targetCategory") || category;

        let query = supabase
          .from("quiz_results_v2")
          .select("*", { count: "exact" });

        if (targetCategory) {
          query = query.eq("category", targetCategory);
        }
        if (search) {
          query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%`);
        }
        if (level) {
          query = query.eq("determined_level", level);
        }
        if (dateFrom) {
          query = query.gte("created_at", `${dateFrom}T00:00:00`);
        }
        if (dateTo) {
          query = query.lte("created_at", `${dateTo}T23:59:59`);
        }

        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        if (!isExport || !exportAll) {
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;
          query = query.range(from, to);
        }

        const { data: results, count, error } = await query;
        if (error) throw error;

        data = results || [];
        totalCount = count || 0;
        csvColumns = ["id", "email", "first_name", "category", "total_score", "determined_level", "created_at"];
        break;
      }

      case "by_level": {
        const targetLevel = searchParams.get("targetLevel") || level;

        let query = supabase
          .from("quiz_results_v2")
          .select("*", { count: "exact" });

        if (targetLevel) {
          query = query.eq("determined_level", targetLevel);
        }
        if (category) {
          query = query.eq("category", category);
        }
        if (search) {
          query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%`);
        }
        if (dateFrom) {
          query = query.gte("created_at", `${dateFrom}T00:00:00`);
        }
        if (dateTo) {
          query = query.lte("created_at", `${dateTo}T23:59:59`);
        }

        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        if (!isExport || !exportAll) {
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;
          query = query.range(from, to);
        }

        const { data: results, count, error } = await query;
        if (error) throw error;

        data = results || [];
        totalCount = count || 0;
        csvColumns = ["id", "email", "first_name", "category", "total_score", "determined_level", "created_at"];
        break;
      }

      case "app_users": {
        let query = supabase
          .from("app_users")
          .select("*", { count: "exact" });

        if (search) {
          query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
        }
        if (dateFrom) {
          query = query.gte("created_at", `${dateFrom}T00:00:00`);
        }
        if (dateTo) {
          query = query.lte("created_at", `${dateTo}T23:59:59`);
        }

        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        if (!isExport || !exportAll) {
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;
          query = query.range(from, to);
        }

        const { data: users, count, error } = await query;
        if (error) throw error;

        data = users || [];
        totalCount = count || 0;
        csvColumns = ["id", "email", "name", "created_at"];
        break;
      }

      case "quiz_no_order": {
        // Get quiz completions that don't have orders
        const { data: quizResults } = await supabase
          .from("quiz_results_v2")
          .select("email, first_name, category, total_score, determined_level, workout_location, created_at");

        const { data: orders } = await supabase
          .from("pending_orders")
          .select("email");

        const orderEmails = new Set(orders?.map((o) => o.email.toLowerCase()) || []);

        let noOrderUsers = (quizResults || [])
          .filter((q) => q.email && !orderEmails.has(q.email.toLowerCase()))
          .map((q) => ({
            email: q.email,
            first_name: q.first_name,
            category: q.category,
            total_score: q.total_score,
            determined_level: q.determined_level,
            workout_location: q.workout_location,
            quiz_date: q.created_at,
          }));

        // Apply filters
        if (search) {
          const searchLower = search.toLowerCase();
          noOrderUsers = noOrderUsers.filter((u) =>
            u.email.toLowerCase().includes(searchLower) ||
            (u.first_name || "").toLowerCase().includes(searchLower)
          );
        }
        if (category) {
          noOrderUsers = noOrderUsers.filter((u) => u.category === category);
        }
        if (level) {
          noOrderUsers = noOrderUsers.filter((u) => u.determined_level === level);
        }
        if (dateFrom) {
          noOrderUsers = noOrderUsers.filter((u) => new Date(u.quiz_date) >= new Date(dateFrom));
        }
        if (dateTo) {
          noOrderUsers = noOrderUsers.filter((u) => new Date(u.quiz_date) <= new Date(dateTo + "T23:59:59"));
        }

        // Sort
        noOrderUsers.sort((a, b) => {
          const aVal = a[sortBy as keyof typeof a] || "";
          const bVal = b[sortBy as keyof typeof b] || "";
          if (sortOrder === "asc") {
            return aVal > bVal ? 1 : -1;
          }
          return aVal < bVal ? 1 : -1;
        });

        totalCount = noOrderUsers.length;

        if (!isExport || !exportAll) {
          const from = (page - 1) * pageSize;
          noOrderUsers = noOrderUsers.slice(from, from + pageSize);
        }

        data = noOrderUsers;
        csvColumns = ["email", "first_name", "category", "total_score", "determined_level", "workout_location", "quiz_date"];
        break;
      }

      case "order_no_quiz": {
        // Get orders that don't have quiz completions
        const { data: allOrders } = await supabase
          .from("pending_orders")
          .select("email, customer_name, phone, total_price, currency, status, order_number, created_at");

        const { data: quizEmails } = await supabase
          .from("quiz_results_v2")
          .select("email");

        const quizEmailSet = new Set(quizEmails?.map((q) => q.email?.toLowerCase()) || []);

        let noQuizOrders = (allOrders || [])
          .filter((o) => o.email && !quizEmailSet.has(o.email.toLowerCase()))
          .map((o) => ({
            email: o.email,
            customer_name: o.customer_name,
            phone: o.phone,
            total_price: o.total_price,
            currency: o.currency,
            status: o.status,
            order_number: o.order_number,
            order_date: o.created_at,
          }));

        // Apply filters
        if (search) {
          const searchLower = search.toLowerCase();
          noQuizOrders = noQuizOrders.filter((o) =>
            o.email.toLowerCase().includes(searchLower) ||
            (o.customer_name || "").toLowerCase().includes(searchLower)
          );
        }
        if (status) {
          noQuizOrders = noQuizOrders.filter((o) => o.status === status);
        }
        if (dateFrom) {
          noQuizOrders = noQuizOrders.filter((o) => new Date(o.order_date) >= new Date(dateFrom));
        }
        if (dateTo) {
          noQuizOrders = noQuizOrders.filter((o) => new Date(o.order_date) <= new Date(dateTo + "T23:59:59"));
        }

        // Sort
        noQuizOrders.sort((a, b) => {
          const aVal = a[sortBy as keyof typeof a] || "";
          const bVal = b[sortBy as keyof typeof b] || "";
          if (sortOrder === "asc") {
            return aVal > bVal ? 1 : -1;
          }
          return aVal < bVal ? 1 : -1;
        });

        totalCount = noQuizOrders.length;

        if (!isExport || !exportAll) {
          const from = (page - 1) * pageSize;
          noQuizOrders = noQuizOrders.slice(from, from + pageSize);
        }

        data = noQuizOrders;
        csvColumns = ["email", "customer_name", "phone", "order_number", "total_price", "currency", "status", "order_date"];
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid dataType" }, { status: 400 });
    }

    // Handle CSV export
    if (isExport) {
      const csv = toCSV(data, csvColumns);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${dataType}_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      data,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error("Error fetching card details:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
