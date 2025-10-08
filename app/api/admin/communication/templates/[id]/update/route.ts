import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAuditLog } from '@/lib/admin/audit-log';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to extract variables from template body
function extractVariables(body: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = regex.exec(body)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const body = await request.json();
    const {
      name,
      subject,
      body: templateBody,
      category,
      is_active,
      notes,
      adminId,
      adminEmail
    } = body;

    // Validation
    if (!name || !subject || !templateBody || !adminId || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current template for audit log
    const { data: currentTemplate } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!currentTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if another template has the same name
    const { data: existing } = await supabase
      .from('email_templates')
      .select('id')
      .eq('name', name)
      .neq('id', templateId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Another template with this name already exists' },
        { status: 400 }
      );
    }

    // Auto-detect variables from template body
    const variables = extractVariables(templateBody);

    // Update template
    const { data: template, error } = await supabase
      .from('email_templates')
      .update({
        name,
        subject,
        body: templateBody,
        category: category || 'general',
        is_active: is_active !== undefined ? is_active : true,
        variables,
        notes: notes || null
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'send_email', // Using send_email as placeholder
      targetUserId: null,
      targetUserEmail: null,
      changesBefore: {
        name: currentTemplate.name,
        subject: currentTemplate.subject,
        category: currentTemplate.category,
        is_active: currentTemplate.is_active
      },
      changesAfter: {
        name,
        subject,
        category,
        is_active
      },
      description: `Обновен email template: ${name}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Template обновен успешно',
      template
    });

  } catch (error: any) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    );
  }
}
