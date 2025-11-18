import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  // Check auth & admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Fetch all guides
    const { data: guides, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate stats
    const totalGuides = guides?.length || 0;
    const publishedGuides = guides?.filter(g => g.is_published).length || 0;
    const draftGuides = guides?.filter(g => !g.is_published).length || 0;
    const totalViews = guides?.reduce((sum, g) => sum + (g.views || 0), 0) || 0;

    return NextResponse.json({
      stats: {
        total: totalGuides,
        published: publishedGuides,
        drafts: draftGuides,
        total_views: totalViews,
      },
      guides: guides || [],
    });

  } catch (error: any) {
    console.error('[Guides] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch guides' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();

  // Check auth & admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id, is_published } = await request.json();

    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        is_published,
        published_at: is_published ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, guide: data });

  } catch (error: any) {
    console.error('[Guides] Publish error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update guide' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  // Check auth & admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing guide ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[Guides] Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete guide' },
      { status: 500 }
    );
  }
}
