'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, ChevronDown, ChevronRight, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { CreateClusterModal } from './CreateClusterModal';
import { SchedulePublishModal } from './SchedulePublishModal';
import { createClient } from '@/lib/supabase/client';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  guide_type: 'cluster' | 'pillar' | null;
  guide_category: string | null;
  main_topic: string | null;
  created_at: string;
  content: string;
  suggested_pillars?: string[];
  // Keywords integration fields
  target_keyword_id?: string | null;
  secondary_keyword_ids?: string[];
  seo_optimization_score?: number | null;
  seo_optimized_for_keyword?: boolean;
};

type ClusterGroup = {
  cluster: BlogPost;
  pillars: BlogPost[];
  missingPillars: string[];
};

export function LearnContentDashboard({ guides }: { guides: BlogPost[] }) {
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [creatingPillar, setCreatingPillar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [pillarToSchedule, setPillarToSchedule] = useState<{
    title: string;
    category: string;
    clusterSlug: string;
    clusterTitle: string;
    mainTopic: string;
  } | null>(null);
  const supabase = createClient();

  // Group guides by cluster/pillar relationship
  const clusters = guides.filter((g) => g.guide_type === 'cluster');
  const pillars = guides.filter((g) => g.guide_type === 'pillar');

  // Orphan pillars = pillars without a cluster in their category
  const orphanPillars = pillars.filter((p) => {
    if (!p.guide_category) return true; // No category = orphan
    // Check if there's a cluster in the same category
    const hasCluster = clusters.some(c => c.guide_category === p.guide_category);
    return !hasCluster;
  });

  // Build cluster groups
  const clusterGroups: ClusterGroup[] = clusters.map((cluster) => {
    const relatedPillars = pillars.filter(
      (p) => p.guide_category === cluster.guide_category
    );

    // Use AI-suggested pillars if available, otherwise fallback to generic list
    const suggestedFromCluster = cluster.suggested_pillars || [];

    // Fallback expected pillar topics based on category (only used if no AI suggestions)
    const expectedPillars: Record<string, string[]> = {
      guides: ['Beginner Guide', 'Advanced Techniques', 'Common Mistakes'],
      planets: ['Слънцето', 'Луната', 'Меркурий', 'Венера', 'Марс', 'Юпитер', 'Сатурн'],
      signs: ['Овен', 'Телец', 'Близнаци', 'Рак', 'Лъв', 'Дева', 'Везни', 'Скорпион', 'Стрелец', 'Козирог', 'Водолей', 'Риби'],
      houses: ['1-ва къща', '2-ра къща', '3-та къща', '4-та къща', '5-та къща', '6-та къща', '7-ма къща', '8-ма къща', '9-та къща', '10-та къща', '11-та къща', '12-та къща'],
      aspects: ['Конюнкция', 'Опозиция', 'Тригон', 'Квадрат', 'Секстил'],
    };

    const categoryExpected = suggestedFromCluster.length > 0
      ? suggestedFromCluster
      : (expectedPillars[cluster.guide_category || 'guides'] || []);

    const existingTitles = relatedPillars.map((p) =>
      p.title.toLowerCase()
    );

    const missingPillars = categoryExpected.filter(
      (expected) =>
        !existingTitles.some((title) =>
          title.includes(expected.toLowerCase())
        )
    );

    return {
      cluster,
      pillars: relatedPillars,
      missingPillars,
    };
  });

  const toggleCluster = (clusterId: string) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(clusterId)) {
      newExpanded.delete(clusterId);
    } else {
      newExpanded.add(clusterId);
    }
    setExpandedClusters(newExpanded);
  };

  const handleCreatePillar = async (
    pillarTitle: string,
    category: string,
    clusterSlug: string,
    clusterTitle: string,
    mainTopic: string,
    scheduledFor: string | null = null
  ) => {
    setCreatingPillar(pillarTitle);
    setError(null);

    try {
      // Call API to generate pillar
      const response = await fetch('/api/admin/create-pillar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillarTitle,
          category,
          clusterSlug,
          clusterTitle,
          mainTopic,
          scheduledFor,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle duplicate error (409 Conflict)
        if (response.status === 409 && errorData.duplicate && errorData.existingPost) {
          const duplicateUrl = errorData.existingPost.url;
          throw new Error(
            `${errorData.error}\n\nВиж съществуващата статия тук: ${window.location.origin}${duplicateUrl}`
          );
        }

        throw new Error(errorData.error || 'Failed to create pillar');
      }

      const data = await response.json();

      // Save to database
      const { error: dbError } = await supabase
        .from('blog_posts')
        .insert([data.pillar]);

      if (dbError) throw dbError;

      // Refresh page
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create pillar');
      console.error('Pillar creation error:', err);
    } finally {
      setCreatingPillar(null);
    }
  };

  const handleOpenScheduleModal = (
    pillarTitle: string,
    category: string,
    clusterSlug: string,
    clusterTitle: string,
    mainTopic: string
  ) => {
    setPillarToSchedule({ title: pillarTitle, category, clusterSlug, clusterTitle, mainTopic });
    setIsScheduleModalOpen(true);
  };

  const handleScheduleConfirm = (scheduledFor: string | null) => {
    if (!pillarToSchedule) return;

    handleCreatePillar(
      pillarToSchedule.title,
      pillarToSchedule.category,
      pillarToSchedule.clusterSlug,
      pillarToSchedule.clusterTitle,
      pillarToSchedule.mainTopic,
      scheduledFor
    );

    setPillarToSchedule(null);
  };

  const handleGetAISuggestion = async () => {
    setIsLoadingSuggestion(true);
    setError(null);

    try {
      const pillarTitles = orphanPillars.map(p => p.title);

      const response = await fetch('/api/admin/suggest-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillarTitles }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestion');
      }

      const data = await response.json();
      setAiSuggestion(data.suggestion);
    } catch (err: any) {
      setError(err.message || 'Failed to get AI suggestion');
      console.error('AI suggestion error:', err);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const handleCreateSuggestedCluster = async () => {
    if (!aiSuggestion) return;

    try {
      // Use the create-cluster API with AI suggestion data
      const response = await fetch('/api/admin/create-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: aiSuggestion.clusterTitle,
          category: aiSuggestion.category,
          keywords: aiSuggestion.keywords,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create cluster');
      }

      const data = await response.json();

      // Save to database
      const { error: dbError } = await supabase
        .from('blog_posts')
        .insert([data.cluster]);

      if (dbError) throw dbError;

      // Refresh page
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create cluster');
      console.error('Cluster creation error:', err);
    }
  };

  const totalMissing = clusterGroups.reduce(
    (sum, group) => sum + group.missingPillars.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="text-sm text-zinc-500">Общо Clusters</div>
          <div className="text-2xl font-bold text-zinc-50">{clusters.length}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-sm text-zinc-500">Общо Pillars</div>
          <div className="text-2xl font-bold text-zinc-50">{pillars.length}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-sm text-zinc-500">Липсващи Pillars</div>
          <div className="text-2xl font-bold text-orange-400">{totalMissing}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-sm text-zinc-500">Без Cluster</div>
          <div className="text-2xl font-bold text-red-400">{orphanPillars.length}</div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card p-4 border-red-500/20 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Cluster Groups */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-50">Структура на Съдържанието</h2>
          <Button
            size="sm"
            onClick={() => setIsClusterModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Създай Cluster
          </Button>
        </div>

        {clusterGroups.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400">Все още няма създадени clusters</p>
            <p className="text-sm text-zinc-500 mt-2">
              Създай първия си cluster guide за да започнеш
            </p>
          </div>
        ) : (
          clusterGroups.map((group) => {
            const isExpanded = expandedClusters.has(group.cluster.id);
            const completion =
              ((group.pillars.length /
                (group.pillars.length + group.missingPillars.length)) *
                100) || 0;

            return (
              <div key={group.cluster.id} className="glass-card">
                {/* Cluster Header */}
                <button
                  onClick={() => toggleCluster(group.cluster.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    )}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-50">
                          {group.cluster.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          CLUSTER
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs capitalize"
                        >
                          {group.cluster.guide_category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                        <span>{group.pillars.length} pillars</span>
                        {group.missingPillars.length > 0 && (
                          <span className="text-orange-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {group.missingPillars.length} липсват
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-zinc-50">
                        {Math.round(completion)}%
                      </div>
                      <div className="text-xs text-zinc-500">Завършено</div>
                    </div>
                    <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 p-4 space-y-3">
                    {/* Existing Pillars */}
                    {group.pillars.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-zinc-400 mb-2">
                          Създадени Pillars ({group.pillars.length})
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {group.pillars.map((pillar) => (
                            <div
                              key={pillar.id}
                              className="flex items-center gap-2 p-2 rounded bg-zinc-900/50 text-sm"
                            >
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-zinc-300">
                                {pillar.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Pillars */}
                    {group.missingPillars.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-zinc-400 mb-2">
                          Предложени Pillars ({group.missingPillars.length})
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {group.missingPillars.map((missing, idx) => {
                            const isCreating = creatingPillar === missing;
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 p-2 rounded bg-orange-500/10 border border-orange-500/20 text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                                  <span className="text-zinc-300">{missing}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs"
                                  disabled={isCreating}
                                  onClick={() =>
                                    handleOpenScheduleModal(
                                      missing,
                                      group.cluster.guide_category || 'guides',
                                      group.cluster.slug,
                                      group.cluster.title,
                                      group.cluster.main_topic || 'astrology'
                                    )
                                  }
                                >
                                  {isCreating ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Създава...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3 mr-1" />
                                      Създай
                                    </>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Orphan Pillars Warning */}
      {orphanPillars.length > 0 && (
        <div className="glass-card p-4 border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold">Pillars без Cluster ({orphanPillars.length})</h3>
            </div>
            <Button
              size="sm"
              onClick={handleGetAISuggestion}
              disabled={isLoadingSuggestion}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {isLoadingSuggestion ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI Анализ...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Предложение за Cluster
                </>
              )}
            </Button>
          </div>

          {/* AI Suggestion Box */}
          {aiSuggestion && (
            <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-300 mb-2">
                    AI Препоръчва Cluster:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-zinc-400">Заглавие:</span>
                      <div className="text-zinc-200 font-medium">&ldquo;{aiSuggestion.clusterTitle}&rdquo;</div>
                    </div>
                    <div>
                      <span className="text-zinc-400">Категория:</span>
                      <Badge variant="secondary" className="ml-2 capitalize">
                        {aiSuggestion.category}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-zinc-400">Обяснение:</span>
                      <p className="text-zinc-300 text-xs mt-1">{aiSuggestion.reasoning}</p>
                    </div>
                    {aiSuggestion.missingPillars && aiSuggestion.missingPillars.length > 0 && (
                      <div>
                        <span className="text-zinc-400">Препоръчани допълнителни pillars:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {aiSuggestion.missingPillars.map((missing: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded bg-orange-500/20 text-xs text-orange-300"
                            >
                              {missing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={handleCreateSuggestedCluster}
                        className="bg-gradient-to-r from-green-500 to-emerald-500"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Създай този Cluster
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-zinc-400 mb-3">
            Тези pillars не са свързани с cluster. Използвай AI за автоматично предложение или промени ръчно:
          </p>
          <div className="space-y-2">
            {orphanPillars.map((pillar) => (
              <div
                key={pillar.id}
                className="flex items-center justify-between p-2 rounded bg-zinc-900/50"
              >
                <span className="text-sm text-zinc-300">{pillar.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Pillar
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Cluster Modal */}
      <CreateClusterModal
        isOpen={isClusterModalOpen}
        onClose={() => setIsClusterModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* Schedule Publish Modal */}
      <SchedulePublishModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setPillarToSchedule(null);
        }}
        onConfirm={handleScheduleConfirm}
        title={pillarToSchedule?.title || ''}
      />
    </div>
  );
}
