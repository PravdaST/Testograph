"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin/api";
import {
  Sparkles,
  Loader2,
  Target,
  TrendingUp,
  Brain,
  CheckCircle2,
  Info,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface KeywordSuggestion {
  keyword: string;
  category: string;
  priority: "high" | "medium" | "low";
  estimated_volume: "high" | "medium" | "low";
  difficulty: "easy" | "medium" | "hard";
  reason: string;
  content_gap: string;
  related_to: string[];
}

interface Insights {
  main_gaps: string[];
  opportunities: string[];
  recommendations: string[];
}

const priorityColors = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const volumeColors = {
  high: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  low: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const difficultyColors = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function AIKeywordSuggestions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [focusArea, setFocusArea] = useState("");
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [context, setContext] = useState<any>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Toggle card expansion
  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  // Generate AI suggestions
  const handleGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await adminFetch("/api/admin/keywords/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focus_area: focusArea || undefined,
          count: 10,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setInsights(data.insights || null);
      setContext(data.context || null);

      toast({
        title: "✨ AI анализът завърши!",
        description: `Генерирани ${data.suggestions?.length || 0} keyword suggestions`,
      });
    } catch (error: any) {
      console.error("Suggestions error:", error);
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно генериране на suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add keyword to target keywords
  const handleAddKeyword = async (suggestion: KeywordSuggestion) => {
    setAdding(suggestion.keyword);
    try {
      const response = await adminFetch("/api/admin/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: suggestion.keyword,
          priority: suggestion.priority,
          category: suggestion.category,
          focus_score: suggestion.priority === "high" ? 80 : suggestion.priority === "medium" ? 50 : 30,
          notes: `AI suggestion: ${suggestion.reason}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add keyword");
      }

      toast({
        title: "✅ Добавен!",
        description: `"${suggestion.keyword}" е добавен към target keywords`,
      });

      // Remove from suggestions
      setSuggestions(suggestions.filter((s) => s.keyword !== suggestion.keyword));
    } catch (error: any) {
      console.error("Add keyword error:", error);
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно добавяне на keyword",
        variant: "destructive",
      });
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Generator Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                AI Keyword Suggestions
              </h3>
              <p className="text-sm text-zinc-400">
                AI анализ на съдържание и GSC данни за нови keyword идеи
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="focus-area">Focus Area (optional)</Label>
            <Input
              id="focus-area"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="напр. testosterone boosters, libido improvement, fitness..."
              className="bg-zinc-900/50 border-zinc-700"
            />
            <p className="text-xs text-zinc-500">
              Остави празно за общ анализ или уточни конкретна тема
            </p>
          </div>

          <Button
            onClick={handleGenerateSuggestions}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI анализира... (~10 секунди)
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Генерирай AI Suggestions
              </>
            )}
          </Button>
        </div>

        {/* Context Info */}
        {context && (
          <div className="mt-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Info className="w-4 h-4" />
              <span>
                Анализирани: {context.analyzed_keywords} target keywords,{" "}
                {context.analyzed_posts} статии
                {context.gsc_data_available && ", GSC performance данни"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Insights Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Target className="w-4 h-4 text-red-400" />
                Content Gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-zinc-300">
                {insights.main_gaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-zinc-300">
                {insights.opportunities.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-zinc-300">
                {insights.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !loading && (
        <div className="glass-card p-12 text-center">
          <Brain className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400">Няма генерирани suggestions</p>
          <p className="text-sm text-zinc-500 mt-2">
            Кликни "Генерирай AI Suggestions" за AI анализ
          </p>
        </div>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Keyword Suggestions ({suggestions.length})
          </h4>

          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => {
              const isExpanded = expandedCards.has(idx);

              return (
                <Collapsible key={idx} open={isExpanded}>
                  <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
                    {/* Card Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <CollapsibleTrigger
                          onClick={() => toggleCard(idx)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-start gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <h5 className="font-semibold text-foreground mb-2">
                                {suggestion.keyword}
                              </h5>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={priorityColors[suggestion.priority]}
                                >
                                  Priority: {suggestion.priority}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={volumeColors[suggestion.estimated_volume]}
                                >
                                  Volume: {suggestion.estimated_volume}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={difficultyColors[suggestion.difficulty]}
                                >
                                  Difficulty: {suggestion.difficulty}
                                </Badge>
                                <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                                  {suggestion.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <Button
                          size="sm"
                          onClick={() => handleAddKeyword(suggestion)}
                          disabled={adding === suggestion.keyword}
                          className="bg-gradient-to-r from-green-600 to-emerald-600"
                        >
                          {adding === suggestion.keyword ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Добавяне...
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Добави
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <CollapsibleContent>
                      <div className="border-t border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
                        <div>
                          <h6 className="text-sm font-semibold text-zinc-400 mb-1">
                            Защо този keyword?
                          </h6>
                          <p className="text-sm text-zinc-300">{suggestion.reason}</p>
                        </div>

                        <div>
                          <h6 className="text-sm font-semibold text-zinc-400 mb-1">
                            Content Gap
                          </h6>
                          <p className="text-sm text-zinc-300">
                            {suggestion.content_gap}
                          </p>
                        </div>

                        {suggestion.related_to.length > 0 && (
                          <div>
                            <h6 className="text-sm font-semibold text-zinc-400 mb-2">
                              Свързани теми
                            </h6>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.related_to.map((related, rIdx) => (
                                <Badge
                                  key={rIdx}
                                  variant="outline"
                                  className="bg-zinc-800/50 text-zinc-400"
                                >
                                  {related}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
