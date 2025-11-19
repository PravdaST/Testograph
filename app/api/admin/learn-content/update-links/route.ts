import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { addSmartInternalLinks } from '@/lib/utils/smart-linking';

export async function POST(request: Request) {
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
    const { guide_id, update_all } = await request.json();

    if (update_all) {
      // Update all guides
      console.log('[Update Links] Starting bulk update for all guides...');

      // Fetch all published guides
      const { data: allGuides, error: fetchError } = await supabase
        .from('blog_posts')
        .select('id, slug, title, content, guide_type, guide_category, parent_cluster_slug, suggested_pillars')
        .eq('category', 'learn-guide')
        .eq('is_published', true);

      if (fetchError || !allGuides) {
        throw new Error('Failed to fetch guides');
      }

      console.log(`[Update Links] Processing ${allGuides.length} guides...`);

      let updatedCount = 0;

      for (const guide of allGuides) {
        try {
          // Add smart links
          const updatedContent = addSmartInternalLinks(guide, allGuides);

          // Only update if content changed
          if (updatedContent !== guide.content) {
            const { error: updateError } = await supabase
              .from('blog_posts')
              .update({ content: updatedContent })
              .eq('id', guide.id);

            if (!updateError) {
              updatedCount++;
              console.log(`[Update Links] ✓ Updated: ${guide.slug}`);
            }
          }
        } catch (error) {
          console.error(`[Update Links] ✗ Failed for ${guide.slug}:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Updated ${updatedCount} out of ${allGuides.length} guides`,
        updated_count: updatedCount,
        total_guides: allGuides.length,
      });
    } else {
      // Update single guide
      if (!guide_id) {
        return NextResponse.json({ error: 'guide_id required' }, { status: 400 });
      }

      console.log('[Update Links] Updating single guide:', guide_id);

      // Fetch the specific guide
      const { data: guide, error: guideError } = await supabase
        .from('blog_posts')
        .select('id, slug, title, content, guide_type, guide_category, parent_cluster_slug, suggested_pillars')
        .eq('id', guide_id)
        .single();

      if (guideError || !guide) {
        throw new Error('Guide not found');
      }

      // Fetch all other published guides for linking
      const { data: allGuides, error: fetchError } = await supabase
        .from('blog_posts')
        .select('id, slug, title, guide_type, guide_category, parent_cluster_slug, suggested_pillars')
        .eq('category', 'learn-guide')
        .eq('is_published', true)
        .neq('id', guide_id);

      if (fetchError) {
        throw new Error('Failed to fetch other guides');
      }

      // Add the current guide to the list for processing
      const updatedContent = addSmartInternalLinks(guide, [...(allGuides || []), guide]);

      // Update in database
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ content: updatedContent })
        .eq('id', guide_id);

      if (updateError) {
        throw new Error(`Failed to update guide: ${updateError.message}`);
      }

      console.log('[Update Links] ✓ Successfully updated:', guide.slug);

      return NextResponse.json({
        success: true,
        message: 'Links updated successfully',
        guide_slug: guide.slug,
      });
    }
  } catch (error: any) {
    console.error('[Update Links] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update links' },
      { status: 500 }
    );
  }
}
