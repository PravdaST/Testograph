import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// PATCH /api/admin/keywords/[id] - Update keyword
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log('[Keywords API] PATCH - Updating keyword:', id);

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[Keywords API] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[Keywords API] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { keyword, priority, category, focus_score, notes, target_url } = body;

    // Build update object
    const updates: any = {};

    if (keyword !== undefined && keyword.trim()) {
      // Check if new keyword already exists (excluding current keyword)
      const { data: existing } = await supabase
        .from('target_keywords')
        .select('id')
        .eq('keyword', keyword.trim())
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Keyword already exists' },
          { status: 409 }
        );
      }

      updates.keyword = keyword.trim();
    }

    if (priority && ['high', 'medium', 'low'].includes(priority)) {
      updates.priority = priority;
    }

    if (category !== undefined) {
      updates.category = category || null;
    }

    if (focus_score !== undefined) {
      updates.focus_score = Math.max(0, Math.min(100, focus_score));
    }

    if (notes !== undefined) {
      updates.notes = notes || null;
    }

    if (target_url !== undefined) {
      updates.target_url = target_url || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update keyword
    const { data: updatedKeyword, error: updateError } = await supabase
      .from('target_keywords')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Keywords API] Update error:', updateError);
      throw updateError;
    }

    if (!updatedKeyword) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    console.log('[Keywords API] ✅ Updated keyword:', updatedKeyword.keyword);

    return NextResponse.json({
      keyword: updatedKeyword,
      message: 'Keyword updated successfully'
    });

  } catch (err: any) {
    console.error('[Keywords API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update keyword' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/keywords/[id] - Delete keyword
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  console.log('[Keywords API] DELETE - Deleting keyword:', id);

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[Keywords API] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[Keywords API] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Delete keyword (CASCADE will delete related keyword_usage records)
    const { error: deleteError } = await supabase
      .from('target_keywords')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Keywords API] Delete error:', deleteError);
      throw deleteError;
    }

    console.log('[Keywords API] ✅ Deleted keyword:', id);

    return NextResponse.json({
      message: 'Keyword deleted successfully'
    });

  } catch (err: any) {
    console.error('[Keywords API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete keyword' },
      { status: 500 }
    );
  }
}
