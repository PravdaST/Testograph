"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin/api";
import {
  Search,
  Loader2,
  FileText,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  BarChart3,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface KeywordStats {
  keyword: string;
  total_count: number;
  article_count: number;
  title_count: number;
  meta_title_count: number;
  meta_description_count: number;
  h1_count: number;
  h2_count: number;
  h3_count: number;
  content_count: number;
  articles: {
    slug: string;
    title: string;
    count: number;
  }[];
}

interface OnSiteAnalysisData {
  keywords: KeywordStats[];
  total_posts: number;
  total_keywords: number;
  analyzed_at: string;
}

interface GSCKeyword {
  keyword: string;
  total_clicks: number;
  total_impressions: number;
  avg_ctr: number;
  avg_position: number;
}

interface ComparisonData {
  keyword: string;
  gsc_clicks: number;
  gsc_impressions: number;
  gsc_position: number;
  onsite_count: number;
  onsite_articles: number;
  optimization_status: "good" | "needs_more" | "missing";
  recommendation: string;
}

export function OnSiteAnalysis() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnSiteAnalysisData | null>(null);
  const [gscData, setGscData] = useState<GSCKeyword[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"comparison" | "onsite" | "gsc">("comparison");

  // Toggle row expansion
  const toggleRow = (keyword: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(keyword)) {
      newExpanded.delete(keyword);
    } else {
      newExpanded.add(keyword);
    }
    setExpandedRows(newExpanded);
  };

  // Fetch on-site analysis data and GSC data
  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      // Fetch both on-site and GSC data in parallel
      const [onsiteResponse, gscResponse] = await Promise.all([
        adminFetch("/api/admin/keywords/on-site-analysis"),
        adminFetch("/api/admin/gsc/performance?days=90&limit=200&sortBy=clicks"),
      ]);

      if (!onsiteResponse.ok) {
        const error = await onsiteResponse.json();
        throw new Error(error.error || "Failed to fetch on-site analysis");
      }

      const analysisData = await onsiteResponse.json();
      setData(analysisData);

      // GSC data might fail if not connected, that's OK
      let gscKeywords: GSCKeyword[] = [];
      if (gscResponse.ok) {
        const gscData = await gscResponse.json();
        gscKeywords = gscData.keywords || [];
        setGscData(gscKeywords);
      }

      // Create comparison data
      const comparison = createComparisonData(analysisData.keywords, gscKeywords);
      setComparisonData(comparison);

      toast({
        title: "✅ Анализът завърши!",
        description: `Анализирани ${analysisData.total_keywords} on-site keywords и ${gscKeywords.length} GSC keywords`,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Грешка",
        description: error.message || "Неуспешен анализ на съдържанието",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create comparison between GSC and On-Site data
  const createComparisonData = (
    onsiteKeywords: KeywordStats[],
    gscKeywords: GSCKeyword[]
  ): ComparisonData[] => {
    const comparison: ComparisonData[] = [];
    const onsiteMap = new Map(onsiteKeywords.map((k) => [k.keyword.toLowerCase(), k]));

    // For each GSC keyword, check if it exists on-site
    gscKeywords.forEach((gsc) => {
      const onsite = onsiteMap.get(gsc.keyword.toLowerCase());
      const onsiteCount = onsite?.total_count || 0;
      const onsiteArticles = onsite?.article_count || 0;

      let status: "good" | "needs_more" | "missing";
      let recommendation: string;

      if (!onsite || onsiteCount === 0) {
        status = "missing";
        recommendation = `Създай съдържание за "${gsc.keyword}" - ${gsc.total_clicks} clicks в GSC, но липсва на сайта`;
      } else if (onsiteCount < 5 || onsiteArticles < 2) {
        status = "needs_more";
        recommendation = `Оптимизирай повече за "${gsc.keyword}" - има ${gsc.total_clicks} clicks в GSC, но само ${onsiteCount}x на сайта`;
      } else {
        status = "good";
        recommendation = `Добра оптимизация за "${gsc.keyword}"`;
      }

      comparison.push({
        keyword: gsc.keyword,
        gsc_clicks: gsc.total_clicks,
        gsc_impressions: gsc.total_impressions,
        gsc_position: gsc.avg_position,
        onsite_count: onsiteCount,
        onsite_articles: onsiteArticles,
        optimization_status: status,
        recommendation,
      });
    });

    // Sort by GSC clicks (most important keywords first)
    return comparison.sort((a, b) => b.gsc_clicks - a.gsc_clicks);
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchAnalysis();
  }, []);

  // Filter keywords by search term
  const filteredKeywords = data?.keywords.filter((k) =>
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate keyword density (appearances per article)
  const getKeywordDensity = (stats: KeywordStats): number => {
    if (stats.article_count === 0) return 0;
    return stats.total_count / stats.article_count;
  };

  // Determine if keyword is well-optimized
  const getOptimizationLevel = (stats: KeywordStats): {
    level: "high" | "medium" | "low";
    label: string;
  } => {
    const hasTitle = stats.title_count > 0 || stats.meta_title_count > 0;
    const hasHeadings = stats.h1_count > 0 || stats.h2_count > 0;
    const density = getKeywordDensity(stats);

    if (hasTitle && hasHeadings && density >= 3) {
      return { level: "high", label: "Добра оптимизация" };
    } else if (hasTitle || hasHeadings || density >= 2) {
      return { level: "medium", label: "Средна оптимизация" };
    } else {
      return { level: "low", label: "Слаба оптимизация" };
    }
  };

  const optimizationColors = {
    high: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Keyword Analysis & GSC Comparison
              </h3>
              <p className="text-sm text-zinc-400">
                Сравнение между български keywords от GSC и реална on-site употреба
              </p>
            </div>
          </div>
          <Button
            onClick={fetchAnalysis}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Анализиране...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Refresh Analysis
              </>
            )}
          </Button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800">
          <button
            onClick={() => setViewMode("comparison")}
            className={`px-4 py-2 font-medium transition-all relative ${
              viewMode === "comparison"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            GSC ↔ On-Site Сравнение
          </button>
          <button
            onClick={() => setViewMode("gsc")}
            className={`px-4 py-2 font-medium transition-all relative ${
              viewMode === "gsc"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            GSC Keywords ({gscData.length})
          </button>
          <button
            onClick={() => setViewMode("onsite")}
            className={`px-4 py-2 font-medium transition-all relative ${
              viewMode === "onsite"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-zinc-400 hover:text-zinc-300"
            }`}
          >
            On-Site Keywords ({data?.keywords.length || 0})
          </button>
        </div>

        {/* Stats Summary */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {data.total_keywords}
              </div>
              <div className="text-sm text-zinc-400">Открити Keywords</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {data.total_posts}
              </div>
              <div className="text-sm text-zinc-400">Анализирани Статии</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {filteredKeywords.length > 0
                  ? Math.round(
                      filteredKeywords.reduce((sum, k) => sum + k.total_count, 0) /
                        filteredKeywords.length
                    )
                  : 0}
              </div>
              <div className="text-sm text-zinc-400">Avg. Frequency</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Търси keyword..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div className="glass-card p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto text-blue-400 animate-spin mb-4" />
          <p className="text-zinc-400">Анализиране на съдържанието...</p>
          <p className="text-sm text-zinc-500 mt-2">
            Това може да отнеме няколко секунди
          </p>
        </div>
      )}

      {/* COMPARISON VIEW - GSC vs On-Site */}
      {!loading && viewMode === "comparison" && comparisonData.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
            <h4 className="font-semibold text-foreground">
              Български Keywords от GSC vs On-Site Оптимизация
            </h4>
            <p className="text-sm text-zinc-400 mt-1">
              Сравнение между реални search queries и on-site употреба
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead>Keyword (от GSC)</TableHead>
                <TableHead className="text-center">GSC Clicks</TableHead>
                <TableHead className="text-center">GSC Position</TableHead>
                <TableHead className="text-center">On-Site Употреба</TableHead>
                <TableHead className="text-center">Статии</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Препоръка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData
                .filter((c) =>
                  c.keyword.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 100)
                .map((comp) => (
                  <TableRow key={comp.keyword} className="border-zinc-800 hover:bg-zinc-900/30">
                    <TableCell className="font-medium text-foreground">
                      {comp.keyword}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-green-500/20 text-green-400">
                        {comp.gsc_clicks}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          comp.gsc_position <= 3
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            : comp.gsc_position <= 10
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                        }
                      >
                        {comp.gsc_position.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          comp.onsite_count === 0
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : comp.onsite_count < 5
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-green-500/20 text-green-400 border-green-500/30"
                        }
                      >
                        {comp.onsite_count}x
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-zinc-300">
                      {comp.onsite_articles}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          comp.optimization_status === "good"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : comp.optimization_status === "needs_more"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {comp.optimization_status === "good"
                          ? "✓ Добра"
                          : comp.optimization_status === "needs_more"
                            ? "⚠ Нужда от повече"
                            : "✗ Липсва"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300 max-w-xs">
                      {comp.recommendation}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* GSC Keywords Only View */}
      {!loading && viewMode === "gsc" && gscData.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
            <h4 className="font-semibold text-foreground">
              Български Keywords от Google Search Console
            </h4>
            <p className="text-sm text-zinc-400 mt-1">
              Реални search queries от последните 90 дни
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead>Keyword</TableHead>
                <TableHead className="text-center">Clicks</TableHead>
                <TableHead className="text-center">Impressions</TableHead>
                <TableHead className="text-center">CTR</TableHead>
                <TableHead className="text-center">Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gscData
                .filter((k) =>
                  k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 100)
                .map((kw) => (
                  <TableRow key={kw.keyword} className="border-zinc-800 hover:bg-zinc-900/30">
                    <TableCell className="font-medium text-foreground">
                      {kw.keyword}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-green-500/20 text-green-400">
                        {kw.total_clicks}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                        {kw.total_impressions}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-zinc-300">
                      {kw.avg_ctr.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          kw.avg_position <= 3
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            : kw.avg_position <= 10
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                        }
                      >
                        {kw.avg_position.toFixed(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty State */}
      {!loading && viewMode === "onsite" && data && filteredKeywords.length === 0 && (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400">Няма намерени keywords</p>
          <p className="text-sm text-zinc-500 mt-2">
            {searchTerm
              ? 'Опитай с друга дума'
              : 'Публикувай статии за да видиш анализ'}
          </p>
        </div>
      )}

      {/* On-Site Keywords Table */}
      {!loading && viewMode === "onsite" && filteredKeywords.length > 0 && (
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Keyword</TableHead>
                <TableHead className="text-center">Общо</TableHead>
                <TableHead className="text-center">Статии</TableHead>
                <TableHead className="text-center">Title</TableHead>
                <TableHead className="text-center">H1-H3</TableHead>
                <TableHead className="text-center">Съдържание</TableHead>
                <TableHead>Оптимизация</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeywords.map((stats) => {
                const isExpanded = expandedRows.has(stats.keyword);
                const optimization = getOptimizationLevel(stats);
                const density = getKeywordDensity(stats);

                return (
                  <Collapsible key={stats.keyword} open={isExpanded} asChild>
                    <>
                      <TableRow className="border-zinc-800 hover:bg-zinc-900/30">
                        <TableCell>
                          <CollapsibleTrigger
                            onClick={() => toggleRow(stats.keyword)}
                            className="p-1 hover:bg-zinc-800 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            )}
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {stats.keyword}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                            {stats.total_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-zinc-300">
                          {stats.article_count}
                        </TableCell>
                        <TableCell className="text-center text-zinc-300">
                          {stats.title_count + stats.meta_title_count}
                        </TableCell>
                        <TableCell className="text-center text-zinc-300">
                          {stats.h1_count + stats.h2_count + stats.h3_count}
                        </TableCell>
                        <TableCell className="text-center text-zinc-300">
                          {stats.content_count}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={optimizationColors[optimization.level]}
                          >
                            {optimization.label}
                          </Badge>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Details */}
                      <CollapsibleContent asChild>
                        <TableRow className="border-zinc-800 bg-zinc-900/50">
                          <TableCell colSpan={8} className="p-6">
                            <div className="space-y-4">
                              {/* Stats Breakdown */}
                              <div>
                                <h4 className="text-sm font-semibold text-zinc-400 mb-3">
                                  Детайлна статистика
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1">
                                      Avg. Density
                                    </div>
                                    <div className="text-lg font-semibold text-foreground">
                                      {density.toFixed(1)} / статия
                                    </div>
                                  </div>
                                  <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1">Meta Tags</div>
                                    <div className="text-lg font-semibold text-foreground">
                                      {stats.meta_title_count + stats.meta_description_count}
                                    </div>
                                  </div>
                                  <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1">H1 Tags</div>
                                    <div className="text-lg font-semibold text-foreground">
                                      {stats.h1_count}
                                    </div>
                                  </div>
                                  <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1">H2-H3 Tags</div>
                                    <div className="text-lg font-semibold text-foreground">
                                      {stats.h2_count + stats.h3_count}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Articles List */}
                              {stats.articles.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-zinc-400 mb-3">
                                    Появява се в {stats.articles.length} статии
                                  </h4>
                                  <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {stats.articles.map((article) => (
                                      <div
                                        key={article.slug}
                                        className="flex items-center justify-between p-3 bg-zinc-900/80 rounded-lg border border-zinc-800"
                                      >
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-foreground">
                                            {article.title}
                                          </div>
                                          <div className="text-xs text-zinc-500 mt-1">
                                            /learn/{article.slug}
                                          </div>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="bg-purple-500/20 text-purple-400"
                                        >
                                          {article.count}x
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Optimization Tips */}
                              {optimization.level !== "high" && (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                  <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <h5 className="text-sm font-semibold text-yellow-400 mb-2">
                                        Препоръки за оптимизация
                                      </h5>
                                      <ul className="text-sm text-zinc-300 space-y-1">
                                        {stats.title_count === 0 && stats.meta_title_count === 0 && (
                                          <li>• Добави keyword в Title и Meta Title</li>
                                        )}
                                        {stats.h1_count === 0 && (
                                          <li>• Използвай keyword в H1 heading</li>
                                        )}
                                        {stats.h2_count + stats.h3_count < 2 && (
                                          <li>• Добави keyword в поне 2-3 H2/H3 headings</li>
                                        )}
                                        {density < 3 && (
                                          <li>
                                            • Увеличи density - цел: 3-5 пъти на статия
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
