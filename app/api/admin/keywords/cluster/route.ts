import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/admin/keywords/cluster - Auto-cluster keywords using AI
export async function POST(request: Request) {
  console.log('[Keyword Clustering API] POST - Auto-clustering keywords');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[Keyword Clustering API] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[Keyword Clustering API] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { keyword_ids, auto_create = true } = body;

    // Get keywords to cluster
    let query = supabase.from('target_keywords').select('id, keyword, category');

    if (keyword_ids && keyword_ids.length > 0) {
      query = query.in('id', keyword_ids);
    }

    const { data: keywords, error: keywordsError } = await query;

    if (keywordsError || !keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: 'No keywords found to cluster' },
        { status: 400 }
      );
    }

    console.log(`[Keyword Clustering API] Clustering ${keywords.length} keywords`);

    // Use OpenRouter Gemini 2.5 Pro to cluster keywords
    const keywordList = keywords.map(k => k.keyword).join('\n- ');

    const prompt = `Анализирай следните keywords и ги групирай по теми за SEO content strategy.

Keywords (на български):
- ${keywordList}

Върни резултат в следния JSON формат:
{
  "clusters": [
    {
      "name": "име на кластера на български",
      "theme": "тема на кластера",
      "description": "кратко описание",
      "pillar_keyword": "главен keyword за pillar page",
      "keywords": ["keyword1", "keyword2", ...],
      "relevance_scores": { "keyword1": 0.95, "keyword2": 0.87, ... }
    }
  ]
}

Важно:
- Групирай keywords по семантична близост и search intent
- Идентифицирай pillar keyword за всеки кластер (най-общия/широк keyword)
- relevance_score между 0 и 1 показва колко релевантен е keyword-ът към темата
- Описания на български
- Създай 3-8 смислени кластера

Върни САМО JSON, без допълнителен текст.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://testograph.eu',
        'X-Title': 'Testograph SEO Keyword Clustering'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Keyword Clustering API] OpenRouter error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const clusterData = JSON.parse(jsonMatch[0]);

    if (!auto_create) {
      // Just return the clustering suggestion
      return NextResponse.json({
        success: true,
        suggestions: clusterData.clusters,
        keyword_count: keywords.length
      });
    }

    // Auto-create clusters
    const createdClusters = [];

    for (const cluster of clusterData.clusters) {
      // Find pillar keyword ID
      const pillarKeyword = keywords.find(
        k => k.keyword.toLowerCase() === cluster.pillar_keyword.toLowerCase()
      );

      // Create cluster
      const { data: newCluster, error: clusterError } = await supabase
        .from('keyword_clusters')
        .insert({
          name: cluster.name,
          description: cluster.description,
          theme: cluster.theme,
          pillar_keyword_id: pillarKeyword?.id || null,
          created_by: user.id
        })
        .select()
        .single();

      if (clusterError) {
        console.error('[Keyword Clustering API] Failed to create cluster:', clusterError);
        continue;
      }

      // Add keywords to cluster
      const members = [];
      for (const kwText of cluster.keywords) {
        const kw = keywords.find(
          k => k.keyword.toLowerCase() === kwText.toLowerCase()
        );

        if (kw) {
          members.push({
            keyword_id: kw.id,
            cluster_id: newCluster.id,
            relevance_score: cluster.relevance_scores[kwText] || 1.0,
            is_pillar: kw.id === pillarKeyword?.id
          });
        }
      }

      if (members.length > 0) {
        const { error: membersError } = await supabase
          .from('keyword_cluster_members')
          .insert(members);

        if (membersError) {
          console.error('[Keyword Clustering API] Failed to add members:', membersError);
        }
      }

      createdClusters.push({
        ...newCluster,
        keyword_count: members.length
      });
    }

    console.log(`[Keyword Clustering API] ✅ Created ${createdClusters.length} clusters`);

    return NextResponse.json({
      success: true,
      clusters: createdClusters,
      total_keywords: keywords.length
    });

  } catch (error: any) {
    console.error('[Keyword Clustering API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cluster keywords' },
      { status: 500 }
    );
  }
}

// GET /api/admin/keywords/cluster - Get all clusters
export async function GET(request: Request) {
  console.log('[Keyword Clustering API] GET - Fetching clusters');

  const supabase = await createClient();

  // Check auth & admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error('[Keyword Clustering API] Unauthorized:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    console.error('[Keyword Clustering API] Not an admin user');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Get all clusters with their keywords
    const { data: clusters, error: clustersError } = await supabase
      .from('keyword_clusters')
      .select(`
        *,
        pillar_keyword:pillar_keyword_id(id, keyword),
        members:keyword_cluster_members(
          id,
          relevance_score,
          is_pillar,
          keyword:keyword_id(id, keyword, priority, category, target_url)
        )
      `)
      .order('created_at', { ascending: false });

    if (clustersError) {
      throw clustersError;
    }

    // Calculate stats for each cluster
    const clustersWithStats = clusters?.map(cluster => ({
      ...cluster,
      keyword_count: cluster.members?.length || 0,
      high_priority_count: cluster.members?.filter(
        (m: any) => m.keyword?.priority === 'high'
      ).length || 0
    })) || [];

    return NextResponse.json({
      clusters: clustersWithStats,
      total: clustersWithStats.length
    });

  } catch (error: any) {
    console.error('[Keyword Clustering API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch clusters' },
      { status: 500 }
    );
  }
}
