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
}

export async function POST(request: Request) {
  try {
    const body: QuizResultEmail = await request.json();
    const { email, firstName, score, testosterone, testosteroneCategory, riskLevel } = body;

    // Validation
    if (!email || !firstName || score === undefined || testosterone === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine level info for email
    const getLevelInfo = () => {
      if (score >= 61) {
        return {
          emoji: '🔴',
          title: 'Критично ниво',
          color: '#ef4444',
          description: 'Твоите симптоми са сериозни и изискват незабавно действие. Нивата на тестостерон вероятно са значително под нормата.'
        };
      } else if (score >= 31) {
        return {
          emoji: '🟡',
          title: 'Умерено ниво',
          color: '#eab308',
          description: 'Има признаци на намалени нива на тестостерон. Препоръчително е да предприемеш действия сега, преди симптомите да се влошат.'
        };
      } else {
        return {
          emoji: '🟢',
          title: 'Добро ниво',
          color: '#22c55e',
          description: 'Нивата ти изглеждат стабилни, но има място за подобрение. Превантивен план ще те поддържа в оптимална форма.'
        };
      }
    };

    const getTestosteroneInfo = () => {
      if (testosteroneCategory === 'low') {
        return { label: '⚠️ Ниско', color: '#ef4444', bgColor: '#fee2e2' };
      } else if (testosteroneCategory === 'high') {
        return { label: '⭐ Високо', color: '#22c55e', bgColor: '#dcfce7' };
      } else {
        return { label: '✓ Нормално', color: '#eab308', bgColor: '#fef9c3' };
      }
    };

    const levelInfo = getLevelInfo();
    const testInfo = getTestosteroneInfo();

    // Send email with quiz results
    const { data, error } = await resend.emails.send({
      from: 'Testograph <results@shop.testograph.eu>',
      to: email,
      subject: `${firstName}, ето твоят резултат от теста за тестостерон`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Testograph</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Резултат от теста за тестостерон</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 20px;">

              <!-- Greeting -->
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Здравей ${firstName}! ${levelInfo.emoji}</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Благодарим ти, че отдели време да попълниш нашия детайлен тест. Ето твоите персонализирани резултати:
              </p>

              <!-- Risk Score Box -->
              <div style="background: linear-gradient(135deg, ${levelInfo.color}20 0%, ${levelInfo.color}10 100%); border: 2px solid ${levelInfo.color}40; border-radius: 16px; padding: 30px; margin-bottom: 30px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">${levelInfo.emoji}</div>
                <div style="font-size: 64px; font-weight: 900; color: ${levelInfo.color}; margin: 10px 0;">${score}</div>
                <p style="color: #6b7280; margin: 5px 0 20px 0; font-size: 14px;">Рисков индекс</p>
                <div style="display: inline-block; background-color: rgba(255,255,255,0.8); border: 2px solid ${levelInfo.color}; border-radius: 9999px; padding: 12px 24px;">
                  <span style="color: ${levelInfo.color}; font-weight: bold; font-size: 18px;">${levelInfo.title}</span>
                </div>
              </div>

              <!-- Testosterone Level Box -->
              <div style="background: linear-gradient(135deg, #3b82f620 0%, #8b5cf610 100%); border: 2px solid #3b82f640; border-radius: 16px; padding: 30px; margin-bottom: 30px; text-align: center;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Изчислено ниво на тестостерон</h3>
                <div style="font-size: 56px; font-weight: 900; color: ${testInfo.color}; margin: 10px 0;">
                  ${testosterone} <span style="font-size: 24px; color: #6b7280;">nmol/L</span>
                </div>
                <div style="display: inline-block; background-color: ${testInfo.bgColor}; border: 2px solid ${testInfo.color}; border-radius: 9999px; padding: 12px 24px; margin-top: 15px;">
                  <span style="color: ${testInfo.color}; font-weight: bold; font-size: 16px;">${testInfo.label}</span>
                </div>

                <!-- Reference Ranges -->
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: left; font-size: 13px; color: #6b7280;">
                  <p style="margin: 5px 0;"><strong style="color: #ef4444;">Под 12 nmol/L:</strong> Ниско ниво - изисква внимание</p>
                  <p style="margin: 5px 0;"><strong style="color: #eab308;">12-26 nmol/L:</strong> Нормално ниво</p>
                  <p style="margin: 5px 0;"><strong style="color: #22c55e;">Над 26 nmol/L:</strong> Високо/оптимално ниво</p>
                </div>
              </div>

              <!-- What This Means -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Какво означава това?</h3>
                <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0;">
                  ${levelInfo.description}
                </p>
              </div>

              <!-- Next Steps -->
              <div style="background: linear-gradient(135deg, #7c3aed10 0%, #a855f710 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Какво следва?</h3>
                <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                  Базирано на твоя резултат, подготвихме <strong>персонализирана програма</strong> която ще ти помогне да подобриш тестостерона си естествено.
                </p>
                <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0;">
                  ✓ Научно обосновани добавки<br>
                  ✓ Персонализиран план за хранене<br>
                  ✓ Тренировъчни препоръки<br>
                  ✓ Експертна поддръжка
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://testograph.eu?utm_source=quiz_email&utm_medium=email&utm_campaign=quiz_result"
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 18px 40px; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(124, 58, 237, 0.3);">
                  Виж персонализираната програма →
                </a>
              </div>

              <!-- Social Proof -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong>⭐ Мартин (34г.):</strong> "Тестостеронът ми скочи от 9.7 на 23.2 nmol/L за само 3 месеца с програмата!"
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #f3f4f6; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                За въпроси или допълнителна информация:
              </p>
              <p style="margin: 5px 0;">
                <a href="mailto:support@testograph.eu" style="color: #7c3aed; text-decoration: none; font-weight: 600;">support@testograph.eu</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">
                © ${new Date().getFullYear()} Testograph. Всички права запазени.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending quiz result email:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('✅ Quiz result email sent:', data?.id);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id
    });

  } catch (error: any) {
    console.error('Error in quiz result email API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
