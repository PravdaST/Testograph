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
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    // Validation - need either token or email
    if (!token && !email) {
      return NextResponse.json(
        { error: 'Token or email parameter is required', found: false },
        { status: 400 }
      );
    }

    let data, error;

    // Query by token (preferred)
    if (token) {
      const result = await supabase
        .from('quiz_results')
        .select('*')
        .eq('result_token', token)
        .single();

      data = result.data;
      error = result.error;

      // Update result_viewed_at timestamp on first view
      if (data && !data.result_viewed_at) {
        await supabase
          .from('quiz_results')
          .update({ result_viewed_at: new Date().toISOString() })
          .eq('result_token', token);
      }
    }
    // Query by email (backward compatibility)
    else if (email) {
      const result = await supabase
        .from('quiz_results')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      // No result found
      return NextResponse.json({
        found: false,
        message: token ? 'Резултатът не беше намерен' : 'No quiz results found for this email'
      }, { status: 404 });
    }

    // For token queries, return simplified format for result page
    if (token) {
      return NextResponse.json({
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        score: data.score,
        confidence_index: data.confidence_index || data.score, // Fallback to score
        testosterone_estimate: data.testosterone_estimate || 'среден',
        urgency_level: data.urgency_level || 'средна',
        category_scores: data.category_scores || { lifestyle: 50, physical: 50, sexual: 50, mental: 50 },
        percentile: data.percentile || 50,
        pdf_template_url: data.pdf_template_url,
        pdf_enhanced_url: data.pdf_enhanced_url,
        ai_analysis_status: data.ai_analysis_status || 'pending',
        ai_analysis_text: data.ai_analysis_text,
        created_at: data.created_at
      });
    }

    // For email queries, return full result (backward compatibility)
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

        // Results (Legacy)
        score: data.score,
        testosterone_level: data.testosterone_level,
        testosterone_category: data.testosterone_category,
        risk_level: data.risk_level,
        recommended_tier: data.recommended_tier,

        // New Results (Confidence Index)
        confidence_index: data.confidence_index,
        testosterone_estimate: data.testosterone_estimate,
        urgency_level: data.urgency_level,
        category_scores: data.category_scores,
        percentile: data.percentile,

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
