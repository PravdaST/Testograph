import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch all saved filters
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("admin_saved_filters")
      .select("*")
      .order("use_count", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ filters: data || [] });
  } catch (error) {
    console.error("Error fetching saved filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved filters" },
      { status: 500 }
    );
  }
}

// POST - Create a new saved filter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, filter_config, created_by = "admin" } = body;

    if (!name || !filter_config) {
      return NextResponse.json(
        { error: "Name and filter_config are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("admin_saved_filters")
      .insert({
        name,
        description,
        filter_config,
        created_by,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, filter: data });
  } catch (error) {
    console.error("Error creating saved filter:", error);
    return NextResponse.json(
      { error: "Failed to create saved filter" },
      { status: 500 }
    );
  }
}

// PUT - Update a saved filter (also increment use_count when loading)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, filter_config, increment_use } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Filter ID is required" },
        { status: 400 }
      );
    }

    // If just incrementing use count
    if (increment_use) {
      const { error } = await supabase.rpc("increment_filter_use_count", {
        filter_id: id,
      });

      // If RPC doesn't exist, do it manually
      if (error) {
        const { data: current } = await supabase
          .from("admin_saved_filters")
          .select("use_count")
          .eq("id", id)
          .single();

        await supabase
          .from("admin_saved_filters")
          .update({ use_count: (current?.use_count || 0) + 1 })
          .eq("id", id);
      }

      return NextResponse.json({ success: true });
    }

    // Regular update
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (filter_config) updateData.filter_config = filter_config;

    const { data, error } = await supabase
      .from("admin_saved_filters")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, filter: data });
  } catch (error) {
    console.error("Error updating saved filter:", error);
    return NextResponse.json(
      { error: "Failed to update saved filter" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a saved filter
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Filter ID is required" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("admin_saved_filters")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting saved filter:", error);
    return NextResponse.json(
      { error: "Failed to delete saved filter" },
      { status: 500 }
    );
  }
}
