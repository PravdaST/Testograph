import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface QuizResultEmail {
  email: string;
  firstName: string;
  score: number;
  testosterone: number;
  testosteroneCategory: 'low' | 'normal' | 'high';
  riskLevel: 'good' | 'moderate' | 'critical';
  resultToken?: string; // Token for result page access

  // NEW: Engaging Quiz (Confidence Index) data
  confidenceIndex?: number; // 0-100 score
  categoryScores?: {
    lifestyle: number;
    physical: number;
    sexual: number;
    mental: number;
  };
  topIssues?: string[]; // Top 3 priority issues
}

// Email template helper - generates n8n-style dark theme email
const generateEmailHTML = (firstName: string, testosterone: number, category: 'low' | 'normal' | 'high', resultToken?: string) => {
  const templates = {
    low: {
      headline: `${firstName}, ${testosterone} nmol/L – време е да поемеш контрол над здравето си.`,
      paragraphs: [
        `Благодаря ти, че отдели време за теста. Резултатът ти показва <strong>${testosterone} nmol/L тестостерон</strong> – това е под оптималното ниво за мъж на твоята възраст. Но добрата новина е, че вече знаеш къде се намираш и можеш да започнеш да действаш.`,
        `Ниското ниво на тестостерон може да обясни много от симптомите, които може би изпитваш – липса на енергия, намалено либидо, трудности при натрупване на мускули или задържане на излишни килограми. Но не си сам в това. Хиляди мъже преминават през същото и намират решение.`,
        `Промяната започва със знание и последователни стъпки. По-долу ще намериш 7-дневен план и 5 ключови съвета, които ще ти помогнат да тръгнеш в правилната посока. Не е нужно да правиш всичко наведнъж – започни с едно нещо и го направи добре.`
      ],
      plan: [
        { day: 'Ден 1', text: 'Направи кръвен тест за тестостерон (общ + свободен) при личен лекар или лаборатория' },
        { day: 'Ден 2', text: 'Започни да спиш минимум 7-8 часа на нощ – сънят е критичен за хормоналното възстановяване' },
        { day: 'Ден 3', text: 'Добави силови тренировки 3-4 пъти седмично (клякания, мъртва тяга, лег)' },
        { day: 'Ден 4', text: 'Елиминирай рафинирани захари и обработени храни от менюто си' },
        { day: 'Ден 5', text: 'Включи повече цинк (месо, яйца, тиквени семки) и витамин D3 (слънце или добавка)' },
        { day: 'Ден 6', text: 'Намали стреса с дишане, медитация или 20 минути разходка на открито' },
        { day: 'Ден 7', text: 'Присъедини се към Testograph общността за подкрепа и отчетност' }
      ],
      tips: [
        '<strong>Спи 7-8 часа</strong> – 80% от тестостерона се произвежда по време на дълбок сън',
        '<strong>Яж повече мазнини</strong> – авокадо, зехтин, жълтъци повишават хормоналната продукция',
        '<strong>Вдигай тежести</strong> – силовите тренировки стимулират естествената продукция на тестостерон',
        '<strong>Намали алкохола</strong> – алкохолът директно потиска тестостерона в тестисите',
        '<strong>Намали стреса</strong> – високият кортизол блокира тестостерона'
      ],
      ctaText: '🚀 Готов ли си за промяна?',
      ctaSubtext: 'Присъедини се към Testograph общността в Telegram за персонализирана подкрепа, 7-дневни планове и директен достъп до експерти.'
    },
    normal: {
      headline: `${firstName}, ${testosterone} nmol/L – добре е, но не мислиш ли, че можеш много повече?`,
      paragraphs: [
        `Благодаря за теста! Резултатът ти показва <strong>${testosterone} nmol/L тестостерон</strong> – това те поставя в „нормалния" диапазон. Но нека бъдем честни: „нормално" не означава „оптимално". Въпросът не е дали си добре, а дали си на максимума си.`,
        `Мъжете с тестостерон в горната част на референтния диапазон (над 20 nmol/L) имат по-добра енергия, по-бърз метаболизъм, по-лесно трупат мускули и се чувстват по-уверени. Ако си на 15-18 nmol/L, има място за подобрение – и то голямо.`,
        `Представи си да се събудиш с повече енергия, да виждаш по-бързи резултати в залата и да се чувстваш по-фокусиран през деня. Не става въпрос за радикални промени, а за умни оптимизации. По-долу ще намериш 7-дневен план, който ще те изведе на следващото ниво.`
      ],
      plan: [
        { day: 'Ден 1', text: 'Оптимизирай протеиновия прием – минимум 1.6-2g на кг телесно тегло' },
        { day: 'Ден 2', text: 'Добави 1-2 порции червено месо седмично (високо качество крехтин и цинк)' },
        { day: 'Ден 3', text: 'Увеличи интензивността на тренировките – добави drop sets и съкратени почивки' },
        { day: 'Ден 4', text: 'Вземи D3 (5000 IU), Цинк (30mg), Магнезий (400mg) ежедневно' },
        { day: 'Ден 5', text: 'Елиминирай 1-2 порции алкохол седмично (или премини към качествено червено вино)' },
        { day: 'Ден 6', text: 'Направи sleep audit – махни телефона от спалнята, затъмни стаята' },
        { day: 'Ден 7', text: 'Запиши се за кръвен тест след 30 дни, за да проследиш прогреса' }
      ],
      tips: [
        '<strong>Качествен протеин</strong> – яйца, месо, риба и пилешко ежедневно',
        '<strong>Тежки бази</strong> – фокус върху клякания, мъртва тяга, лег (80-85% от 1RM)',
        '<strong>Интервална кардио</strong> – 20 мин HIIT 2-3 пъти седмично стимулира тестостерона',
        '<strong>Намали излагането на пластмаси</strong> – пий от стъклени бутилки, пази храната в стъкло',
        '<strong>Cold exposure</strong> – завърши душа с 30 сек студена вода за хормонален boost'
      ],
      ctaText: '💪 Искаш ли да достигнеш 25+ nmol/L?',
      ctaSubtext: 'В Testograph общността ще получиш персонализиран план, групова подкрепа и проследяване на прогреса.'
    },
    high: {
      headline: `${firstName}, ${testosterone} nmol/L – топ форма! Защо не вдигнеш още летвата?`,
      paragraphs: [
        `Браво! Резултатът ти показва <strong>${testosterone} nmol/L тестостерон</strong> – това те поставя в топ 10-15% от мъжете на твоята възраст. Вече правиш много неща правилно: тренираш редовно, хранението ти е на точката, грижиш се за съня си. Но нека не спираме дотук.`,
        `Елитните атлети и предприемачи не се задоволяват с „добре" – те търсят marginal gains. 1% подобрение в 10 различни области = 10% по-добри резултати. Въпросът вече не е как да оцелееш, а как да доминираш.`,
        `Ето защо този email не е за "основи" – те вече ги владееш. По-долу ще намериш advanced стратегии за оптимизация на хормоналния профил, възстановяване и перформанс. Ако си готов да влезеш в топ 5%, продължаваме.`
      ],
      plan: [
        { day: 'Ден 1', text: 'Направи пълен хормонален панел (тестостерон, естроген, SHBG, DHT, кортизол)' },
        { day: 'Ден 2', text: 'Добави периодично гладуване (16:8 или 18:6) за инсулинова чувствителност' },
        { day: 'Ден 3', text: 'Експериментирай с creatine loading (20g за 5 дни) + ежедневна поддръжка (5g)' },
        { day: 'Ден 4', text: 'Оптимизирай тренировъчния обем – по-малко sets, по-висок интензитет' },
        { day: 'Ден 5', text: 'Добави adaptogens – Ashwagandha (600mg) и Tongkat Ali (200mg) ежедневно' },
        { day: 'Ден 6', text: 'Практикувай контрастни души (3 цикъла горещо/студено) за хормонален пик' },
        { day: 'Ден 7', text: 'Включи се в Testograph mastermind за споделяне на data и oптимизации' }
      ],
      tips: [
        '<strong>Track everything</strong> – води дневник за сън, тренировки, хранене, либидо, енергия',
        '<strong>Cycle supplements</strong> – 8 седмици ON, 4 седмици OFF за максимална ефективност',
        '<strong>Optimize estrogen</strong> – DIM (200mg) или брокколи екстракт за estrogen detox',
        '<strong>Strategic refeeds</strong> – 1-2 пъти седмично високи въглехидрати за лептин и тестостерон',
        '<strong>Biohacking tools</strong> – red light therapy, sauna, cold plunge за recovery и хормони'
      ],
      ctaText: '🏆 Готов ли си за elite-level optimization?',
      ctaSubtext: 'Влез в Testograph Mastermind групата с мъже, които вече са на върха и искат да останат там.'
    }
  };

  const template = templates[category];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0e0f1a;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0e0f1a;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #9f67ff 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Testograph</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Твоят персонализиран тестостеронов репорт</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 20px; background-color: #0e0f1a;">

      <!-- Headline -->
      <h2 style="color: #ffffff; margin: 0 0 30px 0; font-size: 28px; line-height: 1.4; font-weight: bold;">
        ${template.headline}
      </h2>

      <!-- Paragraphs -->
      ${template.paragraphs.map(p => `
        <p style="color: #a0a0a0; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
          ${p}
        </p>
      `).join('')}

      ${resultToken ? `
      <!-- View Full Result Button -->
      <div style="background: linear-gradient(135deg, #22c55e20 0%, #10b98120 100%); border-radius: 16px; padding: 30px 25px; text-align: center; margin: 40px 0; border: 2px solid #22c55e40;">
        <h3 style="color: #ffffff; margin: 0 0 12px 0; font-size: 22px; font-weight: bold;">
          📊 Виж пълния си детайлен резултат
        </h3>
        <p style="color: #a0a0a0; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Изчислихме твоя Индекс на Увереност, категорийни резултати, перцентил и персонализирани препоръки.
        </p>
        <a href="https://www.testograph.eu/test/result/${resultToken}"
           style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 17px; box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);">
          👉 Отвори резултата →
        </a>
      </div>
      ` : ''}

      <!-- 7-Day Plan Section -->
      <div style="background-color: #15162a; border: 2px solid #9f67ff40; border-radius: 16px; padding: 30px; margin: 40px 0;">
        <h3 style="color: #9f67ff; margin: 0 0 25px 0; font-size: 24px; font-weight: bold; text-align: center;">
          📅 7-Дневен План
        </h3>

        ${template.plan.map((item, index) => `
          <div style="background-color: #0e0f1a; border-left: 4px solid #9f67ff; padding: 15px 20px; margin-bottom: ${index === template.plan.length - 1 ? '0' : '15px'}; border-radius: 8px;">
            <div style="color: #9f67ff; font-weight: bold; font-size: 14px; margin-bottom: 5px;">
              ${item.day}
            </div>
            <div style="color: #ffffff; font-size: 15px; line-height: 1.6;">
              ${item.text}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 5 Tips Section -->
      <div style="background-color: #15162a; border: 2px solid #9f67ff40; border-radius: 16px; padding: 30px; margin: 40px 0;">
        <h3 style="color: #9f67ff; margin: 0 0 25px 0; font-size: 24px; font-weight: bold; text-align: center;">
          💡 5 Ключови Съвета
        </h3>

        ${template.tips.map((tip, index) => `
          <div style="color: #ffffff; font-size: 15px; line-height: 1.8; margin-bottom: ${index === template.tips.length - 1 ? '0' : '15px'}; padding-left: 10px;">
            ✓ ${tip}
          </div>
        `).join('')}
      </div>

      <!-- CTA Section -->
      <div style="background: linear-gradient(135deg, #9f67ff20 0%, #7c3aed20 100%); border-radius: 16px; padding: 35px 25px; text-align: center; margin: 40px 0;">
        <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 22px; font-weight: bold;">
          ${template.ctaText}
        </h3>
        <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          ${template.ctaSubtext}
        </p>

        <!-- CTA Button -->
        <a href="https://t.me/testographeu"
           style="display: inline-block; background: linear-gradient(135deg, #9f67ff 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 20px rgba(159, 103, 255, 0.4); transition: transform 0.2s;">
          👉 Влез в Telegram групата →
        </a>
      </div>

      <!-- Testosterone Level Box -->
      <div style="background-color: #15162a; border: 2px solid #9f67ff40; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <div style="color: #a0a0a0; font-size: 14px; margin-bottom: 10px;">
          Твоето ниво на тестостерон
        </div>
        <div style="color: #9f67ff; font-size: 48px; font-weight: 900; margin: 5px 0;">
          ${testosterone} <span style="font-size: 24px; color: #a0a0a0;">nmol/L</span>
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #9f67ff30; font-size: 13px; color: #a0a0a0; text-align: left;">
          <p style="margin: 5px 0;"><strong style="color: #ef4444;">Под 12 nmol/L:</strong> Ниско ниво</p>
          <p style="margin: 5px 0;"><strong style="color: #eab308;">12-26 nmol/L:</strong> Нормално ниво</p>
          <p style="margin: 5px 0;"><strong style="color: #22c55e;">Над 26 nmol/L:</strong> Високо ниво</p>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #15162a; padding: 30px 20px; text-align: center; border-top: 2px solid #9f67ff20;">
      <p style="color: #a0a0a0; font-size: 14px; margin: 0 0 10px 0;">
        За въпроси или допълнителна информация:
      </p>
      <p style="margin: 5px 0;">
        <a href="mailto:support@testograph.eu" style="color: #9f67ff; text-decoration: none; font-weight: 600;">support@testograph.eu</a>
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0 0;">
        © ${new Date().getFullYear()} Testograph. Всички права запазени.
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
};

// NEW: Email template for Engaging Quiz (Confidence Index)
const generateEngagingQuizEmailHTML = (
  firstName: string,
  confidenceIndex: number,
  categoryScores: { lifestyle: number; physical: number; sexual: number; mental: number },
  topIssues: string[],
  testosteroneEstimate: number,
  resultToken?: string
) => {
  // Determine level based on Confidence Index
  let level: 'low' | 'medium' | 'good';
  let levelText: string;
  let levelColor: string;

  if (confidenceIndex < 40) {
    level = 'low';
    levelText = 'Нисък';
    levelColor = '#ef4444';
  } else if (confidenceIndex < 70) {
    level = 'medium';
    levelText = 'Среден';
    levelColor = '#eab308';
  } else {
    level = 'good';
    levelText = 'Добър';
    levelColor = '#22c55e';
  }

  // Category labels in Bulgarian
  const categoryLabels = {
    lifestyle: 'Начин на живот',
    physical: 'Физическо състояние',
    sexual: 'Сексуално здраве',
    mental: 'Ментално здраве'
  };

  // Generate category bars
  const categoryBarsHTML = Object.entries(categoryScores).map(([key, score]) => {
    const label = categoryLabels[key as keyof typeof categoryLabels];
    const barColor = score < 40 ? '#ef4444' : score < 70 ? '#eab308' : '#22c55e';

    return `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #ffffff; font-size: 15px; font-weight: 600;">${label}</span>
          <span style="color: ${barColor}; font-size: 15px; font-weight: bold;">${score}/100</span>
        </div>
        <div style="background-color: #0e0f1a; height: 12px; border-radius: 6px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, ${barColor} 0%, ${barColor}dd 100%); width: ${score}%; height: 100%; border-radius: 6px; transition: width 0.5s;"></div>
        </div>
      </div>
    `;
  }).join('');

  // Generate top issues list
  const topIssuesHTML = topIssues.slice(0, 3).map((issue, index) => `
    <div style="background-color: #0e0f1a; border-left: 4px solid #ef4444; padding: 15px 20px; margin-bottom: ${index === topIssues.length - 1 ? '0' : '15px'}; border-radius: 8px;">
      <div style="color: #ef4444; font-weight: bold; font-size: 14px; margin-bottom: 5px;">
        Приоритет ${index + 1}
      </div>
      <div style="color: #ffffff; font-size: 15px; line-height: 1.6;">
        ${issue}
      </div>
    </div>
  `).join('');

  // Action tips based on level
  const actionTips = level === 'low' ? [
    '<strong>Започни със съня</strong> – 7-8 часа качествен сън е основата на всичко',
    '<strong>Двигай се повече</strong> – дори 20 минути дневно правят огромна разлика',
    '<strong>Храни се редовно</strong> – пропускането на хранене руши хормоналния баланс',
    '<strong>Намали стреса</strong> – 5 минути дишане или разходка на открито ежедневно'
  ] : level === 'medium' ? [
    '<strong>Оптимизирай протеина</strong> – минимум 1.6g на кг телесно тегло',
    '<strong>Добави силови тренировки</strong> – 3-4 пъти седмично стимулира тестостерона',
    '<strong>Приеми добавки</strong> – D3, Цинк, Магнезий за хормонална подкрепа',
    '<strong>Ограничи алкохола</strong> – алкохолът директно потиска тестостерона'
  ] : [
    '<strong>Track your progress</strong> – води дневник за сън, енергия, тренировки',
    '<strong>Експериментирай с adaptogens</strong> – Ashwagandha, Tongkat Ali',
    '<strong>Optimize recovery</strong> – масаж, студени души, медитация',
    '<strong>Поддържай consistency</strong> – малките навици създават големи резултати'
  ];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0e0f1a;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0e0f1a;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Testograph</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Твоят Индекс на Увереност е готов!</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 20px; background-color: #0e0f1a;">

      <!-- Headline -->
      <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 26px; line-height: 1.4; font-weight: bold;">
        ${firstName}, твоят Индекс на Увереност: <span style="color: ${levelColor};">${confidenceIndex}/100</span>
      </h2>

      <!-- Main intro -->
      <p style="color: #a0a0a0; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
        Благодаря ти, че отдели време за теста! Твоят Индекс на Увереност е <strong style="color: ${levelColor};">${confidenceIndex} от 100 точки</strong>, което показва <strong>${levelText.toLowerCase()}</strong> ниво${confidenceIndex < 70 ? ' с потенциал за значително подобрение' : ' - продължавай в същата посока'}.
      </p>

      ${resultToken ? `
      <!-- Large Green CTA Button -->
      <div style="background: linear-gradient(135deg, #22c55e20 0%, #10b98120 100%); border-radius: 16px; padding: 35px 25px; text-align: center; margin: 0 0 40px 0; border: 2px solid #22c55e;">
        <h3 style="color: #ffffff; margin: 0 0 12px 0; font-size: 24px; font-weight: bold;">
          📊 Виж пълния си детайлен анализ
        </h3>
        <p style="color: #a0a0a0; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
          Изчислихме твоя Индекс на Увереност, 4 категорийни резултата, перцентил, AI анализ и персонализирани препоръки.
        </p>
        <a href="https://www.testograph.eu/test/result/${resultToken}"
           style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-weight: bold; font-size: 19px; box-shadow: 0 10px 25px rgba(34, 197, 94, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">
          👉 ОТВОРИ РЕЗУЛТАТА →
        </a>
      </div>
      ` : ''}

      <!-- Testosterone Estimate Box -->
      <div style="background-color: #15162a; border: 2px solid #22c55e40; border-radius: 12px; padding: 25px; margin: 0 0 30px 0; text-align: center;">
        <div style="color: #a0a0a0; font-size: 14px; margin-bottom: 10px;">
          Изчислен тестостерон (оценка)
        </div>
        <div style="color: #22c55e; font-size: 42px; font-weight: 900; margin: 5px 0;">
          ~${testosteroneEstimate} <span style="font-size: 22px; color: #a0a0a0;">nmol/L</span>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin: 15px 0 0 0;">
          Това е ориентировъчна оценка базирана на твоите отговори. За точен резултат направи кръвен тест.
        </p>
      </div>

      <!-- 4 Category Scores -->
      <div style="background-color: #15162a; border: 2px solid #22c55e40; border-radius: 16px; padding: 30px; margin: 0 0 30px 0;">
        <h3 style="color: #22c55e; margin: 0 0 25px 0; font-size: 22px; font-weight: bold; text-align: center;">
          📈 Твоите категорийни резултати
        </h3>
        ${categoryBarsHTML}
      </div>

      <!-- Top 3 Priority Issues -->
      ${topIssues.length > 0 ? `
      <div style="background-color: #15162a; border: 2px solid #ef444440; border-radius: 16px; padding: 30px; margin: 0 0 30px 0;">
        <h3 style="color: #ef4444; margin: 0 0 25px 0; font-size: 22px; font-weight: bold; text-align: center;">
          🎯 Топ 3 приоритетни области
        </h3>
        ${topIssuesHTML}
      </div>
      ` : ''}

      <!-- Action Tips -->
      <div style="background-color: #15162a; border: 2px solid #22c55e40; border-radius: 16px; padding: 30px; margin: 0 0 40px 0;">
        <h3 style="color: #22c55e; margin: 0 0 25px 0; font-size: 22px; font-weight: bold; text-align: center;">
          💡 Първи стъпки към подобрение
        </h3>
        ${actionTips.map((tip, index) => `
          <div style="color: #ffffff; font-size: 15px; line-height: 1.8; margin-bottom: ${index === actionTips.length - 1 ? '0' : '15px'}; padding-left: 10px;">
            ✓ ${tip}
          </div>
        `).join('')}
      </div>

      <!-- CTA Section -->
      <div style="background: linear-gradient(135deg, #22c55e20 0%, #10b98120 100%); border-radius: 16px; padding: 35px 25px; text-align: center; margin: 40px 0;">
        <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 22px; font-weight: bold;">
          🚀 Готов ли си да направиш промяната?
        </h3>
        <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
          Присъедини се към Testograph общността в Telegram за персонализирана подкрепа, планове и директен достъп до експерти.
        </p>

        <!-- CTA Button -->
        <a href="https://t.me/testographeu"
           style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);">
          👉 Влез в Telegram групата →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #15162a; padding: 30px 20px; text-align: center; border-top: 2px solid #22c55e20;">
      <p style="color: #a0a0a0; font-size: 14px; margin: 0 0 10px 0;">
        За въпроси или допълнителна информация:
      </p>
      <p style="margin: 5px 0;">
        <a href="mailto:support@testograph.eu" style="color: #22c55e; text-decoration: none; font-weight: 600;">support@testograph.eu</a>
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0 0;">
        © ${new Date().getFullYear()} Testograph. Всички права запазени.
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
};

export async function POST(request: Request) {
  try {
    const body: QuizResultEmail = await request.json();
    const {
      email,
      firstName,
      score,
      testosterone,
      testosteroneCategory,
      riskLevel,
      resultToken,
      // NEW: Engaging Quiz fields
      confidenceIndex,
      categoryScores,
      topIssues
    } = body;

    // Validation
    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Missing required fields (email, firstName)' },
        { status: 400 }
      );
    }

    // CONDITIONAL LOGIC: Check which quiz type
    const isEngagingQuiz = confidenceIndex !== undefined && categoryScores !== undefined;

    let emailHTML: string;
    let subject: string;
    let emailType: string;

    if (isEngagingQuiz) {
      // NEW: Engaging Quiz (Confidence Index) email
      console.log('📧 Generating Engaging Quiz email (Confidence Index)...');

      emailHTML = generateEngagingQuizEmailHTML(
        firstName,
        confidenceIndex!,
        categoryScores!,
        topIssues || [],
        testosterone,
        resultToken
      );

      // Subject based on Confidence Index level
      if (confidenceIndex! < 40) {
        subject = `${firstName}, твоят Индекс на Увереност: ${confidenceIndex}/100 – време е за промяна`;
      } else if (confidenceIndex! < 70) {
        subject = `${firstName}, твоят Индекс на Увереност: ${confidenceIndex}/100 – можеш повече`;
      } else {
        subject = `${firstName}, твоят Индекс на Увереност: ${confidenceIndex}/100 – браво!`;
      }

      emailType = 'engaging_quiz';

    } else {
      // LEGACY: Testosterone nmol/L email (homepage quiz)
      console.log('📧 Generating legacy Testosterone email...');

      // Validate legacy fields
      if (score === undefined || testosterone === undefined) {
        return NextResponse.json(
          { error: 'Missing required fields for legacy quiz (score, testosterone)' },
          { status: 400 }
        );
      }

      // Determine category based on testosterone level
      let category: 'low' | 'normal' | 'high';
      if (testosterone < 12) {
        category = 'low';
      } else if (testosterone >= 12 && testosterone <= 26) {
        category = 'normal';
      } else {
        category = 'high';
      }

      emailHTML = generateEmailHTML(firstName, testosterone, category, resultToken);

      // Subject line varies by category
      const subjects = {
        low: `${firstName}, твоят резултат от теста - ${testosterone} nmol/L`,
        normal: `${firstName}, ${testosterone} nmol/L – можеш много повече`,
        high: `${firstName}, ${testosterone} nmol/L – топ форма!`
      };

      subject = subjects[category];
      emailType = 'legacy_testosterone';
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Testograph <results@shop.testograph.eu>',
      to: email,
      subject: subject,
      html: emailHTML,
    });

    if (error) {
      console.error('Error sending quiz result email:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log(`✅ ${emailType} email sent:`, data?.id);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id,
      emailType
    });

  } catch (error: any) {
    console.error('Error in quiz result email API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
