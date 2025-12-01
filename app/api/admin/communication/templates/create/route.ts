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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      subject,
      body: templateBody,
      category,
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

    // Check if template with same name already exists
    const { data: existing } = await supabase
      .from('email_templates')
      .select('id')
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Template with this name already exists' },
        { status: 400 }
      );
    }

    // Auto-detect variables from template body
    const variables = extractVariables(templateBody);

    // Create template
    const { data: template, error } = await supabase
      .from('email_templates')
      .insert({
        name,
        subject,
        body: templateBody,
        category: category || 'general',
        variables,
        notes: notes || null,
        created_by: adminId
      })
      .select()
      .single();

    if (error) throw error;

    // Create audit log
    await createAuditLog({
      adminId,
      adminEmail,
      actionType: 'create_template',
      targetUserId: null,
      targetUserEmail: null,
      changesBefore: null,
      changesAfter: {
        template_id: template.id,
        name,
        category,
        variables
      },
      description: `Създаден email template: ${name}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined
    });

    return NextResponse.json({
      success: true,
      message: 'Template създаден успешно',
      template
    });

  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
}
