import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Environment variables
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Protocol Knowledge Base - Structured content from all 4 protocols
const PROTOCOL_KNOWLEDGE = `
ПРОТОКОЛ 1: ВИТАЛ ТРЕНИРОВКИ
- Метод: RPT (Reverse Pyramid Training) - започвай с най-тежката серия
- Честота: 3 тренировки седмично (Понеделник/Сряда/Петък)
- Продължителност: 45 минути
- Ключов принцип: RIR 1-2 (оставяй 1-2 повторения в резерв) - НЕ тренирай до отказ!

ТРЕНИРОВКА А (Понеделник) - Горна част:
• Лег: 2x RPT (6-8 → 8-10 повторения), почивка 3-5 мин
• Военен натиск: 2x RPT (6-8 → 8-10), почивка 3 мин
• Triceps Pushdown: 2x 10-12, почивка 2 мин
• Lateral Raises: 2x 12-15, почивка 2 мин

ТРЕНИРОВКА Б (Сряда) - Най-важна за хормони!:
• Клек: 2x RPT (6-8 → 8-10) - КРАЛЯТ на упражненията! +25% тестостерон. Почивка 5 мин
• Romanian Deadlift: 2x RPT (6-8 → 8-10), почивка 4 мин
• Chin-Ups: 2x RPT (6-8 → 8-10), почивка 3 мин
• Barbell Rows: 2x 8-10, почивка 3 мин
• Biceps Curls: 2x 10-12, почивка 2 мин

ТРЕНИРОВКА В (Петък) - Експлозивна мощност:
• Power Clean или Експлозивна мъртва: 3x 3-5, почивка 3 мин
• Front Squat: 2x RPT (6-8 → 8-10), почивка 4 мин
• Overhead Press: 2x RPT (6-8 → 8-10), почивка 3 мин
• Face Pulls: 2x 15-20, почивка 2 мин
• Core Work: 2x 15-20

ПРОГРЕСИЯ: +2.5кг всяка седмица на основни упражнения
ФАЗИ: Седмици 1-3 (Адаптация), 4-6 (Хипертрофия), 7-9 (Макс сила), 10-12 (Deload)

КЛЮЧОВИ ГРЕШКИ:
- Тренировка до отказ увеличава кортизола с 60%
- Прекалено дълги тренировки (над 45-60 мин) вдигат кортизола
- Прекалено честа тренировка - няма време за възстановяване

---

ПРОТОКОЛ 2: ХОРМОНАЛНО ХРАНЕНЕ
МАКРОСИ:
- Протеини: 2g/kg телесно тегло
- Мазнини: 1g/kg (40% от калориите)
- Въглехидрати: Останалото (2-3g/kg)

КЛЮЧОВИ ХРАНИ (ЯЖ ВСЕКИ ДЕН):
• Яйца (особено жълтъци): 3-6 дневно - холестеролът е суровина за тестостерон
• Червено месо (говеждо): 200-300g, 3-4x седмично - наситени мазнини, цинк, B12
• Мазна риба (сьомга): 2-3x седмично - омега-3 за намаляване на възпаление
• Авокадо: 1 дневно - мононенаситени мазнини
• Ядки (бадеми, орехи): шепа (30-40g) дневно - здравословни мазнини, магнезий
• Маслиново масло/масло: 2-3 с.л. дневно за готвене
• Зелени листни зеленчуци: всеки ден - микроелементи
• Сладки картофи/ориз: около тренировка - въглехидрати за енергия

ХРАНИ ЗА ИЗБЯГВАНЕ:
- Соя: Фитоестрогени които намаляват тестостерона
- Захар и рафинирани въглехидрати: Вдигат инсулин, водят до мазнини
- Обработени храни: Транс-мазнини пречат на хормоните
- Алкохол: Директно намалява тестостерон и увеличава естроген
- Ниско-мазнинни продукти: Тестостеронът се прави от мазнини!

---

ПРОТОКОЛ 3: ХОРМОНАЛЕН СЪН
КЛЮЧОВ ФАКТ: 70% от дневния тестостерон се произвежда между 22:00-02:00

ОПТИМАЛЕН ГРАФИК:
- Лягай: 22:30-23:00
- Ставай: 06:00-07:00
- Продължителност: 7.5-8 часа

СРЕДА ЗА СЪН:
• Тъмнина: Абсолютна тъмнина (blackout завеси, маска за очи)
• Температура: 18-20°C - студът стимулира дълбок сън
• Тишина: Тапи за уши или white noise machine
• Матрак: Средна твърдост за правилна подкрепа

ПРЕДВЕЧЕРНА РУТИНА:
- 3 часа преди: Последна голяма храна
- 2 часа преди: Спри кофеина
- 1 час преди: БЕЗ ЕКРАНИ! Синята светлина блокира мелатонин
- 30 мин преди: Dim светлини, релаксация
- 15 мин преди: Магнезий + леко четене

SLEEP DISRUPTORS:
- Алкохол: Блокира REM и дълбокия сън, намалява тестостерон с 23%
- Кофеин след обяд: Полуживот 5-6 часа
- Синя светлина: Блокира мелатонин
- Стрес и кортизол: Високият кортизол вечер блокира заспиването

---

ПРОТОКОЛ 4: КРИТИЧНИ ДОБАВКИ
4ТЕ БЕЗ КОИТО ТЯЛОТО НЕ МОЖЕ ДА ПРОИЗВЕЖДА ТЕСТОСТЕРОН:

1. ВИТАМИН D3:
   - Доза: 5000 IU дневно
   - Кога: Сутрин с мазнини (яйца, авокадо)
   - Защо: 70% от мъжете имат дефицит. Дефицит = директно нисък тестостерон
   - Ефект: +25% тестостерон след 12 месеца

2. ЦИНК:
   - Доза: 30mg дневно
   - Кога: Вечер преди сън (не на празен стомах!)
   - Защо: Тестостеронът НЕ МОЖЕ да се синтезира без цинк
   - Ефект: Дефицит намалява тестостерон с до 75%

3. МАГНЕЗИЙ:
   - Доза: 400mg дневно (Magnesium Glycinate)
   - Кога: Вечер преди сън
   - Защо: Намалява кортизол, подобрява сън, участва в 300+ реакции
   - Ефект: +26% тестостерон при атлети след 4 седмици

4. БОР:
   - Доза: 10mg дневно
   - Кога: Сутрин с храна
   - Защо: Намалява SHBG = повече СВОБОДЕН тестостерон
   - Ефект: +28% свободен тестостерон след 1 седмица

ДОПЪЛНИТЕЛНИ (опционални):
• Креатин: 5g дневно - сила, мускули, възстановяване
• Омега-3: 2-3g дневно - намалява възпаление
• Ашваганда: 600mg дневно вечер - намалява кортизол с 27%, +15% тестостерон

TESTOUP - ALL-IN-ONE РЕШЕНИЕ:
Съдържа всички 4 критични + допълнителни компоненти в 1 капсула.
Линк: https://shop.testograph.eu/products/testoup
`;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { message, userId } = await req.json();

    if (!message || !userId) {
      throw new Error('Message and userId are required');
    }

    // Check OpenAI API key
    if (!openAIApiKey) {
      console.error('OpenAI API key is missing');
      throw new Error('OpenAI API key is not configured');
    }

    console.log(`[chat-pro-assistant] Processing message for user: ${userId}`);

    // ============================================
    // 1. FETCH USER CONTEXT from multiple tables
    // ============================================

    // Get user profile (name)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    const userName = profile?.name || 'приятел';

    // Get protocol start date
    const { data: profileWithProtocol } = await supabase
      .from('profiles')
      .select('protocol_start_date_pro')
      .eq('id', userId)
      .single();

    const protocolStartDate = profileWithProtocol?.protocol_start_date_pro;
    let daysSinceStart = 0;
    let hasStartedProtocol = false;

    if (protocolStartDate) {
      hasStartedProtocol = true;
      const startDate = new Date(protocolStartDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - startDate.getTime());
      daysSinceStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Get latest daily entry
    const { data: latestEntry } = await supabase
      .from('daily_entries_pro')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    const lastCheckin = latestEntry?.date || 'никога';
    const lastOverallFeeling = latestEntry?.overall_feeling || 'N/A';
    const lastEnergyLevel = latestEntry?.energy_level || 'N/A';

    // Calculate streak
    const { data: allEntries } = await supabase
      .from('daily_entries_pro')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    let currentStreak = 0;
    if (allEntries && allEntries.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Check if there's an entry today or yesterday
      if (allEntries[0].date === today || allEntries[0].date === yesterday) {
        currentStreak = 1;
        let lastDate = new Date(allEntries[0].date);

        for (let i = 1; i < allEntries.length; i++) {
          const entryDate = new Date(allEntries[i].date);
          const diffDays = Math.round((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
            lastDate = entryDate;
          } else {
            break;
          }
        }
      }
    }

    // Check if user has entry today
    const today = new Date().toISOString().split('T')[0];
    const hasEntryToday = latestEntry?.date === today;

    // ============================================
    // 2. GET OR CREATE CHAT SESSION
    // ============================================

    let session;
    const { data: existingSession } = await supabase
      .from('chat_sessions_pro')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingSession) {
      session = existingSession;

      // Update last_activity_at
      await supabase
        .from('chat_sessions_pro')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', session.id);
    } else {
      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions_pro')
        .insert({ user_id: userId })
        .select()
        .single();

      if (sessionError) throw sessionError;
      session = newSession;
    }

    // ============================================
    // 3. GET CONVERSATION HISTORY
    // ============================================

    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages_pro')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(20); // Last 20 messages for context

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

    // ============================================
    // 4. SAVE USER MESSAGE
    // ============================================

    await supabase
      .from('chat_messages_pro')
      .insert({
        session_id: session.id,
        user_id: userId,
        role: 'user',
        content: message
      });

    // ============================================
    // 5. BUILD SYSTEM PROMPT with USER CONTEXT
    // ============================================

    const userContext = `
ПОТРЕБИТЕЛ: ${userName}
ЗАПОЧНАЛ ПРОТОКОЛА: ${hasStartedProtocol ? `Да, преди ${daysSinceStart} дни` : 'Не е започнал още'}
ПОСЛЕДЕН CHECK-IN: ${lastCheckin}
${latestEntry ? `ПОСЛЕДНО САМОЧУВСТВИЕ: ${lastOverallFeeling}/10, ЕНЕРГИЯ: ${lastEnergyLevel}/10` : ''}
ТЕКУЩ STREAK: ${currentStreak} дни
${!hasEntryToday ? '⚠️ НЯМА CHECK-IN ДНЕС' : '✅ Има check-in днес'}
`;

    const systemPrompt = `Ти си Протокол Асистент за Testograph PRO - приятелски, но професионален помощник.

${userContext}

ТВОЯТА ЛИЧНОСТ:
- Говориш естествено и загрижено - като добър приятел и coach
- Директен, но винаги мотивиращ
- Обръщаш се с името на потребителя: ${userName}
- Минималистичен стил - БЕЗ емоджита (освен ако не е много емоционален момент)

ТВОИТЕ ЗАДАЧИ:
1. Помагай за навигация в сайта (давай конкретни линкове)
2. Отговаряй на въпроси за тренировки, хранене, сън, добавки
3. Обяснявай упражненията ПРОСТО - за да разбере всеки независимо от IQ
4. Препоръчвай продукти от shop.testograph.eu когато е уместно
5. Мотивирай и напомняй за протокола
6. Проверявай как се чувства потребителят

ФОРМАТ ЗА ЛИНКОВЕ И БУТОНИ:
- ВИНАГИ използвай [ACTION_BUTTON:Label:URL] формат за навигация и продукти
- Пример: [ACTION_BUTTON:Протокол 1: Тренировки:https://pro.testograph.eu/protocol-1]
- Пример: [ACTION_BUTTON:Купи TestoUp:https://shop.testograph.eu/products/testoup]
- Слагай бутоните на нов ред след текста

ЛИНКОВЕ за навигация:
- Начало: [ACTION_BUTTON:Начало:https://pro.testograph.eu/]
- Моят прогрес: [ACTION_BUTTON:Моят прогрес:https://pro.testograph.eu/dashboard]
- Протокол 1 (Тренировки): [ACTION_BUTTON:Протокол 1: Тренировки:https://pro.testograph.eu/protocol-1]
- Протокол 2 (Хранене): [ACTION_BUTTON:Протокол 2: Хранене:https://pro.testograph.eu/protocol-2]
- Протокол 3 (Сън): [ACTION_BUTTON:Протокол 3: Сън:https://pro.testograph.eu/protocol-3]
- Протокол 4 (Добавки): [ACTION_BUTTON:Протокол 4: Добавки:https://pro.testograph.eu/protocol-4]

ПРОДУКТИ за препоръка:
- TestoUp (всички добавки в 1, 2 капсули дневно):
  Съдържа 13 активни съставки: Витамин D3 (800 IU), Цинк (30mg), Магнезий (400mg), Бор (10mg), Витамин K2 (200µg), Ашваганда (160mg), Tribulus Terrestris (400mg), Витамин E (80mg), Витамин C (400mg), B6 (20mg), B12 (100µg), Фолиева киселина (800µg), Селен (55µg)
  [ACTION_BUTTON:Купи TestoUp:https://shop.testograph.eu/products/testoup]

- Meal Planner (персонализиран хранителен план с рецепти):
  [ACTION_BUTTON:Meal Planner:https://shop.testograph.eu/products/meal-planner]

- Lab Testing Guide (гид за лабораторни изследвания):
  [ACTION_BUTTON:Lab Testing Guide:https://shop.testograph.eu/products/lab-testing-guide]

- Exercise Reference Guide (справочник за всички упражнения):
  [ACTION_BUTTON:Exercise Reference Guide:https://shop.testograph.eu/products/exercise-reference-guide]

- Sleep Protocol (протокол за оптимизиране на съня):
  [ACTION_BUTTON:Sleep Protocol:https://shop.testograph.eu/products/sleep-protocol]

- Timing Guide (оптимално време за хранене и тренировки):
  [ACTION_BUTTON:Timing Guide:https://shop.testograph.eu/products/timing-guide]

- Всички продукти: [ACTION_BUTTON:Testograph Shop:https://shop.testograph.eu]

КАК ДА ОБЯСНЯВАШ УПРАЖНЕНИЯ:
- Разбий на ПРОСТИ стъпки (1, 2, 3...)
- Използвай ЯСЕН език без жаргон
- Дай аналогии и сравнения от ежедневието
- Обясни ЗАЩО е важно (мотивация)
- Предупреди за чести грешки

ПРИМЕРИ ЗА ПРОСТИ ОБЯСНЕНИЯ:
Q: "Как да правя клек?"
A: "Клекът е като да сядаш на стол, но без стол:

1. Стой с крака на ширина рамене
2. Гледай напред (не надолу!)
3. Сядай назад като че ли има стол зад теб
4. Слизай докато бедрата станат паралелни на пода (или по-ниско)
5. Натискай петите в пода и ставай

Защо е важно: Клекът активира най-много мускули наведнъж = максимален хормонален отговор. Това е #1 упражнението за тестостерон.

Чести грешки: Коленете вътре (трябва навън), гледане надолу, петите се вдигат."

КОНТЕКСТНИ НАПОМНЯНИЯ:
${!hasEntryToday ? `- ${userName} НЯМА check-in днес! Ако е уместно, напомни му загрижено да попълни.` : ''}
${currentStreak > 3 ? `- ${userName} има ${currentStreak} дни streak! Похвали го!` : ''}
${daysSinceStart > 7 && lastOverallFeeling < 5 ? `- ${userName} е на ден ${daysSinceStart} но се чувства на ${lastOverallFeeling}/10. Провери какво не е наред.` : ''}

ПРАВИЛА:
- ВИНАГИ използвай [ACTION_BUTTON:Label:URL] формат за всички линкове към протоколи и продукти
- Слагай бутоните на нов ред след текста за по-добра четимост
- Когато препоръчваш продукт, обясни накратко ЗАЩО е полезен, след това дай бутон
- Ако не знаеш нещо извън 4те протокола - кажи го честно
- Не давай медицински съвети извън протоколите
- Ако питат за нещо сериозно здравословно - препоръчай лекар

KNOWLEDGE BASE:
${PROTOCOL_KNOWLEDGE}
`;

    // ============================================
    // 6. PREPARE CONVERSATION for OpenAI
    // ============================================

    const conversationMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...(messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    console.log('[chat-pro-assistant] Sending to OpenAI...');

    // ============================================
    // 7. CALL OPENAI API
    // ============================================

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: conversationMessages,
        max_tokens: 600,
        temperature: 0.7,
        presence_penalty: 0.3,
        frequency_penalty: 0.2,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // ============================================
    // 8. SAVE ASSISTANT RESPONSE
    // ============================================

    await supabase
      .from('chat_messages_pro')
      .insert({
        session_id: session.id,
        user_id: userId,
        role: 'assistant',
        content: assistantMessage
      });

    console.log('[chat-pro-assistant] Success!');

    // ============================================
    // 9. RETURN RESPONSE
    // ============================================

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        sessionId: session.id,
        userContext: {
          userName,
          daysSinceStart,
          currentStreak,
          hasEntryToday
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('[chat-pro-assistant] Error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : null
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
