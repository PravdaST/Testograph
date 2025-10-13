import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.first_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email and first_name' },
        { status: 400 }
      );
    }

    // Insert into Supabase using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to save quiz result' },
        { status: 500 }
      );
    }

    console.log('✅ Quiz result saved to Supabase via API:', data.id);

    return NextResponse.json({
      success: true,
      message: 'Quiz result saved successfully',
      id: data.id
    });

  } catch (error: any) {
    console.error('Error in save-result API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save quiz result' },
      { status: 500 }
    );
  }
}
