import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch notes for a user
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("admin_user_notes")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ notes: data || [] });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST - Add a new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, note, created_by = "admin" } = body;

    if (!email || !note) {
      return NextResponse.json(
        { error: "Email and note are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("admin_user_notes")
      .insert({
        user_email: email,
        note: note,
        created_by: created_by,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, note: data });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a note
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const noteId = searchParams.get("id");

  if (!noteId) {
    return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("admin_user_notes")
      .delete()
      .eq("id", noteId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
