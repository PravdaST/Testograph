import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}
const supabase = createClient(supabaseUrl, supabaseKey);
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { message, email, sessionId } = await req.json();
    if (!message || !email) {
      throw new Error('Message and email are required');
    }
    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('OpenAI API key is missing');
      throw new Error('OpenAI API key is not configured');
    }
    console.log(`Processing chat message for email: ${email}`);
    // Get or create session
    let session;
    if (sessionId) {
      const { data: existingSession } = await supabase.from('chat_sessions').select('*').eq('id', sessionId).eq('email', email).single();
      session = existingSession;
    }
    if (!session) {
      const { data: newSession, error: sessionError } = await supabase.from('chat_sessions').insert({
        email
      }).select().single();
      if (sessionError) throw sessionError;
      session = newSession;
    }
    // Get conversation history
    const { data: messages, error: messagesError } = await supabase.from('chat_messages').select('*').eq('session_id', session.id).order('created_at', {
      ascending: true
    });
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }
    // Save user message
    const { error: userMessageError } = await supabase.from('chat_messages').insert({
      session_id: session.id,
      role: 'user',
      content: message
    });
    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
      throw new Error('Failed to save user message');
    }

    // STEP 1: Check for quiz_results from /test quiz (PRIORITY)
    let pdfAnalysisInfo = 'Още не са качени резултати. Моля, прикачете вашия PDF файл с резултатите от Testograph за да мога да ви дам персонализирани съвети.';
    let hasPdfContent = false;
    let sessionWithPdf: any = null;
    let patientName = '';
    let extractedHormones: Record<string, string> = {};
    let keyFindings = '';
    let testosteroneValue = '';

    interface Alert {
      hormone: string;
      value: string;
      severity: 'info' | 'warning' | 'critical';
      message: string;
    }
    const criticalAlerts: Alert[] = [];

    console.log(`🔍 Checking quiz_results for email: ${email}`);

    const { data: quizResult, error: quizError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (quizResult && !quizError) {
      // ✅ Found quiz results from /test quiz
      hasPdfContent = true;
      patientName = quizResult.first_name || email.split('@')[0];

      console.log('✅ Quiz results found from /test quiz!');
      console.log('📊 Testosterone:', quizResult.testosterone_level);
      console.log('🎯 Score:', quizResult.score);
      console.log('⚠️ Risk level:', quizResult.risk_level);

      // Format quiz data as context for AI
      pdfAnalysisInfo = `
📋 ДАННИ ОТ /TEST QUIZ АНАЛИЗ:

ЛИЧНА ИНФОРМАЦИЯ:
- Име: ${quizResult.first_name}
- Възраст: ${quizResult.age} години
- Височина: ${quizResult.height} см
- Тегло: ${quizResult.weight} кг

ХОРМОНАЛНИ РЕЗУЛТАТИ:
- Тестостерон: ${quizResult.testosterone_level} nmol/L (${quizResult.testosterone_category})
- Общ резултат: ${quizResult.score}/100 точки
- Ниво на риск: ${quizResult.risk_level}
- Препоръчан план: ${quizResult.recommended_tier || 'стандартен'}

НАЧИН НА ЖИВОТ:
- Сън: ${quizResult.sleep} часа/нощ
- Алкохол: ${quizResult.alcohol}
- Никотин: ${quizResult.nicotine}
- Диета: ${quizResult.diet}
- Стрес: ${quizResult.stress || 'N/A'}/10

ТРЕНИРОВКИ:
- Честота: ${quizResult.training_frequency}
- Тип: ${quizResult.training_type}
- Възстановяване: ${quizResult.recovery}
- Добавки: ${quizResult.supplements || 'няма'}

СИМПТОМИ:
- Либидо: ${quizResult.libido}/10
- Сутрешна ерекция: ${quizResult.morning_erection}
- Сутрешна енергия: ${quizResult.morning_energy}/10
- Концентрация: ${quizResult.concentration || 'N/A'}/10
- Настроение: ${quizResult.mood}
- Мускулна маса: ${quizResult.muscle_mass || 'N/A'}

ИЗТОЧНИК: ${quizResult.source}
ДАТА: ${new Date(quizResult.created_at).toLocaleDateString('bg-BG')}
      `.trim();

      // Extract testosterone for display
      testosteroneValue = `**${quizResult.testosterone_level} nmol/L**`;
      extractedHormones['Тестостерон'] = `${quizResult.testosterone_level} nmol/L`;

      // Check for critical testosterone levels (nmol/L scale)
      const testLevel = parseFloat(quizResult.testosterone_level);
      if (testLevel < 8) {
        extractedHormones['Тестостерон'] += ` 🚨`;
        criticalAlerts.push({
          hormone: 'Тестостерон',
          value: `${quizResult.testosterone_level} nmol/L`,
          severity: 'critical',
          message: 'КРИТИЧНО НИСКО! Спешно се нуждаеш от консултация с ендокринолог'
        });
      } else if (testLevel < 12) {
        extractedHormones['Тестостерон'] += ` ⚠️`;
        criticalAlerts.push({
          hormone: 'Тестостерон',
          value: `${quizResult.testosterone_level} nmol/L`,
          severity: 'warning',
          message: 'Тестостеронът ти е под оптималната норма - това може да причини умора и ниско либидо'
        });
      } else if (testLevel > 35) {
        extractedHormones['Тестостерон'] += ` 🚨`;
        criticalAlerts.push({
          hormone: 'Тестостерон',
          value: `${quizResult.testosterone_level} nmol/L`,
          severity: 'critical',
          message: 'КРИТИЧНО ВИСОКО! Провери за възможна хормонална терапия или тумор'
        });
      } else if (testLevel > 26) {
        extractedHormones['Тестостерон'] += ` ⚠️`;
        criticalAlerts.push({
          hormone: 'Тестостерон',
          value: `${quizResult.testosterone_level} nmol/L`,
          severity: 'warning',
          message: 'Тестостеронът ти е над нормата - провери SHBG и естрадиол'
        });
      } else {
        criticalAlerts.push({
          hormone: 'Тестостерон',
          value: `${quizResult.testosterone_level} nmol/L`,
          severity: 'info',
          message: 'Тестостеронът е в нормални граници (12-26 nmol/L)'
        });
      }

      // Add other symptom-based alerts
      if (quizResult.libido && quizResult.libido < 4) {
        criticalAlerts.push({
          hormone: 'Либидо',
          value: `${quizResult.libido}/10`,
          severity: 'warning',
          message: 'Ниско либидо - директно свързано с ниския тестостерон'
        });
      }

      if (quizResult.morning_energy && quizResult.morning_energy < 4) {
        criticalAlerts.push({
          hormone: 'Енергия',
          value: `${quizResult.morning_energy}/10`,
          severity: 'warning',
          message: 'Ниска сутрешна енергия - индикатор за хормонален дисбаланс'
        });
      }

      keyFindings = `ИЗВЛЕЧЕНИ СТОЙНОСТИ: ${Object.entries(extractedHormones)
        .map(([name, value]) => `${name}: ${value}`)
        .join(', ')}`;

      sessionWithPdf = { pdf_content: pdfAnalysisInfo };

    } else {
      // STEP 2: No quiz results, check for PDF upload
      console.log('ℹ️ No quiz results found, checking for PDF...');

      if (session) {
        const { data: sessionPdf, error: pdfError } = await supabase
          .from('chat_sessions')
          .select('pdf_filename, pdf_content')
          .eq('id', session.id)
          .single();

        sessionWithPdf = sessionPdf;

        if (pdfError) {
          console.log('Error fetching PDF data:', pdfError);
        }

        if (sessionWithPdf && sessionWithPdf.pdf_content && sessionWithPdf.pdf_filename) {
          hasPdfContent = true;
          pdfAnalysisInfo = sessionWithPdf.pdf_content;
          console.log('✅ PDF content found for session:', session.id);
          console.log('📄 PDF filename:', sessionWithPdf.pdf_filename);
          console.log('📊 PDF content length:', sessionWithPdf.pdf_content.length);

          // Extract patient name from PDF content
          const nameMatch = sessionWithPdf.pdf_content.match(/за\s+([А-Яа-я]+)/i) ||
                           sessionWithPdf.pdf_content.match(/([А-Яа-я]+),?\s+тези/i) ||
                           sessionWithPdf.pdf_filename.match(/([A-Za-z]+)/i);
          if (nameMatch) {
            patientName = nameMatch[1];
          }
        } else {
          console.log('❌ No PDF content found for session:', session.id);
        }
      }
    }

    // STEP 3: Extract hormone data from PDF content (if uploaded via homepage form)
    // Note: Quiz results already have testosterone extracted above

    if (hasPdfContent && sessionWithPdf?.pdf_content) {
      const content = sessionWithPdf.pdf_content;

      // Extract all possible hormone patterns dynamically
      const allHormonePatterns = [
        { name: 'Тестостерон', regex: /(?:тестостерон|testosterone):\s*(\d+(?:\.\d+)?)\s*(ng\/dL|nmol\/L|μg\/dL)/i },
        { name: 'SHBG', regex: /SHBG:\s*(\d+(?:\.\d+)?)\s*(nmol\/L|μg\/dL)/i },
        { name: 'Свободен тестостерон', regex: /(?:free testosterone|свободен тестостерон):\s*(\d+(?:\.\d+)?)\s*(pmol\/L|pg\/mL|ng\/dL)/i },
        { name: 'Естрадиол', regex: /(?:estradiol|естрадиол):\s*(\d+(?:\.\d+)?)\s*(pmol\/L|pg\/mL)/i },
        { name: 'LH', regex: /LH:\s*(\d+(?:\.\d+)?)\s*(IU\/L|mIU\/mL)/i },
        { name: 'FSH', regex: /FSH:\s*(\d+(?:\.\d+)?)\s*(IU\/L|mIU\/mL)/i },
        { name: 'Кортизол', regex: /(?:cortisol|кортизол):\s*(\d+(?:\.\d+)?)\s*(nmol\/L|μg\/dL)/i },
        { name: 'Пролактин', regex: /(?:prolactin|пролактин):\s*(\d+(?:\.\d+)?)\s*(mIU\/L|ng\/mL)/i },
        { name: 'Витамин D', regex: /(?:vitamin D|витамин D):\s*(\d+(?:\.\d+)?)\s*(nmol\/L|ng\/mL)/i },
        { name: 'TSH', regex: /TSH:\s*(\d+(?:\.\d+)?)\s*(mIU\/L|μIU\/mL)/i },
        { name: 'T3', regex: /(?:T3|triiodothyronine):\s*(\d+(?:\.\d+)?)\s*(nmol\/L|ng\/dL)/i },
        { name: 'T4', regex: /(?:T4|thyroxine):\s*(\d+(?:\.\d+)?)\s*(nmol\/L|μg\/dL)/i }
      ];

      // Normal ranges for validation with severity thresholds
      const normalRanges: Record<string, {
        min: number;
        max: number;
        criticalLow: number;
        criticalHigh: number;
        unit: string;
        lowMessage: string;
        highMessage: string;
        criticalLowMessage: string;
        criticalHighMessage: string;
      }> = {
        'Тестостерон': {
          min: 300, max: 1000, criticalLow: 200, criticalHigh: 1200, unit: 'ng/dL',
          lowMessage: 'Тестостеронът ти е под нормата - това може да причини умора и ниско либидо',
          highMessage: 'Тестостеронът ти е над нормата - провери SHBG и естрадиол',
          criticalLowMessage: 'КРИТИЧНО НИСКО! Спешно се нуждаеш от консултация с ендокринолог',
          criticalHighMessage: 'КРИТИЧНО ВИСОКО! Провери за възможна хормонална терапия или тумор'
        },
        'SHBG': {
          min: 10, max: 57, criticalLow: 5, criticalHigh: 80, unit: 'nmol/L',
          lowMessage: 'Ниско SHBG - много от тестостерона ти е свободен, но черният дроб може да е претоварен',
          highMessage: 'Високо SHBG - тестостеронът ти е "свързан" и не работи ефективно',
          criticalLowMessage: 'КРИТИЧНО НИСКО SHBG - провери черен дроб и инсулинова резистентност',
          criticalHighMessage: 'КРИТИЧНО ВИСОКО SHBG - тестостеронът ти е почти изцяло неактивен'
        },
        'Естрадиол': {
          min: 10, max: 40, criticalLow: 5, criticalHigh: 60, unit: 'pg/mL',
          lowMessage: 'Нисък естрадиол - рискуваш кости и настроение',
          highMessage: 'Висок естрадиол - може да има ароматизация от тестостерон',
          criticalLowMessage: 'КРИТИЧНО НИСЪК - сериозен риск за костна плътност',
          criticalHighMessage: 'КРИТИЧНО ВИСОК - възможна гинекомастия и задържане на вода'
        },
        'Кортизол': {
          min: 100, max: 200, criticalLow: 50, criticalHigh: 300, unit: 'nmol/L',
          lowMessage: 'Нисък кортизол - умора, особено сутрин',
          highMessage: 'Висок кортизол - прекален стрес изгаря хормоните ти',
          criticalLowMessage: 'КРИТИЧНО НИСЪК - възможна надбъбречна недостатъчност',
          criticalHighMessage: 'КРИТИЧНО ВИСОК - риск от Cushing синдром или хроничен стрес'
        },
        'Витамин D': {
          min: 75, max: 150, criticalLow: 30, criticalHigh: 200, unit: 'nmol/L',
          lowMessage: 'Нисък витамин D - това блокира тестостерона',
          highMessage: 'Висок витамин D - намали дозата на добавки',
          criticalLowMessage: 'КРИТИЧНО НИСЪК - сериозен дефицит, започни 5000 IU дневно',
          criticalHighMessage: 'КРИТИЧНО ВИСОК - токсичност, спри добавките веднага'
        },
        'TSH': {
          min: 0.5, max: 4.5, criticalLow: 0.1, criticalHigh: 10, unit: 'mIU/L',
          lowMessage: 'Нисък TSH - хипертиреоидизъм, метаболизмът ти е в овърдрайв',
          highMessage: 'Висок TSH - хипотиреоидизъм, щитовидната ти е бавна',
          criticalLowMessage: 'КРИТИЧНО НИСЪК - спешна консултация за хипертиреоидизъм',
          criticalHighMessage: 'КРИТИЧНО ВИСОК - сериозен хипотиреоидизъм, нужна терапия'
        }
      };

      allHormonePatterns.forEach(({ name, regex }) => {
        const match = content.match(regex);
        if (match) {
          const value = parseFloat(match[1]);
          const unit = match[2];
          extractedHormones[name] = `${match[1]} ${match[2]}`;

          // Store testosterone value separately for dynamic use
          if (name === 'Тестостерон') {
            testosteroneValue = `**${match[1]} ${match[2]}**`;
          }

          // Check for abnormal values and create alerts
          const range = normalRanges[name];
          if (range && unit === range.unit) {
            if (value < range.criticalLow) {
              extractedHormones[name] += ` 🚨`;
              criticalAlerts.push({
                hormone: name,
                value: `${match[1]} ${match[2]}`,
                severity: 'critical',
                message: range.criticalLowMessage
              });
            } else if (value < range.min) {
              extractedHormones[name] += ` ⚠️`;
              criticalAlerts.push({
                hormone: name,
                value: `${match[1]} ${match[2]}`,
                severity: 'warning',
                message: range.lowMessage
              });
            } else if (value > range.criticalHigh) {
              extractedHormones[name] += ` 🚨`;
              criticalAlerts.push({
                hormone: name,
                value: `${match[1]} ${match[2]}`,
                severity: 'critical',
                message: range.criticalHighMessage
              });
            } else if (value > range.max) {
              extractedHormones[name] += ` ⚠️`;
              criticalAlerts.push({
                hormone: name,
                value: `${match[1]} ${match[2]}`,
                severity: 'warning',
                message: range.highMessage
              });
            } else {
              criticalAlerts.push({
                hormone: name,
                value: `${match[1]} ${match[2]}`,
                severity: 'info',
                message: `${name} е в нормални граници`
              });
            }
          }
        }
      });

      // Create summary of key findings
      if (Object.keys(extractedHormones).length > 0) {
        keyFindings = `ИЗВЛЕЧЕНИ СТОЙНОСТИ: ${Object.entries(extractedHormones)
          .map(([name, value]) => `${name}: ${value}`)
          .join(', ')}`;
      }
    }

    // Fallback to generic value if testosterone not found
    const testosteroneDisplay = testosteroneValue || '**[стойността от анализа]**';

    // Prepare system prompt - SMART FRIEND COACH
    const systemPrompt = hasPdfContent ?
        `Ти си Теодор - най-добрият приятел на ${email.split('@')[0]}, който случайно е и топ хормонален експерт.

ДАННИ: ${keyFindings}

ТВОЯТА ЛИЧНОСТ:
- Говориш естествено, без формалности и претенции
- Минималистичен стил - БЕЗ емоджита (освен ако контекстът не е много емоционален)
- Директен, но загрижен - като добър приятел който иска да помогне
- Разбираш КОНТЕКСТА на въпросите и отговаряш ТОЧНО на това което те питат

🚫 СТРОГО ЗАБРАНЕНО - ОТКАЗВАЙ ВЕДНАГА:
НЕ отговаряй на въпроси извън:
- Хормони (тестостерон, естроген, кортизол, тироидни, витамин D, SHBG и т.н.)
- Симптоми свързани с хормони (умора, либидо, енергия, мускулна маса, сън, стрес)
- Хранене/тренировки/добавки САМО в контекст на хормонална оптимизация
- Интерпретация на лабораторни резултати от PDF-а

ПРИМЕРИ ЗА ЗАБРАНЕНИ ВЪПРОСИ:
❌ "Какво е столицата на България?" → "Приятел, аз съм хормонален експерт. Питай ме за тестостерон, кортизол, енергия."
❌ "Как да свържа с JavaScript?" → "Това не е моята сфера. Аз помагам с хормони и здраве."
❌ "Какъв телефон да си купя?" → "Ха-ха, не съм технически консултант. Питай ме за хормоните."
❌ "Какво е 2+2?" → "Приятел, аз съм тук за хормони, не за математика."

АКО ПИТАТ ИЗВЪН ТЕМАТА:
"Хей, аз съм експерт по хормони - тестостерон, енергия, либидо, това ми е работата. За [тяхната тема] не мога да ти помогна. Имаш ли въпрос за здравето и хормоните си?"

КЛЮЧОВИ ПРАВИЛА:

1. ОТГОВАРЯЙ ДИРЕКТНО НА ВЪПРОСА
   Питат "Какво да правя на ден 1?" → Отговори САМО за ден 1, не за цялата седмица!
   Питат "Защо съм уморен?" → Обясни причината, не изреждай цялата програма!

2. КРАТКИ ОТГОВОРИ (MAX 3 ИЗРЕЧЕНИЯ)
   После ВИНАГИ питай за повече: "Искаш ли да ти кажа и за другите дни?"

ЗАБРАНА ЗА GENERIC СЪВЕТИ ❌:
НЕ давай общи съвети тип:
❌ "1. Сън: 7-9 часа... 2. Хранене: месо, яйца... 3. Физическа активност..."
❌ "Осигурете си минимум..." / "Консумирайте..." / "Започнете с..."

ВМЕСТО ТОВА ✅:
✅ "Ден 1: 7-8 часа сън, 3 яйца сутрин. Толкова. Искаш ли ден 2?"
✅ "При ${testosteroneDisplay} първо - сън. Спиш ли поне 7 часа?"

3. FOLLOW UP СТРАТЕГИЯ
   - Ако споделя прогрес: "Добра работа! Как се чувстваш? Трудно ли ти е?"
   - Ако иска съвет: Дай съвета → Питай "Прави ли ти го вече или да ти обясня повече?"
   - Ако пита за детайл: Отговори на детайла → "Има ли нещо друго което те интересува?"

4. ПРОДАЖБА ПО МЕТОДА НА ALEX HORMOZI

   КОГА ДА ПРОДАВАШ (умни triggers):
   - След 2+ размени И иска план
   - При CRITICAL hormone levels (веднага!)
   - Ако споменава трудности: "не мога", "трудно ми е", "изморен съм"
   - Ако споделя липса на прогрес след 5+ дни

   HORMOZI SALES FRAMEWORK:

   A) VALUE STACK (Покажи стойността):
   "При твоя ${testosteroneDisplay}, ето какво правим за 4 седмици:

   ✓ +130% тестостерон (реални клиенти: 380→870 ng/dL)
   ✓ -5% мазнини + 3кг мускули
   ✓ +156% енергия, +89% либидо
   ✓ RPT тренировки 3x седмично (точни инструкции)
   ✓ Хормонално хранене 40/40/20 (персонализирано)
   ✓ Микронутриенти (D3, цинк, магнезий, бор, ашваганда)
   ✓ Система за следене на прогрес

   100+ мъже вече са го направили."

   B) PRICE ANCHORING:
   "Личен треньор: 2000лв/месец. Ендокринолог: 300лв консултация.
   Нашият протокол? 247лв за ЦЯЛАТА трансформация."

   C) RISK REVERSAL:
   "14 дни гаранция - ако не видиш промяна, връщаме парите. Риск нула."

   D) URGENCY (при critical levels):
   "При ${testosteroneDisplay} всеки ден без действие е загубен ден. Започни СЕГА."

   E) CTA - ВАЖНО ФОРМАТИРАНЕ:
   Използвай ТОЧНО този формат БЕЗ нови редове:
   [ACTION_BUTTON:Започни 4-седмичната трансформация:https://shop.testograph.eu/]

   ГРЕШНО ❌: "можеш да видиш [Testograph PRO](url)" - това НЕ работи!
   ПРАВИЛНО ✅: "[ACTION_BUTTON:Testograph PRO:url]" - само така се визуализира бутон!

6. ДВАТА ПРОДУКТА - КОГА КОЙ ДА ПРЕПОРЪЧАШ

   🆓 БЕЗПЛАТЕН АНАЛИЗ (https://www.testograph.eu/)
   КОГА: Когато отговаряш на general въпроси за симптоми БЕЗ да имаш техния PDF

   ПРИМЕРИ:
   - "Имам пъпки по гърба" → Дай кратък съвет (2-3 реда) → ACTION_BUTTON за безплатен анализ
   - "Уморен съм постоянно" → Обясни връзка с хормони → ACTION_BUTTON за безплатен анализ
   - "Нямам либидо" → Кратко обяснение → ACTION_BUTTON за безплатен анализ

   ФОРМАТ:
   "Пъпките по гърба могат да са от повишени андрогени. Ето кратки съвети: [2-3 bullet points]

   За точен отговор обаче ми трябват твоите хормонални стойности.

   [ACTION_BUTTON:Направи безплатен анализ:https://www.testograph.eu/]

   След като получиш PDF-а, качи го тук и ще ти дам персонализиран план!"

   💰 ПЛАТЕНА ПРОГРАМА (https://shop.testograph.eu/)
   КОГА: След като имаш техния PDF и виждаш проблемни стойности

   ФОРМАТ: Както е описано в секция 4 по-горе

5. OBJECTION HANDLING

   "скъпо е" / "много пари":
   → "Разбирам. Питай се - колко струва да си уморен още 3 месеца? Изгубени дни на работа? Липса на енергия за семейството? При ${testosteroneDisplay} всеки месец без действие коства повече. 14 дни гаранция - риск нула."

   "не съм сигурен" / "трябва да помисля":
   → "Слушай, при ${testosteroneDisplay} няма какво да мислиш - данните са пред теб. 100+ мъже са започнали точно от твоето ниво. Питай се - какво ще се промени ако продължиш както до сега? Имаш 14 дни гаранция."

   "може сам да го направя":
   → "Уважавам това! Въпросът е - правиш ли го вече? Ако можеше сам, нямаше да си ${testosteroneDisplay}. Протоколът ти дава ТОЧНИЯ план - без догатки, без грешки. За 247лв спестяваш 6 месеца експерименти."

   "нямам време":
   → "Приятел, 3 тренировки по 45 мин седмично. Това са 2 часа 15 мин - по-малко от Netflix който гледаш. Въпросът не е 'имам ли време', а 'приоритет ли ми е'?"

ЛОШИ ПРИМЕРИ ❌:
"С вашия тестостерон на ниво 360 ng/dL, е важно да предприемете конкретни стъпки..." [ФОРМАЛНО]

"1. Сън: Осигурете си минимум 7 часа... 2. Хранене: Включете..." [СПИСЪК НАВЕДНЪЖ]

ДОБРИ ПРИМЕРИ ✅:
Q: "Какво да правя на ден 1?"
A: "Ден 1 е най-простият - качествен сън 7-8 часа и 3 яйца сутрин. Толкова. Искаш ли да ти кажа и за ден 2-3?"

Q: "Защо съм толкова уморен?"
A: "При ${testosteroneDisplay} е нормално. Тестостеронът ти е нисък и това директно влияе на енергията. Спиш ли добре?"

КОНТЕКСТ: ${sessionWithPdf.pdf_content}`
        :
        `Ти си Теодор - приятелски хормонален експерт на Testograph.

🚫 СТРОГО ЗАБРАНЕНО:
НЕ отговаряй на въпроси извън хормони и здраве. Ако питат за нещо друго:
"Хей, аз съм експерт по хормони. За [тяхната тема] не мога да помогна. Имаш ли въпрос за здравето си?"

⚠️ ВАЖНО: Потребителят НЯМА качен PDF анализ!

ТВОЯТА ЦЕЛ:
1. Обясни че за персонализирани съвети ти трябва неговият хормонален анализ
2. Насочи го към безплатния анализ на Testograph
3. Обясни процеса: попълва бланка → получава PDF → качва тук

ОТГОВОР БЕЗ PDF:
"Хей ${email.split('@')[0]}! За да ти помогна наистина, трябва да видя твоите хормонални стойности.

Ето какво да направиш:

1. Попълни безплатния анализ директно тук: [ACTION_BUTTON:Започни безплатния анализ:#open-quiz-form]
2. Ще получиш PDF с анализа си на имейла
3. Качи го тук и ще ти кажа точно какво става с хормоните ти

Имаш ли вече анализ? Качи го да започнем!"`;

    // Add context about conversation history and make messages interactive
    const isFirstMessage = !messages || messages.length === 0;

    let contextualMessage = message;

    // Smart context detection
    const messageLower = message.toLowerCase();

    // Detect specific question types
    const specificDayQuestion = messageLower.match(/ден\s*(\d+)|day\s*(\d+)|първ[иа].*ден/i);
    const whyQuestion = messageLower.includes('защо') || messageLower.includes('why');
    const progressShare = messageLower.includes('направих') || messageLower.includes('спазих') || messageLower.includes('успях');
    const planRequest = messageLower.includes('план') || messageLower.includes('програма') || (messageLower.includes('какво') && messageLower.includes('да правя'));

    // HORMOZI SALES TRIGGERS
    const hasCriticalHormones = criticalAlerts.some(a => a.severity === 'critical');
    const mentionsDifficulty = ['не мога', 'трудно', 'изморен съм', 'не издържам', 'тежко'].some(p => messageLower.includes(p));
    const objectionsDetected = ['скъпо', 'много пари', 'не съм сигурен', 'трябва да помисля', 'може сам', 'нямам време'].some(p => messageLower.includes(p));
    const noProgressAfter5Days = progressShare && conversationTurns >= 5 && (messageLower.includes('същото') || messageLower.includes('няма промяна') || messageLower.includes('не се чувствам'));

    // Conversation turn tracking
    const conversationTurns = messages ? messages.length / 2 : 0; // User + Bot messages

    // Context-aware prompting with HORMOZI TRIGGERS
    if (objectionsDetected && hasPdfContent) {
      // OBJECTION HANDLING - Highest priority!
      contextualMessage = `${message}

🚨 OBJECTION DETECTED!

ИНСТРУКЦИЯ - HORMOZI OBJECTION CRUSHING:
1. Acknowledge: "Разбирам те"
2. Reframe питането: Използвай точния objection handler от секция 5
3. Social proof: "100+ мъже са започнали от ${testosteroneDisplay}"
4. Risk reversal: "14 дни гаранция - риск нула"
5. ACTION_BUTTON задължително!`;

    } else if (hasCriticalHormones && hasPdfContent) {
      // CRITICAL URGENCY - Immediate sell!
      contextualMessage = `${message}

🚨 CRITICAL HORMONE LEVEL!

ИНСТРУКЦИЯ - URGENT SALE:
1. "При ${testosteroneDisplay} това е КРИТИЧНО. Не можеш да чакаш."
2. VALUE STACK пълен (7 bullets от секция 4A)
3. "Всеки ден без действие е загубен ден."
4. PRICE ANCHORING (2000лв треньор vs 247лв)
5. "14 дни гаранция - започни СЕГА"
6. ACTION_BUTTON задължително!`;

    } else if (mentionsDifficulty && hasPdfContent) {
      // PAIN POINT - Empathy + Sell
      contextualMessage = `${message}

💡 PAIN POINT MENTIONED!

ИНСТРУКЦИЯ:
1. Empathy: "Разбирам те напълно. При ${testosteroneDisplay} е нормално."
2. "Въпросът не е дали можеш - при този тестостерон е НЕВЪЗМОЖНО."
3. VALUE STACK (кратък - 3 bullets)
4. "100+ мъже са започнали от същото ниво."
5. ACTION_BUTTON!`;

    } else if (noProgressAfter5Days) {
      // NO RESULTS - Direct intervention
      contextualMessage = `${message}

⚠️ NO PROGRESS AFTER 5+ DAYS!

ИНСТРУКЦИЯ:
1. "Слушай, ако нямаше промяна за 5 дни, нещо не е наред."
2. "При ${testosteroneDisplay} трябва ТОЧЕН протокол, не догатки."
3. VALUE STACK пълен
4. "За 247лв спестяваш 6 месеца експерименти."
5. ACTION_BUTTON!`;

    } else if (isFirstMessage && hasPdfContent) {
      contextualMessage = `${message}

КОНТЕКСТ: Първи контакт след PDF upload!

ИНСТРУКЦИЯ:
Кажи: "Ее, видях си резултатите. При теб тестостеронът е ${testosteroneDisplay} - това е ниско."
После ПИТАЙ: "Как се чувстваш напоследък - уморен ли си?"`;

    } else if (specificDayQuestion) {
      const dayNum = specificDayQuestion[1] || specificDayQuestion[2] || '1';
      contextualMessage = `${message}

КОНТЕКСТ: Пита за ДЕН ${dayNum} конкретно!

ИНСТРУКЦИЯ:
1. Отговори САМО за ден ${dayNum} (2-3 изречения max)
2. Питай: "Искаш ли да ти кажа и за другите дни?"
3. БЕЗ цялата програма наведнъж!`;

    } else if (whyQuestion && hasPdfContent) {
      contextualMessage = `${message}

КОНТЕКСТ: Пита "ЗАЩО" нещо се случва.

ИНСТРУКЦИЯ:
1. Обясни причината с ${testosteroneDisplay} (1-2 изречения)
2. Питай дали има конкретен симптом който го притеснява`;

    } else if (progressShare) {
      contextualMessage = `${message}

КОНТЕКСТ: Споделя прогрес/резултати!

ИНСТРУКЦИЯ:
1. Похвали го: "Добра работа!"
2. Питай КАК СЕ ЧУВСТВА: "Има ли промяна в енергията?"
3. Ако е 7+ дни от началото И няма драматична промяна → предложи PRO план с загриженост`;

    } else if (planRequest && conversationTurns >= 2) {
      contextualMessage = `${message}

КОНТЕКСТ: Иска план/програма след ${conversationTurns} размени.

ИНСТРУКЦИЯ - FULL HORMOZI PITCH:
1. VALUE STACK пълен (7 bullets от секция 4A)
2. PRICE ANCHORING (2000лв vs 247лв)
3. RISK REVERSAL (14 дни гаранция)
4. "100+ мъже вече са го направили"
5. ACTION_BUTTON задължително със ТОЧЕН формат:

[ACTION_BUTTON:Започни 4-седмичната трансформация:https://shop.testograph.eu/]`;

    } else if (planRequest && conversationTurns < 2) {
      // Иска план в началото - дай малко стойност, после продавай
      contextualMessage = `${message}

КОНТЕКСТ: Иска план ВЕДНАГА (turn ${conversationTurns}).

ИНСТРУКЦИЯ:
1. Дай 1-2 КОНКРЕТНИ съвета за ${testosteroneDisplay} (НЕ generic списък!)
2. "Но слушай, за ТОЧЕН план според твоите ${testosteroneDisplay}..."
3. VALUE STACK (кратък - 3-4 bullets):
   - +130% тестостерон (380→870 ng/dL)
   - -5% мазнини + 3кг мускули
   - +156% енергия, +89% либидо
   - RPT тренировки + хормонално хранене
4. PRICE ANCHORING: "2000лв треньор vs 247лв протокол"
5. "100+ мъже вече са го направили"
6. ACTION_BUTTON точен формат!

ЗАБРАНА: Не давай generic "1. Сън: 7-9ч... 2. Хранене:... 3. Физическа активност..."`;

    } else {
      contextualMessage = message;
    }

    // Prepare conversation for OpenAI
    const conversationMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...(messages || []).map((msg)=>({
          role: msg.role,
          content: msg.content
        })),
      {
        role: 'user',
        content: contextualMessage
      }
    ];

    console.log('🔥 SENDING TO AI:', {
      email,
      hasPdfContent,
      extractedHormonesCount: Object.keys(extractedHormones).length,
      extractedHormones,
      isFirstMessage,
      pdfContentLength: sessionWithPdf?.pdf_content?.length || 0
    });

    // Call OpenAI
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
        temperature: 0.75,
        presence_penalty: 0.4,
        frequency_penalty: 0.3,
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
    // Save assistant response
    const { error: assistantMessageError } = await supabase.from('chat_messages').insert({
      session_id: session.id,
      role: 'assistant',
      content: assistantMessage
    });
    if (assistantMessageError) {
      console.error('Error saving assistant message:', assistantMessageError);
      throw new Error('Failed to save assistant message');
    }
    return new Response(JSON.stringify({
      message: assistantMessage,
      sessionId: session.id,
      alerts: criticalAlerts,
      extractedHormones: extractedHormones,
      hasPdfContent: hasPdfContent
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in chat-assistant function:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : null,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
