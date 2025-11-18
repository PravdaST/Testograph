"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, LayoutDashboard, FileText, Lightbulb, ChevronDown, ChevronRight, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { LearnContentGuide } from "./LearnContentGuide";
import { LearnContentDashboard } from "./LearnContentDashboard";
import { LearnContentGuidesTable } from "./LearnContentGuidesTable";
import { adminFetch } from "@/lib/admin/api";

type GuideCategory =
  | "testosterone"
  | "potency"
  | "fitness"
  | "nutrition"
  | "supplements"
  | "lifestyle";

interface ClusterSuggestion {
  title: string;
  category: GuideCategory;
  description: string;
  estimated_pillars: number;
  suggested_pillars: string[];
}

export function LearnContentTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<
    "suggest" | "dashboard" | "create-pillar" | "guides"
  >("dashboard");

  // Suggest mode state
  const [keywords, setKeywords] = useState("");
  const [suggestions, setSuggestions] = useState<ClusterSuggestion[]>([]);
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<number>>(
    new Set()
  );
  const [generatingCluster, setGeneratingCluster] = useState<number | null>(
    null
  );

  // Create pillar mode state
  const [pillarTitle, setPillarTitle] = useState("");
  const [parentClusterSlug, setParentClusterSlug] = useState("");
  const [pillarCategory, setPillarCategory] =
    useState<GuideCategory>("testosterone");
  const [pillarKeywords, setPillarKeywords] = useState("");

  // Toggle expand suggestion
  const toggleSuggestion = (index: number) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSuggestions(newExpanded);
  };

  // Generate cluster from suggestion
  const handleGenerateCluster = async (
    suggestion: ClusterSuggestion,
    index: number
  ) => {
    setGeneratingCluster(index);
    try {
      const response = await adminFetch("/api/admin/learn-content/create-cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestion.title,
          category: suggestion.category,
          keywords: "",
        }),
      });

      if (!response.ok) throw new Error("Неуспешно създаване на клъстер");

      const data = await response.json();

      toast({
        title: "✅ Клъстерът е създаден!",
        description: `"${data.guide.title}" е готов с ${data.suggested_pillars?.length || 0} предложения за пилъри`,
      });
    } catch (error: any) {
      console.error("Cluster error:", error);
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно създаване на клъстер",
        variant: "destructive",
      });
    } finally {
      setGeneratingCluster(null);
    }
  };

  // Suggest clusters
  const handleSuggestClusters = async () => {
    setLoading(true);
    try {
      const response = await adminFetch(
        "/api/admin/learn-content/suggest-clusters",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords, count: 10 }),
        },
      );

      if (!response.ok) throw new Error("Неуспешно зареждане на предложения");

      const data = await response.json();
      setSuggestions(data.suggestions);

      toast({
        title: "Успешно!",
        description: `Генерирани ${data.suggestions.length} предложения за клъстери`,
      });
    } catch (error) {
      console.error("Suggestion error:", error);
      toast({
        title: "Грешка",
        description: "Неуспешно генериране на предложения",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create pillar
  const handleCreatePillar = async () => {
    if (!pillarTitle.trim() || !parentClusterSlug.trim()) {
      toast({
        title: "Грешка",
        description: "Моля попълни всички полета",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await adminFetch("/api/admin/learn-content/create-pillar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pillarTitle,
          parent_cluster_slug: parentClusterSlug,
          category: pillarCategory,
          keywords: pillarKeywords,
        }),
      });

      if (!response.ok) throw new Error("Неуспешно създаване на пилър");

      const data = await response.json();

      toast({
        title: "✅ Пилърът е създаден!",
        description: `"${data.guide.title}" е готов`,
      });

      // Reset
      setPillarTitle("");
      setParentClusterSlug("");
      setPillarKeywords("");
    } catch (error: any) {
      console.error("Pillar error:", error);
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно създаване на пилър",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <LearnContentGuide />

      {/* Tab Navigation */}
      <div className="border-b border-zinc-800">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setMode("suggest")}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap hover:text-gray-900 ${
              mode === "suggest"
                ? "text-gray-900 border-b-2 border-accent-500"
                : "text-gray-600 border-b-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>AI Cluster Ideas</span>
            </div>
          </button>

          <button
            onClick={() => setMode("dashboard")}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap hover:text-gray-900 ${
              mode === "dashboard"
                ? "text-gray-900 border-b-2 border-accent-500"
                : "text-gray-600 border-b-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => setMode("create-pillar")}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap hover:text-gray-900 ${
              mode === "create-pillar"
                ? "text-gray-900 border-b-2 border-accent-500"
                : "text-gray-600 border-b-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Create Pillar</span>
            </div>
          </button>

          <button
            onClick={() => setMode("guides")}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap hover:text-gray-900 ${
              mode === "guides"
                ? "text-gray-900 border-b-2 border-accent-500"
                : "text-gray-600 border-b-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4" />
              <span>Guides</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-200">
        {/* Suggest Mode */}
        {mode === "suggest" && (
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-zinc-50">
                    AI Cluster Suggestions
                  </h2>
                </div>
                <p className="text-sm text-zinc-400">
                  Анализирай сайта и получи AI предложения за нови cluster теми
                </p>
              </div>
              <Button
                onClick={handleSuggestClusters}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Генериране...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Генерирай Предложения
                  </>
                )}
              </Button>
            </div>

            {/* Empty State */}
            {suggestions.length === 0 && !loading && (
              <div className="glass-card p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                <p className="text-zinc-400">
                  Кликни "Генерирай Предложения" за AI анализ
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  AI ще анализира твоя сайт и ще предложи 8-10 нови cluster теми
                </p>
              </div>
            )}

            {/* Suggestions List */}
            {suggestions.length > 0 && (
              <div className="space-y-3 mt-6">
                <h4 className="text-lg font-semibold text-foreground">
                  Предложени клъстери:
                </h4>
                {suggestions.map((suggestion, idx) => {
                  const isExpanded = expandedSuggestions.has(idx);
                  const isGenerating = generatingCluster === idx;

                  return (
                    <div
                      key={idx}
                      className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900/30"
                    >
                      {/* Suggestion Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <button
                            onClick={() => toggleSuggestion(idx)}
                            className="flex items-start gap-2 flex-1 text-left group"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <h5 className="font-semibold text-foreground group-hover:text-accent-500 transition-colors">
                                {suggestion.title}
                              </h5>
                              <p className="text-sm text-zinc-400 mt-1">
                                {suggestion.description}
                              </p>
                            </div>
                          </button>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge variant="secondary">{suggestion.category}</Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-zinc-500">
                            ~{suggestion.estimated_pillars} пилъра
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleGenerateCluster(suggestion, idx)}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-green-600 to-emerald-600"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Генериране...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                Генерирай Cluster
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Pillars List */}
                      {isExpanded && suggestion.suggested_pillars && (
                        <div className="border-t border-zinc-700 bg-zinc-900/50 p-4">
                          <div className="text-sm font-semibold text-zinc-400 mb-2">
                            Предложени Pillars:
                          </div>
                          <div className="space-y-1">
                            {suggestion.suggested_pillars.map((pillar, pIdx) => (
                              <div
                                key={pIdx}
                                className="flex items-center gap-2 p-2 rounded bg-zinc-800/50 text-sm text-zinc-300"
                              >
                                <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <span>{pillar}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Dashboard Mode */}
        {mode === "dashboard" && <LearnContentDashboard />}

        {/* Create Pillar Mode */}
        {mode === "create-pillar" && (
          <div className="glass-card p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Създай пилър ръководство
              </h3>
              <p className="text-sm text-zinc-400">
                Задълбочена статия от 5500 думи с AI (15-20 сек)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pillar-title">Заглавие</Label>
              <Input
                id="pillar-title"
                value={pillarTitle}
                onChange={(e) => setPillarTitle(e.target.value)}
                placeholder="напр. Как да повишиш тестостерона естествено"
                className="bg-zinc-900/50 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent-slug">Slug на родителски клъстер</Label>
              <Input
                id="parent-slug"
                value={parentClusterSlug}
                onChange={(e) => setParentClusterSlug(e.target.value)}
                placeholder="напр. testosteron-polno-rakovodstvo"
                className="bg-zinc-900/50 border-zinc-700"
              />
              <p className="text-xs text-foreground0">
                Намери slug на родителския клъстер в Supabase, таблица
                blog_posts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pillar-category">Категория</Label>
              <Select
                value={pillarCategory}
                onValueChange={(v) => setPillarCategory(v as GuideCategory)}
              >
                <SelectTrigger className="bg-zinc-900/50 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testosterone">🧬 Тестостерон</SelectItem>
                  <SelectItem value="potency">💪 Потенция</SelectItem>
                  <SelectItem value="fitness">🏋️ Фитнес</SelectItem>
                  <SelectItem value="nutrition">🥗 Хранене</SelectItem>
                  <SelectItem value="supplements">💊 Добавки</SelectItem>
                  <SelectItem value="lifestyle">🌿 Лайфстайл</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pillar-keywords">Ключови думи (по избор)</Label>
              <Textarea
                id="pillar-keywords"
                value={pillarKeywords}
                onChange={(e) => setPillarKeywords(e.target.value)}
                placeholder="естествено повишаване, храни, упражнения..."
                className="bg-zinc-900/50 border-zinc-700"
              />
            </div>

            <Button
              onClick={handleCreatePillar}
              disabled={loading || !pillarTitle || !parentClusterSlug}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генериране... (~20 sec)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Генерирай пилър
                </>
              )}
            </Button>
          </div>
        )}

        {/* Guides Mode */}
        {mode === "guides" && <LearnContentGuidesTable />}
      </div>
    </div>
  );
}
