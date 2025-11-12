import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 60; // Maximum 60 seconds for Vercel

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Generating AI analysis for token:', token);

    // Fetch full result data
    const { data: result, error: fetchError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('result_token', token)
      .single();

    if (fetchError || !result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    // Check if already has valid analysis
    if (result.ai_analysis_text && result.ai_analysis_text.split(' ').length >= 150) {
      console.log('✅ Valid AI analysis already exists, skipping generation');
      return NextResponse.json({
        success: true,
        analysis: result.ai_analysis_text,
        wordCount: result.ai_analysis_text.split(' ').length,
        cached: true
      });
    }

    // Update status to processing
    await supabase
      .from('quiz_results')
      .update({ ai_analysis_status: 'processing' })
      .eq('result_token', token);

    // Construct detailed prompt for OpenAI
    const prompt = `Ти си експерт по мъжко здраве и хормонален баланс. Анализирай следните резултати от тест за тестостерон и напиши персонализиран анализ на български език (точно 200 думи).

ДАННИ ЗА ПОТРЕБИТЕЛЯ:
- Име: ${result.first_name || 'Потребител'}
- Възраст: ${result.age || 'неизвестна'}
- Индекс на Увереност: ${result.confidence_index || result.score}/100
- Оценка на тестостерон: ${result.testosterone_estimate || 'среден'}
- Ниво на спешност: ${result.urgency_level || 'средна'}

КАТЕГОРИЙНИ РЕЗУЛТАТИ:
- Начин на живот: ${result.category_scores?.lifestyle || 50}/100
- Физическо състояние: ${result.category_scores?.physical || 50}/100
- Сексуално здраве: ${result.category_scores?.sexual || 50}/100
- Ментално здраве: ${result.category_scores?.mental || 50}/100

ДЕТАЙЛИ:
- Професия: ${result.profession || 'неизвестна'}
- Работен стрес: ${result.work_stress || 'неизвестен'}
- Телесни мазнини: ${result.body_fat || 'неизвестни'}
- Диета: ${result.diet || 'неизвестна'}
- Никотин: ${result.nicotine || 'неизвестен'}
- Алкохол: ${result.alcohol || 'неизвестен'}
- Сън: ${result.sleep || 'неизвестен'}
- Честота на секс: ${result.sex_frequency || 'неизвестна'}
- Фрустрация: ${result.frustration || 'неизвестна'}
- Минали опити за подобрение: ${result.past_attempts || 'неизвестни'}
- Визия: ${result.vision || 'неизвестна'}

ИНСТРУКЦИИ:
1. Започни с персонализирано обръщение към ${result.first_name || 'потребителя'}
2. Анализирай основните силни и слаби страни базирани на категорийните резултати
3. Фокусирай се върху 2-3 най-критични области за подобрение
4. Дай конкретни, действени съвети (не общи препоръки)
5. Завърши с мотивираща нота и следващи стъпки
6. Използвай топъл, подкрепящ тон - като личен треньор/ментор
7. Избягвай медицински жаргон - пиши разбираемо
8. ВАЖНО: Точно 200 думи

Напиши анализа сега:`;

    console.log('📝 Calling OpenRouter with Google Gemini 2.5 Pro...');

    // Retry logic - try up to 3 times if response is too short
    let analysis = '';
    let attempts = 0;
    const maxAttempts = 3;
    const minWords = 150; // Minimum 150 words (out of 200 target)

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Attempt ${attempts}/${maxAttempts}...`);

      try {
        // Call OpenRouter API directly (using Google Gemini 2.5 Pro)
        const fullPrompt = `РОЛЯ: Ти си експерт по мъжко здраве, хормонален баланс и фитнес с над 15 години опит. Пишеш персонализирани анализи на естествен БЪЛГАРСКИ език - като разговор между приятели, с топъл и подкрепящ тон. Пиши като ЧОВЕК, не като AI бот.

ЗАДАЧА: ${prompt}

ИЗИСКВАНИЯ:
- Пиши на ЧИСТ БЪЛГАРСКИ език без граматически грешки
- Използвай естествен, човешки стил - като разговор, не като доклад
- Анализът ТРЯБВА да съдържа между 180-220 думи (брой внимателно!)
- Бъди топъл, мотивиращ, но и честен
- Дай конкретни, действени препоръки
- Завърши с мотивираща нота

Напиши анализа СЕГА (180-220 думи на БЪЛГАРСКИ):`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3006',
            'X-Title': 'Testograph Quiz AI Analysis',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-pro',
            messages: [
              {
                role: 'user',
                content: fullPrompt
              }
            ],
            temperature: 0.9,
            max_tokens: 1500
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const completion = await response.json();

        // Log full API response for debugging
        console.log('🔍 Full OpenRouter Response:', JSON.stringify(completion, null, 2));

        analysis = completion.choices[0]?.message?.content || '';

        if (!analysis) {
          console.warn(`⚠️ Attempt ${attempts}: Empty response from AI`);
          console.log('Empty response details:', completion);
          continue;
        }

        const wordCount = analysis.trim().split(/\s+/).length;
        console.log(`📊 Attempt ${attempts}: Generated ${wordCount} words (target: 200, min: ${minWords})`);
        console.log(`📝 Generated text preview:`, analysis.substring(0, 200));

        // Validate minimum word count
        if (wordCount >= minWords) {
          console.log(`✅ Valid analysis generated with ${wordCount} words`);
          break;
        } else {
          console.warn(`⚠️ Attempt ${attempts}: Too short (${wordCount} words), retrying...`);
          analysis = ''; // Clear for retry
        }
      } catch (apiError: any) {
        console.error(`❌ Attempt ${attempts} failed:`, apiError.message);
        if (attempts === maxAttempts) {
          throw apiError;
        }
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Final validation
    if (!analysis || analysis.trim().split(/\s+/).length < minWords) {
      throw new Error(`Failed to generate valid analysis after ${maxAttempts} attempts. Last analysis had ${analysis.split(' ').length} words.`);
    }

    const finalWordCount = analysis.trim().split(/\s+/).length;
    console.log('✅ AI analysis generated successfully:', finalWordCount, 'words');

    // Save analysis to database
    const { error: updateError } = await supabase
      .from('quiz_results')
      .update({
        ai_analysis_text: analysis,
        ai_analysis_status: 'completed',
        ai_analysis_generated_at: new Date().toISOString()
      })
      .eq('result_token', token);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save analysis');
    }

    console.log('💾 Analysis saved to database');

    // Trigger enhanced PDF generation in background (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3006'}/api/quiz/generate-enhanced-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    }).then(() => {
      console.log('✅ Enhanced PDF generation triggered');
    }).catch((pdfError) => {
      console.error('Failed to trigger enhanced PDF generation:', pdfError);
    });

    return NextResponse.json({
      success: true,
      analysis,
      wordCount: finalWordCount,
      attempts: attempts
    });

  } catch (error: any) {
    console.error('❌ Error generating AI analysis:', error);

    // Try to get token from body (may not work if already consumed)
    try {
      const body = await request.json();
      if (body.token) {
        await supabase
          .from('quiz_results')
          .update({
            ai_analysis_status: 'failed',
            ai_analysis_text: null // Clear incomplete analysis
          })
          .eq('result_token', body.token);
      }
    } catch (parseError) {
      console.warn('Could not update status to failed - request body already consumed');
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to generate AI analysis',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
