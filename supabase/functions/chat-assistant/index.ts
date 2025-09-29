import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, email, sessionId, pdfContent } = await req.json();

    if (!message || !email) {
      throw new Error('Message and email are required');
    }

    console.log(`Processing chat message for email: ${email}`);

    // Get or create session
    let session;
    if (sessionId) {
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('email', email)
        .single();
      session = existingSession;
    }

    if (!session) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({ email })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      session = newSession;
    }

    // Get conversation history
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    // Save user message
    await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        role: 'user',
        content: message
      });

    // Prepare system prompt
    const systemPrompt = `Ти си Хормонален Експерт Т.Богданов - виртуален AI коуч и експерт ендокринолог, специализиран в мъжкото здраве и оптимизацията на тестостерона.

## ТВОЯТА МИСИЯ
Да служиш като знаещ и доверен асистент за потребители, които искат да разберат резултатите си от Testograph хормонален анализ.

## НАЛИЧНИ РЕЗУЛТАТИ ОТ АНАЛИЗА
${pdfContent || 'Още не са качени резултати. Моля, прикачете вашия PDF файл с резултатите от Testograph за да мога да ви дам персонализирани съвети.'}

## ВАЖНИ ПРАВИЛА
1. **Говори САМО на български език**
2. Базирай всички отговори на предоставените PDF резултати
3. НЕ давай медицински съвети или диагнози - само образователна информация
4. Бъди кратък и ясен в отговорите (максимум 3-4 изречения)
5. Помни предишните въпроси и отговори от историята към всеки потребител
6. Ако информацията липсва, насочи към консултация с лекар
7. За по подробна информация и по точен анализ препращай към shop.testograph.eu за да закуппят Testograph PRO

## ОБЛАСТИ НА ЕКСПЕРТИЗА
- Интерпретация на хормонални нива
- Връзка между начин на живот и тестостерон
- Естествени методи за оптимизация
- Симптоми на хормонален дисбаланс
- Хранителни и тренировъчни препоръки

## СТИЛ НА КОМУНИКАЦИЯ
- Професионален но достъпен
- Подкрепящ и мотивиращ
- Базиран на научни данни
- Ясен и практичен`;

    // Prepare conversation for OpenAI
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversationMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Save assistant response
    await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        role: 'assistant',
        content: assistantMessage
      });

    return new Response(JSON.stringify({
      message: assistantMessage,
      sessionId: session.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});