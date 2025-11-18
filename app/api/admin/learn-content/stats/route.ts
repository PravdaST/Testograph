import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Log incoming headers
  const authHeader = request.headers.get('authorization');
  console.log('[stats API] Authorization header:', authHeader ? 'present' : 'missing');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log('[stats API] getUser result:', { hasUser: !!user, error });

  if (!user) {
    console.log('[stats API] Returning 401 - no user');
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
    // Fetch all clusters and pillars
    const { data: clusters, error: clustersError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('guide_type', 'cluster')
      .order('created_at', { ascending: false });

    if (clustersError) throw clustersError;

    const { data: pillars, error: pillarsError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('guide_type', 'pillar')
      .order('created_at', { ascending: false });

    if (pillarsError) throw pillarsError;

    // Calculate missing pillars
    const existingPillarSlugs = new Set((pillars || []).map(p => p.slug));
    let missingPillarsCount = 0;
    const missingPillarsByCluster: any[] = [];

    (clusters || []).forEach(cluster => {
      if (cluster.suggested_pillars && Array.isArray(cluster.suggested_pillars)) {
        const missing = cluster.suggested_pillars.filter((slug: string) => !existingPillarSlugs.has(slug));
        if (missing.length > 0) {
          missingPillarsCount += missing.length;
          missingPillarsByCluster.push({
            cluster_slug: cluster.slug,
            cluster_title: cluster.title,
            missing_pillars: missing,
            missing_count: missing.length
          });
        }
      }
    });

    // Pillars without cluster
    const pillarsWithoutCluster = (pillars || []).filter(p => !p.parent_cluster_slug);

    // Build content structure
    const contentStructure = (clusters || []).map(cluster => ({
      id: cluster.id,
      slug: cluster.slug,
      title: cluster.title,
      category: cluster.guide_category,
      created_at: cluster.created_at,
      is_published: cluster.is_published,
      pillars: (pillars || [])
        .filter(p => p.parent_cluster_slug === cluster.slug)
        .map(p => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          is_published: p.is_published,
          created_at: p.created_at
        })),
      suggested_pillars: cluster.suggested_pillars || [],
      missing_pillars: cluster.suggested_pillars
        ? cluster.suggested_pillars.filter((slug: string) => !existingPillarSlugs.has(slug))
        : []
    }));

    return NextResponse.json({
      stats: {
        total_clusters: clusters?.length || 0,
        total_pillars: pillars?.length || 0,
        missing_pillars: missingPillarsCount,
        pillars_without_cluster: pillarsWithoutCluster.length
      },
      content_structure: contentStructure,
      missing_pillars_detail: missingPillarsByCluster,
      pillars_without_cluster: pillarsWithoutCluster.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.guide_category,
        created_at: p.created_at
      }))
    });

  } catch (error: any) {
    console.error('[Stats] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
