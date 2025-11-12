import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    console.log('📧 Sending follow-up email for token:', token);

    // Fetch result data
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

    // Check if enhanced PDF is ready
    if (!result.pdf_enhanced_url) {
      return NextResponse.json(
        { error: 'Enhanced PDF not ready yet' },
        { status: 425 }
      );
    }

    const firstName = result.first_name || 'там';
    const resultPageUrl = `https://www.testograph.eu/test/result/${token}`;

    // Generate follow-up email HTML
    const emailHTML = `
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
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎉 Готово!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Твоят AI персонализиран анализ е готов</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 20px; background-color: #0e0f1a;">

      <!-- Greeting -->
      <h2 style="color: #ffffff; margin: 0 0 25px 0; font-size: 26px; line-height: 1.4; font-weight: bold;">
        ${firstName}, готови са твоите персонализирани препоръки! 🚀
      </h2>

      <p style="color: #a0a0a0; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
        Добри новини! Нашата AI система завърши задълбочен анализ на твоите резултати и генерира персонализиран 200-думен репорт с конкретни препоръки, базирани на твоето уникално състояние.
      </p>

      <p style="color: #a0a0a0; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
        Този анализ отива отвъд стандартните съвети. Той взема предвид всички твои данни – възраст, начин на живот, стрес, сексуално здраве, хранене и много други – и ти дава точно онова, което <strong style="color: #ffffff;">ТИ</strong> трябва да направиш, за да подобриш тестостероновите си нива.
      </p>

      <!-- What's New Box -->
      <div style="background-color: #15162a; border: 2px solid #22c55e40; border-radius: 16px; padding: 30px; margin: 40px 0;">
        <h3 style="color: #22c55e; margin: 0 0 20px 0; font-size: 22px; font-weight: bold; text-align: center;">
          ✨ Какво ново ще намериш
        </h3>

        <div style="color: #ffffff; font-size: 15px; line-height: 1.8; margin-bottom: 15px; padding-left: 10px;">
          ✓ <strong style="color: #22c55e;">AI Персонализиран анализ</strong> – 200 думи, специално за теб
        </div>
        <div style="color: #ffffff; font-size: 15px; line-height: 1.8; margin-bottom: 15px; padding-left: 10px;">
          ✓ <strong style="color: #22c55e;">Подобрен PDF репорт</strong> – включва AI препоръки
        </div>
        <div style="color: #ffffff; font-size: 15px; line-height: 1.8; margin-bottom: 0; padding-left: 10px;">
          ✓ <strong style="color: #22c55e;">Конкретни следващи стъпки</strong> – не общи съвети, а действия точно за теб
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resultPageUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);">
          📊 Виж персонализирания си анализ →
        </a>
      </div>

      <p style="color: #a0a0a0; font-size: 14px; line-height: 1.6; text-align: center; margin: 30px 0 0 0;">
        Забележка: Този линк е активен за 30 дни. Препоръчваме да изтеглиш PDF версията за справка.
      </p>

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

    // Send follow-up email
    const { data, error } = await resend.emails.send({
      from: 'Testograph <results@shop.testograph.eu>',
      to: result.email,
      subject: `${firstName}, твоят AI персонализиран анализ е готов! 🎉`,
      html: emailHTML,
    });

    if (error) {
      console.error('Error sending follow-up email:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send follow-up email' },
        { status: 500 }
      );
    }

    console.log(`✅ Follow-up email sent to ${result.email}:`, data?.id);

    return NextResponse.json({
      success: true,
      message: 'Follow-up email sent successfully',
      emailId: data?.id
    });

  } catch (error: any) {
    console.error('Error in follow-up email API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send follow-up email' },
      { status: 500 }
    );
  }
}
