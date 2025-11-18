'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  FileText,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { CreateClusterDialog } from './CreateClusterDialog';
import { useToast } from '@/hooks/use-toast';

interface Stats {
  total_clusters: number;
  total_pillars: number;
  missing_pillars: number;
  pillars_without_cluster: number;
}

interface Pillar {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  created_at: string;
}

interface Cluster {
  id: string;
  slug: string;
  title: string;
  category: string;
  created_at: string;
  is_published: boolean;
  pillars: Pillar[];
  suggested_pillars: string[];
  missing_pillars: string[];
}

export function LearnContentDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(
    new Set()
  );
  const [creatingPillar, setCreatingPillar] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/learn-content/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.stats);
      setClusters(data.content_structure);
    } catch (error) {
      console.error('Stats error:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно зареждане на статистики',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    clusterSlug: string,
    clusterCategory: string
  ) => {
    const pillarKey = `${clusterSlug}-${pillarTitle}`;
    setCreatingPillar(pillarKey);

    try {
      const response = await fetch('/api/admin/learn-content/create-pillar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pillarTitle,
          parent_cluster_slug: clusterSlug,
          category: clusterCategory,
          keywords: '',
        }),
      });

      if (!response.ok) throw new Error('Failed to create pillar');

      const data = await response.json();

      toast({
        title: '✅ Пилърът е създаден!',
        description: `"${data.guide.title}" е готов`,
      });

      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error('Pillar creation error:', error);
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно създаване на пилър',
        variant: 'destructive',
      });
    } finally {
      setCreatingPillar(null);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const map: Record<string, string> = {
      testosterone: '🧬',
      potency: '💪',
      fitness: '🏋️',
      nutrition: '🥗',
      supplements: '💊',
      lifestyle: '🌿',
    };
    return map[category] || '📚';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общо Clusters</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_clusters || 0}</div>
            <p className="text-xs text-muted-foreground">
              Обзорни ръководства
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общо Pillars</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_pillars || 0}</div>
            <p className="text-xs text-muted-foreground">
              Задълбочени статии
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Липсващи Pillars
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.missing_pillars || 0}
            </div>
            <p className="text-xs text-muted-foreground">Предложени от AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Без Cluster</CardTitle>
            <BookOpen className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pillars_without_cluster || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pillars без родител
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Structure */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Структура на съдържанието</CardTitle>
            <CreateClusterDialog onClusterCreated={fetchData} />
          </div>
        </CardHeader>
        <CardContent>
          {clusters.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
              <p className="text-zinc-400 mb-4">
                Все още нямаш създадени clusters
              </p>
              <CreateClusterDialog onClusterCreated={fetchData} />
            </div>
          ) : (
            <div className="space-y-2">
              {clusters.map((cluster) => {
                const isExpanded = expandedClusters.has(cluster.id);
                return (
                  <div
                    key={cluster.id}
                    className="border border-zinc-800 rounded-lg overflow-hidden"
                  >
                    {/* Cluster Header */}
                    <button
                      onClick={() => toggleCluster(cluster.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-zinc-900/50 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      )}
                      <span className="text-lg">
                        {getCategoryEmoji(cluster.category)}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{cluster.title}</div>
                        <div className="text-sm text-zinc-500">
                          {cluster.pillars.length} pillars •{' '}
                          {cluster.missing_pillars.length} липсващи
                        </div>
                      </div>
                      {cluster.is_published ? (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          Публикуван
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Чернова</Badge>
                      )}
                    </button>

                    {/* Pillars List */}
                    {isExpanded && (
                      <div className="border-t border-zinc-800 bg-zinc-900/30 p-4 space-y-2">
                        {/* Existing Pillars */}
                        {cluster.pillars.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-zinc-400">
                              Създадени Pillars:
                            </div>
                            {cluster.pillars.map((pillar) => (
                              <div
                                key={pillar.id}
                                className="flex items-center gap-2 p-2 rounded bg-zinc-800/50"
                              >
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="flex-1 text-sm">
                                  {pillar.title}
                                </span>
                                {pillar.is_published ? (
                                  <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                                    Публикуван
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    Чернова
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Missing Pillars */}
                        {cluster.missing_pillars.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <div className="text-sm font-semibold text-orange-400">
                              Липсващи Pillars (AI предложения):
                            </div>
                            {cluster.missing_pillars.map((pillarTitle, idx) => {
                              const pillarKey = `${cluster.slug}-${pillarTitle}`;
                              const isCreating = creatingPillar === pillarKey;

                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 p-2 rounded bg-orange-500/10 border border-orange-500/20"
                                >
                                  <AlertCircle className="w-4 h-4 text-orange-400" />
                                  <span className="flex-1 text-sm text-zinc-300">
                                    {pillarTitle}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() =>
                                      handleCreatePillar(
                                        pillarTitle,
                                        cluster.slug,
                                        cluster.category
                                      )
                                    }
                                    disabled={isCreating || creatingPillar !== null}
                                  >
                                    {isCreating ? (
                                      <>
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Генериране...
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
                        )}

                        {cluster.pillars.length === 0 &&
                          cluster.missing_pillars.length === 0 && (
                            <div className="text-center py-4 text-sm text-zinc-500">
                              Няма pillars за този cluster
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
