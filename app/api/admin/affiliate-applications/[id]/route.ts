import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';
import { createShopifyDiscountCode, isShopifyConfigured } from '@/lib/shopify/discount-codes';
import { createAuditLog } from '@/lib/admin/audit-log';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, commission_rate, admin_notes, adminId, adminEmail } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Validate admin credentials for audit log
    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing admin credentials' },
        { status: 400 }
      );
    }

    // First, get the application details
    const { data: application, error: fetchError } = await supabase
      .from('affiliate_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update the application
    const { data: updatedApp, error: updateError } = await supabase
      .from('affiliate_applications')
      .update({
        status,
        admin_notes,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Create audit log for affiliate application decision
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: status === 'approved' ? 'approve_affiliate' : 'reject_affiliate',
      targetUserId: null,
      targetUserEmail: application.email,
      changesBefore: {
        status: application.status,
        full_name: application.full_name,
        email: application.email
      },
      changesAfter: {
        status,
        commission_rate: commission_rate || 5,
        admin_notes
      },
      description: status === 'approved'
        ? `Одобрена affiliate заявка на ${application.full_name} (${application.email})`
        : `Отхвърлена affiliate заявка на ${application.full_name} (${application.email})`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    // If approved, create affiliate record and send email
    if (status === 'approved') {
      // Generate unique promo code
      const promoCode = generatePromoCode(application.full_name);

      // Create affiliate record
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .insert({
          user_id: null, // Will be set when they log in
          full_name: application.full_name,
          email: application.email,
          phone: application.phone,
          promo_code: promoCode,
          commission_rate: commission_rate || 5,
          status: 'active',
          application_id: id,
        })
        .select()
        .single();

      if (affiliateError) {
        console.error('Error creating affiliate:', affiliateError);
        // Rollback application status
        await supabase
          .from('affiliate_applications')
          .update({ status: 'pending' })
          .eq('id', id);

        return NextResponse.json(
          { error: 'Failed to create affiliate account' },
          { status: 500 }
        );
      }

      // Create Shopify discount code
      console.log('🛍️ Creating Shopify discount code...');
      if (isShopifyConfigured()) {
        const shopifyResult = await createShopifyDiscountCode({
          code: promoCode,
          discountPercentage: commission_rate || 5,
          title: `Affiliate ${application.full_name} - ${promoCode}`,
          combinesWith: {
            orderDiscounts: false,
            productDiscounts: false,
            shippingDiscounts: false,
          },
        });

        if (shopifyResult.success) {
          console.log(`✅ Shopify discount code created: ${shopifyResult.discountCode?.code}`);
        } else {
          console.error('⚠️ Failed to create Shopify discount code:', shopifyResult.error);
          // Don't fail the entire process - log warning and continue
          // Admin can manually create the discount code if needed
        }
      } else {
        console.warn('⚠️ Shopify credentials not configured - skipping discount code creation');
        console.log('   To enable automatic discount code creation:');
        console.log('   1. Add SHOPIFY_ADMIN_ACCESS_TOKEN to .env.local');
        console.log('   2. See: https://shop.testograph.eu/admin/settings/apps/development');
      }

      // Check if Auth user already exists (e.g., existing Testograph customer)
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === application.email);

      let userId: string;
      let temporaryPassword: string | null = null;
      let isExistingUser = false;

      if (existingUser) {
        // User already has Testograph account - link to affiliate
        console.log('✅ Existing Testograph user found:', application.email);
        isExistingUser = true;
        userId = existingUser.id;

        // Update user metadata to include affiliate info
        await supabase.auth.admin.updateUserById(existingUser.id, {
          user_metadata: {
            ...existingUser.user_metadata,
            affiliate_id: affiliate.id,
            affiliate_role: 'active'
          }
        });
      } else {
        // New user - create Auth account with temporary password
        console.log('🆕 Creating new Auth user for:', application.email);
        temporaryPassword = generateSecurePassword(12);

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: application.email,
          password: temporaryPassword,
          email_confirm: true, // Skip email verification
          user_metadata: {
            full_name: application.full_name,
            affiliate_id: affiliate.id,
            role: 'affiliate'
          }
        });

        if (authError) {
          console.error('❌ Error creating auth user:', authError);
          return NextResponse.json(
            { error: 'Failed to create user account' },
            { status: 500 }
          );
        }

        userId = authUser.user.id;
      }

      // Update affiliate with user_id
      await supabase
        .from('affiliates')
        .update({ user_id: userId })
        .eq('id', affiliate.id);

      // Send appropriate approval email based on user type
      try {
        const emailTemplate = isExistingUser
          ? getApprovalEmailForExistingUser({
              fullName: application.full_name,
              promoCode: promoCode,
              commissionRate: commission_rate || 5,
              email: application.email,
            })
          : getApprovalEmailTemplate({
              fullName: application.full_name,
              promoCode: promoCode,
              commissionRate: commission_rate || 5,
              email: application.email,
              password: temporaryPassword!,
            });

        await resend.emails.send({
          from: 'Testograph Affiliates <affiliates@shop.testograph.eu>',
          to: application.email,
          subject: '🎉 Поздравления! Одобрен си като Testograph Affiliate',
          html: emailTemplate,
        });

        console.log(`✅ Approval email sent to ${application.email} (${isExistingUser ? 'existing' : 'new'} user)`);
      } catch (emailError: any) {
        console.error('❌ Failed to send approval email:', emailError);
        // Don't fail the request if email fails - affiliate is already created
      }
    } else if (status === 'rejected') {
      // TODO: Send rejection email (optional)
      console.log('TODO: Send rejection email to', application.email);
    }

    return NextResponse.json({
      success: true,
      application: updatedApp,
    });

  } catch (error: any) {
    console.error('Error in application approval API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate unique promo code
function generatePromoCode(fullName: string): string {
  const namePart = fullName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 6)
    .toUpperCase();

  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${namePart}${randomPart}`;
}

// Helper function to generate secure random password
function generateSecurePassword(length: number): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
  const randomBytes = crypto.randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

// Email template for affiliate approval
function getApprovalEmailTemplate(params: {
  fullName: string;
  promoCode: string;
  commissionRate: number;
  email: string;
  password: string;
}): string {
  const { fullName, promoCode, commissionRate, email, password } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Добре дошъл в Testograph Affiliates</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Поздравления, ${fullName}!</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Одобрен си като Testograph Affiliate Partner</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">

              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Радваме се да те поздравим в екипа на Testograph! Заявката ти е одобрена и вече можеш да започнеш да печелиш като промотираш нашите продукти.
              </p>

              <!-- Promo Code Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0; border: 2px dashed #667eea;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Твоят Промо Код</p>
                    <p style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold; letter-spacing: 2px; font-family: monospace;">${promoCode}</p>
                    <p style="margin: 15px 0 0 0; color: #666666; font-size: 14px;">
                      <strong>Commission Rate:</strong> <span style="color: #22c55e; font-weight: bold;">${commissionRate}%</span>
                    </p>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 30px 0 15px 0; color: #333333; font-size: 20px; font-weight: 600;">🔑 Данни за достъп</h2>

              <p style="margin: 0 0 15px 0; color: #555555; font-size: 14px;">
                Създадохме ти account в affiliate dashboard-а. Ето данните за login:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; color: #78350f; font-size: 14px;">
                      <strong>Email:</strong> ${email}
                    </p>
                    <p style="margin: 0 0 10px 0; color: #78350f; font-size: 14px;">
                      <strong>Временна парола:</strong> <code style="background-color: #fef3c7; padding: 4px 8px; border-radius: 4px; font-size: 13px; color: #92400e; font-weight: 600;">${password}</code>
                    </p>
                    <p style="margin: 15px 0 0 0; color: #92400e; font-size: 13px; font-style: italic;">
                      ⚠️ <strong>Важно:</strong> Моля промени си паролата след първи login за сигурност!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://affiliate.testograph.eu/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Влез в Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 40px 0 15px 0; color: #333333; font-size: 20px; font-weight: 600;">📊 Какво следва?</h2>

              <ul style="margin: 0; padding-left: 20px; color: #555555; line-height: 1.8;">
                <li style="margin-bottom: 10px;">Влез в dashboard-а с данните по-горе</li>
                <li style="margin-bottom: 10px;">Промени си паролата за сигурност</li>
                <li style="margin-bottom: 10px;">Разгледай маркетинг материалите (банери, текстове, видеа)</li>
                <li style="margin-bottom: 10px;">Започни да промотираш с твоя промо код <strong>${promoCode}</strong></li>
                <li style="margin-bottom: 10px;">Следи статистиките си в реално време</li>
              </ul>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
                      💡 <strong>Pro Tip:</strong> Колкото повече промотираш продуктите, толкова повече печелиш! Използвай маркетинг материалите от dashboard-а за максимален резултат.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                Имаш въпроси? Пиши ни на <a href="mailto:affiliates@testograph.eu" style="color: #667eea; text-decoration: none;">affiliates@testograph.eu</a>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2025 Testograph. Всички права запазени.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Email template for existing Testograph users
function getApprovalEmailForExistingUser(params: {
  fullName: string;
  promoCode: string;
  commissionRate: number;
  email: string;
}): string {
  const { fullName, promoCode, commissionRate, email } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Добре дошъл в Testograph Affiliates</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Поздравления, ${fullName}!</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Одобрен си като Testograph Affiliate Partner</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">

              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Радваме се да те поздравим в екипа на Testograph! Заявката ти е одобрена и вече можеш да започнеш да печелиш като промотираш нашите продукти.
              </p>

              <!-- Promo Code Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0; border: 2px dashed #667eea;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Твоят Промо Код</p>
                    <p style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold; letter-spacing: 2px; font-family: monospace;">${promoCode}</p>
                    <p style="margin: 15px 0 0 0; color: #666666; font-size: 14px;">
                      <strong>Commission Rate:</strong> <span style="color: #22c55e; font-weight: bold;">${commissionRate}%</span>
                    </p>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 30px 0 15px 0; color: #333333; font-size: 20px; font-weight: 600;">🔑 Данни за достъп</h2>

              <p style="margin: 0 0 15px 0; color: #555555; font-size: 14px;">
                Тъй като вече имаш Testograph account, можеш да влезеш директно в affiliate dashboard-а със същия email и парола:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e0f2fe; border-left: 4px solid #0ea5e9; border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; color: #075985; font-size: 14px;">
                      <strong>Email:</strong> ${email}
                    </p>
                    <p style="margin: 0 0 10px 0; color: #075985; font-size: 14px;">
                      <strong>Парола:</strong> Използвай твоята Testograph парола
                    </p>
                    <p style="margin: 15px 0 0 0; color: #0c4a6e; font-size: 13px; font-style: italic;">
                      ℹ️ <strong>Същият account работи</strong> и за Testograph, и за Affiliate Dashboard!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://affiliate.testograph.eu/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Влез в Affiliate Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 40px 0 15px 0; color: #333333; font-size: 20px; font-weight: 600;">📊 Какво следва?</h2>

              <ul style="margin: 0; padding-left: 20px; color: #555555; line-height: 1.8;">
                <li style="margin-bottom: 10px;">Влез в affiliate dashboard-а с твоята Testograph парола</li>
                <li style="margin-bottom: 10px;">Разгледай маркетинг материалите (банери, текстове, видеа)</li>
                <li style="margin-bottom: 10px;">Започни да промотираш с твоя промо код <strong>${promoCode}</strong></li>
                <li style="margin-bottom: 10px;">Следи статистиките си в реално време</li>
                <li style="margin-bottom: 10px;">Получавай комисионни от всяка продажба!</li>
              </ul>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
                      💡 <strong>Pro Tip:</strong> Колкото повече промотираш продуктите, толкова повече печелиш! Използвай маркетинг материалите от dashboard-а за максимален резултат.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                Имаш въпроси? Пиши ни на <a href="mailto:affiliates@testograph.eu" style="color: #667eea; text-decoration: none;">affiliates@testograph.eu</a>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2025 Testograph. Всички права запазени.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
