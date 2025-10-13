import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required', found: false },
        { status: 400 }
      );
    }

    // Query quiz_results by email (get most recent)
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // No result found for this email
      return NextResponse.json({
        found: false,
        message: 'No quiz results found for this email'
      });
    }

    // Return full result
    return NextResponse.json({
      found: true,
      result: {
        // Identifiers
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        created_at: data.created_at,

        // Demographics
        age: data.age,
        height: data.height,
        weight: data.weight,

        // Lifestyle
        sleep: data.sleep,
        alcohol: data.alcohol,
        nicotine: data.nicotine,
        diet: data.diet,
        stress: data.stress,

        // Training
        training_frequency: data.training_frequency,
        training_type: data.training_type,
        recovery: data.recovery,
        supplements: data.supplements,

        // Symptoms
        libido: data.libido,
        morning_erection: data.morning_erection,
        morning_energy: data.morning_energy,
        concentration: data.concentration,
        mood: data.mood,
        muscle_mass: data.muscle_mass,

        // Results
        score: data.score,
        testosterone_level: data.testosterone_level,
        testosterone_category: data.testosterone_category,
        risk_level: data.risk_level,
        recommended_tier: data.recommended_tier,

        // Metadata
        source: data.source,
        user_agent: data.user_agent,
        referrer: data.referrer
      }
    });

  } catch (error: any) {
    console.error('Error in get-result API:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch quiz result',
        found: false
      },
      { status: 500 }
    );
  }
}

// Add CORS headers for Bubble.io and testograph.eu
export async function OPTIONS(request: Request) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*', // Change to specific domain in production
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
