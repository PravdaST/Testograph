import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let resend: Resend;
let supabase: ReturnType<typeof createClient>;

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

interface DiscountCodeEmail {
  email: string;
  discountCode: 'FIRST10' | 'MAX10' | 'PREMIUM10';
  packageName: string;
  originalPrice: number;
  discountedPrice: number;
}

// Email template for discount code
const generateDiscountEmailHTML = (
  discountCode: string,
  packageName: string,
  originalPrice: number,
  discountedPrice: number
) => {
  const packageColors = {
    FIRST10: { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', emoji: '🚀' },
    MAX10: { gradient: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', emoji: '🔥' },
    PREMIUM10: { gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', emoji: '⭐' }
  };

  const colors = packageColors[discountCode as keyof typeof packageColors] || packageColors.FIRST10;
  const savings = originalPrice - discountedPrice;

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
    <div style="background: ${colors.gradient}; padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Testograph</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Твоят промокод за отстъпка</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 20px; background-color: #0e0f1a;">

      <!-- Headline -->
      <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 28px; line-height: 1.4; font-weight: bold; text-align: center;">
        ${colors.emoji} Твоят промокод е готов!
      </h2>

      <p style="color: #a0a0a0; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
        Благодарим ти за интереса! Ето твоят ексклузивен промокод за <strong style="color: #ffffff;">${packageName}</strong>:
      </p>

      <!-- Discount Code Box -->
      <div style="background: ${colors.gradient}; border-radius: 16px; padding: 35px 25px; text-align: center; margin: 30px 0; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.3);">
        <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 10px; letter-spacing: 1px; text-transform: uppercase;">
          Твоят промокод
        </div>
        <div style="background-color: white; border-radius: 12px; padding: 20px 30px; margin: 15px 0;">
          <div style="color: #0e0f1a; font-size: 36px; font-weight: 900; letter-spacing: 3px; font-family: 'Courier New', monospace;">
            ${discountCode}
          </div>
        </div>
        <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 15px;">
          📋 Копирай кода и го постави при поръчка
        </div>
      </div>

      <!-- Pricing -->
      <div style="background-color: #15162a; border: 2px solid rgba(139, 92, 246, 0.3); border-radius: 16px; padding: 30px; margin: 30px 0;">
        <h3 style="color: #8b5cf6; margin: 0 0 20px 0; font-size: 20px; font-weight: bold; text-align: center;">
          💰 Твоята отстъпка
        </h3>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <span style="color: #a0a0a0; font-size: 16px;">Оригинална цена:</span>
          <span style="color: #6b7280; font-size: 20px; text-decoration: line-through;">${originalPrice} лв</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <span style="color: #a0a0a0; font-size: 16px;">Отстъпка:</span>
          <span style="color: #22c55e; font-size: 20px; font-weight: bold;">-${savings} лв</span>
        </div>

        <div style="border-top: 2px solid rgba(139, 92, 246, 0.2); padding-top: 15px; margin-top: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #ffffff; font-size: 18px; font-weight: bold;">Крайна цена:</span>
            <span style="color: #8b5cf6; font-size: 32px; font-weight: 900;">${discountedPrice} лв</span>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://shop.testograph.eu/products/${packageName.toLowerCase().replace(' ', '-')}"
           style="display: inline-block; background: ${colors.gradient}; color: white; text-decoration: none; padding: 18px 45px; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);">
          🛒 Поръчай сега с ${discountCode} →
        </a>
      </div>

      <!-- Important Info -->
      <div style="background-color: #15162a; border-left: 4px solid #8b5cf6; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <p style="color: #ffffff; font-size: 16px; margin: 0 0 10px 0; font-weight: bold;">
          ⏰ Важно:
        </p>
        <ul style="color: #a0a0a0; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Промокодът е валиден за <strong style="color: #ffffff;">30 дни</strong></li>
          <li>Може да се използва <strong style="color: #ffffff;">само веднъж</strong></li>
          <li>Важи само за <strong style="color: #ffffff;">${packageName}</strong></li>
          <li>Безплатна доставка при поръчка над 50 лв</li>
        </ul>
      </div>

      <!-- Benefits -->
      <div style="background-color: #15162a; border: 2px solid rgba(139, 92, 246, 0.3); border-radius: 16px; padding: 30px; margin: 30px 0;">
        <h3 style="color: #8b5cf6; margin: 0 0 20px 0; font-size: 20px; font-weight: bold; text-align: center;">
          ✅ Какво получаваш
        </h3>
        <div style="color: #ffffff; font-size: 15px; line-height: 2;">
          ✓ Безплатна доставка<br>
          ✓ Плащане при доставка<br>
          ✓ 30-дневна гаранция за връщане<br>
          ✓ 24/7 поддръжка<br>
          ✓ 100% естествени съставки
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #15162a; padding: 30px 20px; text-align: center; border-top: 2px solid rgba(139, 92, 246, 0.2);">
      <p style="color: #a0a0a0; font-size: 14px; margin: 0 0 10px 0;">
        Имаш въпроси? Пиши ни:
      </p>
      <p style="margin: 5px 0;">
        <a href="mailto:support@testograph.eu" style="color: #8b5cf6; text-decoration: none; font-weight: 600;">support@testograph.eu</a>
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
    const body: DiscountCodeEmail = await request.json();
    const { email, discountCode, packageName, originalPrice, discountedPrice } = body;

    // Validation
    if (!email || !discountCode || !packageName || !originalPrice || !discountedPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate discount code
    const validCodes = ['FIRST10', 'MAX10', 'PREMIUM10'];
    if (!validCodes.includes(discountCode)) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 400 }
      );
    }

    // Save email to database (mailing list)
    try {
      const supabaseClient = getSupabase();
      const { error: dbError } = await supabaseClient
        .from('email_subscribers')
        .upsert({
          email: email.toLowerCase(),
          source: `exit_intent_${packageName.toLowerCase()}`,
          discount_code: discountCode,
          subscribed_at: new Date().toISOString(),
          tags: ['exit_intent', discountCode.toLowerCase(), packageName.toLowerCase()]
        }, {
          onConflict: 'email'
        });

      if (dbError) {
        console.error('Error saving email to database:', dbError);
        // Continue anyway - email is more important than DB storage
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway
    }

    // Generate email HTML
    const emailHTML = generateDiscountEmailHTML(
      discountCode,
      packageName,
      originalPrice,
      discountedPrice
    );

    // Send email
    const resendClient = getResend();
    const { data, error } = await resendClient.emails.send({
      from: 'Testograph <offers@shop.testograph.eu>',
      to: email,
      subject: `🎁 Твоят ${discountCode} промокод за ${packageName}`,
      html: emailHTML,
    });

    if (error) {
      console.error('Error sending discount code email:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log(`✅ Discount code email sent: ${discountCode} to ${email}`, data?.id);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id,
      discountCode
    });

  } catch (error: any) {
    console.error('Error in discount code API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
