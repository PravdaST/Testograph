import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/admin/audit-log';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await params;
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const adminEmail = searchParams.get('adminEmail');

    // Validation
    if (!adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing admin credentials' },
        { status: 400 }
      );
    }

    // Get template for audit log
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete template
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'delete_template',
      targetUserId: null,
      targetUserEmail: null,
      changesBefore: {
        template_id: templateId,
        name: template.name,
        category: template.category
      },
      changesAfter: null,
      description: `Изтрит email template: ${template.name}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Template изтрит успешно'
    });

  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    );
  }
}
