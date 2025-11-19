"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin/api";
import {
  Plus,
  Loader2,
  Target,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Wand2,
} from "lucide-react";

interface Keyword {
  id: string;
  keyword: string;
  priority: "high" | "medium" | "low";
  category: string | null;
  focus_score: number;
  notes: string | null;
  target_url: string | null;
  created_at: string;
  // Content integration fields
  assigned_content_id: string | null;
  content_status: "not_started" | "planned" | "in_progress" | "published";
  content_brief: string | null;
  target_word_count: number | null;
  content_angle: string | null;
}

interface SEOAnalysis {
  id: string;
  keyword_id: string;
  target_url: string;
  has_h1: boolean;
  h1_matches: string[];
  has_meta_title: boolean;
  meta_title: string | null;
  meta_title_match: boolean;
  has_meta_description: boolean;
  meta_description: string | null;
  meta_description_match: boolean;
  keyword_density: number;
  word_count: number;
  keyword_count: number;
  seo_score: number;
  recommendations: Array<{
    type: string;
    message: string;
    priority: "high" | "medium" | "low";
  }>;
  status: string;
  analyzed_at: string;
}

const priorityColors = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const priorityLabels = {
  high: "🔥 High",
  medium: "⚡ Medium",
  low: "📌 Low",
};

const contentStatusColors = {
  not_started: "bg-zinc-700/50 text-zinc-400 border-zinc-600",
  planned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  published: "bg-green-500/20 text-green-400 border-green-500/30",
};

const contentStatusLabels = {
  not_started: "No Content",
  planned: "Planned",
  in_progress: "In Progress",
  published: "Published",
};

const getSEOScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (score >= 60) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (score >= 40) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
};

export function KeywordsManager() {
  const { toast } = useToast();
  const router = useRouter();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);

  // SEO Analysis state
  const [seoAnalyses, setSeoAnalyses] = useState<Record<string, SEOAnalysis>>({});
  const [analyzingKeywords, setAnalyzingKeywords] = useState<Set<string>>(new Set());
  const [selectedAnalysis, setSelectedAnalysis] = useState<SEOAnalysis | null>(null);
  const [isSEODialogOpen, setIsSEODialogOpen] = useState(false);

  // Auto-Match Content state
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);

  // New keyword form state
  const [newKeyword, setNewKeyword] = useState({
    keyword: "",
    priority: "medium" as "high" | "medium" | "low",
    category: "",
    focus_score: 0,
    notes: "",
    target_url: "",
  });

  // Fetch keywords
  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);

      const response = await adminFetch(
        `/api/admin/keywords?${params.toString()}`
      );

      if (!response.ok) throw new Error("Failed to fetch keywords");

      const data = await response.json();
      setKeywords(data.keywords || []);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на keywords",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Analyze SEO for a keyword
  const handleAnalyzeSEO = async (keywordId: string, keyword: string) => {
    const kw = keywords.find(k => k.id === keywordId);

    if (!kw?.target_url) {
      toast({
        title: "Липсва Target URL",
        description: "Добави target URL преди да анализираш SEO",
        variant: "destructive",
      });
      return;
    }

    setAnalyzingKeywords(prev => new Set(prev).add(keywordId));

    try {
      const response = await adminFetch("/api/admin/keywords/analyze-onpage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword_id: keywordId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to analyze SEO");
      }

      const data = await response.json();

      toast({
        title: "✅ Анализ завършен!",
        description: `SEO Score: ${data.analysis.seo_score}/100`,
      });

      // Fetch the full analysis from database
      await fetchSEOAnalysis(keywordId);

    } catch (error: any) {
      console.error("SEO Analysis error:", error);
      toast({
        title: "Грешка при анализ",
        description: error.message || "Неуспешен SEO анализ",
        variant: "destructive",
      });
    } finally {
      setAnalyzingKeywords(prev => {
        const newSet = new Set(prev);
        newSet.delete(keywordId);
        return newSet;
      });
    }
  };

  // Fetch SEO analysis for a keyword
  const fetchSEOAnalysis = async (keywordId: string) => {
    try {
      const response = await adminFetch(
        `/api/admin/keywords/analyze-onpage?keyword_id=${keywordId}`
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data.analysis) {
        setSeoAnalyses(prev => ({
          ...prev,
          [keywordId]: data.analysis
        }));
      }
    } catch (error) {
      console.error("Failed to fetch SEO analysis:", error);
    }
  };

  // Fetch all SEO analyses for current keywords
  const fetchAllSEOAnalyses = async () => {
    for (const kw of keywords) {
      if (kw.target_url) {
        await fetchSEOAnalysis(kw.id);
      }
    }
  };

  // View SEO analysis details
  const viewSEOAnalysis = (keywordId: string) => {
    const analysis = seoAnalyses[keywordId];
    if (analysis) {
      setSelectedAnalysis(analysis);
      setIsSEODialogOpen(true);
    }
  };

  // Auto-match keywords to existing content
  const handleAutoMatch = async (autoApply: boolean = false) => {
    setIsAutoMatching(true);
    setMatchResults([]);

    try {
      const response = await adminFetch("/api/admin/keywords/auto-match-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_apply: autoApply }),
      });

      if (!response.ok) throw new Error("Failed to auto-match content");

      const data = await response.json();

      if (data.matches && data.matches.length > 0) {
        setMatchResults(data.matches);
        setIsMatchDialogOpen(true);

        if (autoApply) {
          toast({
            title: "Успешно! ✅",
            description: `Match-нах ${data.applied_count} keywords към съдържание`,
          });
          // Refresh keywords to show updated status
          fetchKeywords();
        } else {
          toast({
            title: "Намерени matches",
            description: `AI намери ${data.matches.length} възможни съвпадения`,
          });
        }
      } else {
        toast({
          title: "Няма matches",
          description: "AI не намери keywords за match-ване",
        });
      }
    } catch (error: any) {
      console.error("Auto-match error:", error);
      toast({
        title: "Грешка",
        description: error.message || "Не успях да match-на keywords",
        variant: "destructive",
      });
    } finally {
      setIsAutoMatching(false);
    }
  };

  // Create keyword
  const handleCreateKeyword = async () => {
    if (!newKeyword.keyword.trim()) {
      toast({
        title: "Грешка",
        description: "Моля въведи keyword",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await adminFetch("/api/admin/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: newKeyword.keyword.trim(),
          priority: newKeyword.priority,
          category: newKeyword.category || null,
          focus_score: newKeyword.focus_score,
          notes: newKeyword.notes || null,
          target_url: newKeyword.target_url || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create keyword");
      }

      toast({
        title: "✅ Успешно!",
        description: "Keyword е създаден",
      });

      // Reset form
      setNewKeyword({
        keyword: "",
        priority: "medium",
        category: "",
        focus_score: 0,
        notes: "",
        target_url: "",
      });
      setIsAddDialogOpen(false);

      // Refresh list
      fetchKeywords();
    } catch (error: any) {
      console.error("Create error:", error);
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно създаване на keyword",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update keyword
  const handleUpdateKeyword = async () => {
    if (!editingKeyword) return;

    setLoading(true);
    try {
      const response = await adminFetch(
        `/api/admin/keywords/${editingKeyword.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword: editingKeyword.keyword,
            priority: editingKeyword.priority,
            category: editingKeyword.category,
            focus_score: editingKeyword.focus_score,
            notes: editingKeyword.notes,
            target_url: editingKeyword.target_url,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update keyword");
      }

      toast({
        title: "✅ Успешно!",
        description: "Keyword е актуализиран",
      });

      setIsEditDialogOpen(false);
      setEditingKeyword(null);
      fetchKeywords();
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно актуализиране на keyword",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete keyword
  const handleDeleteKeyword = async (id: string, keyword: string) => {
    if (!confirm(`Сигурен ли си, че искаш да изтриеш "${keyword}"?`)) return;

    setLoading(true);
    try {
      const response = await adminFetch(`/api/admin/keywords/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete keyword");

      toast({
        title: "✅ Успешно!",
        description: "Keyword е изтрит",
      });

      fetchKeywords();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Грешка",
        description: "Неуспешно изтриване на keyword",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter keywords
  const filteredKeywords = keywords.filter((kw) => {
    if (searchQuery && !kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Load on mount
  useEffect(() => {
    fetchKeywords();
  }, [priorityFilter, categoryFilter]);

  // Fetch SEO analyses after keywords load
  useEffect(() => {
    if (keywords.length > 0) {
      fetchAllSEOAnalyses();
    }
  }, [keywords.length]);

  // Get unique categories
  const categories = Array.from(
    new Set(keywords.map((kw) => kw.category).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Target Keywords
              </h3>
              <p className="text-sm text-zinc-400">
                {filteredKeywords.length} от {keywords.length} keywords
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchKeywords}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAutoMatch(false)}
              disabled={isAutoMatching}
              className="bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              title="AI Auto-Match keywords към съществуващо съдържание"
            >
              {isAutoMatching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              {isAutoMatching ? "Matching..." : "Auto-Match"}
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Добави Keyword
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Добави нов target keyword</DialogTitle>
                  <DialogDescription>
                    Създай нов keyword за SEO фокус
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-keyword">Keyword</Label>
                    <Input
                      id="new-keyword"
                      value={newKeyword.keyword}
                      onChange={(e) =>
                        setNewKeyword({ ...newKeyword, keyword: e.target.value })
                      }
                      placeholder="напр. как да увелича тестостерона"
                      className="bg-zinc-900/50 border-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-priority">Priority</Label>
                    <Select
                      value={newKeyword.priority}
                      onValueChange={(v: any) =>
                        setNewKeyword({ ...newKeyword, priority: v })
                      }
                    >
                      <SelectTrigger className="bg-zinc-900/50 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🔥 High</SelectItem>
                        <SelectItem value="medium">⚡ Medium</SelectItem>
                        <SelectItem value="low">📌 Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-category">Категория (optional)</Label>
                    <Input
                      id="new-category"
                      value={newKeyword.category}
                      onChange={(e) =>
                        setNewKeyword({ ...newKeyword, category: e.target.value })
                      }
                      placeholder="напр. testosterone, fitness"
                      className="bg-zinc-900/50 border-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-target-url">Target Page URL (optional)</Label>
                    <Input
                      id="new-target-url"
                      value={newKeyword.target_url}
                      onChange={(e) =>
                        setNewKeyword({ ...newKeyword, target_url: e.target.value })
                      }
                      placeholder="напр. /learn/testosterone-boost или https://testograph.eu/app"
                      className="bg-zinc-900/50 border-zinc-700"
                    />
                    <p className="text-xs text-zinc-500">
                      Конкретната страница която този keyword трябва да target-ва
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-score">Focus Score (0-100)</Label>
                    <Input
                      id="new-score"
                      type="number"
                      min="0"
                      max="100"
                      value={newKeyword.focus_score}
                      onChange={(e) =>
                        setNewKeyword({
                          ...newKeyword,
                          focus_score: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-zinc-900/50 border-zinc-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-notes">Notes (optional)</Label>
                    <Textarea
                      id="new-notes"
                      value={newKeyword.notes}
                      onChange={(e) =>
                        setNewKeyword({ ...newKeyword, notes: e.target.value })
                      }
                      placeholder="Бележки за keyword стратегия..."
                      className="bg-zinc-900/50 border-zinc-700"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleCreateKeyword}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Създаване...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Създай Keyword
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Търси keywords..."
                className="pl-10 bg-zinc-900/50 border-zinc-700"
              />
            </div>
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px] bg-zinc-900/50 border-zinc-700">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички</SelectItem>
              <SelectItem value="high">🔥 High</SelectItem>
              <SelectItem value="medium">⚡ Medium</SelectItem>
              <SelectItem value="low">📌 Low</SelectItem>
            </SelectContent>
          </Select>

          {categories.length > 0 && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] bg-zinc-900/50 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички категории</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat!}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Keywords Table */}
      <div className="glass-card overflow-hidden">
        {loading && keywords.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-400" />
            <p className="text-zinc-400 mt-4">Зареждане...</p>
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400">Няма намерени keywords</p>
            <p className="text-sm text-zinc-500 mt-2">
              Добави нов keyword за да започнеш
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Keyword</TableHead>
                <TableHead className="text-zinc-400">Priority</TableHead>
                <TableHead className="text-zinc-400">Category</TableHead>
                <TableHead className="text-zinc-400">Target Page</TableHead>
                <TableHead className="text-zinc-400 text-center">
                  SEO Score
                </TableHead>
                <TableHead className="text-zinc-400 text-center">
                  Focus Score
                </TableHead>
                <TableHead className="text-zinc-400 text-center">
                  Content Status
                </TableHead>
                <TableHead className="text-zinc-400">Notes</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeywords.map((kw) => {
                const analysis = seoAnalyses[kw.id];
                const isAnalyzing = analyzingKeywords.has(kw.id);

                return (
                  <TableRow key={kw.id} className="border-zinc-800">
                    <TableCell className="font-medium text-foreground">
                      {kw.keyword}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={priorityColors[kw.priority]}
                      >
                        {priorityLabels[kw.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {kw.category || "-"}
                    </TableCell>
                    <TableCell className="text-zinc-400 max-w-xs truncate">
                      {kw.target_url ? (
                        <a
                          href={kw.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {kw.target_url}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {analysis ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewSEOAnalysis(kw.id)}
                          className="p-0 h-auto"
                        >
                          <Badge
                            variant="outline"
                            className={getSEOScoreColor(analysis.seo_score)}
                          >
                            {analysis.seo_score}/100
                          </Badge>
                        </Button>
                      ) : kw.target_url ? (
                        <Badge
                          variant="outline"
                          className="bg-zinc-800 text-zinc-500 border-zinc-700"
                        >
                          -
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-zinc-800 text-zinc-600 border-zinc-700"
                        >
                          No URL
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                      >
                        {kw.focus_score}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={contentStatusColors[kw.content_status]}
                      >
                        {contentStatusLabels[kw.content_status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 max-w-xs truncate">
                      {kw.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {kw.target_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAnalyzeSEO(kw.id, kw.keyword)}
                            disabled={isAnalyzing}
                            title="Analyze SEO"
                          >
                            {isAnalyzing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ScanLine className="w-4 h-4 text-purple-400" />
                            )}
                          </Button>
                        )}
                        {kw.content_status === "not_started" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              router.push(`/admin/learn-content?keyword_id=${kw.id}&keyword=${encodeURIComponent(kw.keyword)}`);
                            }}
                            title="Create Content for this keyword"
                            className="text-green-400 hover:text-green-300"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingKeyword(kw);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKeyword(kw.id, kw.keyword)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактирай keyword</DialogTitle>
            <DialogDescription>Промени данните на keyword</DialogDescription>
          </DialogHeader>

          {editingKeyword && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-keyword">Keyword</Label>
                <Input
                  id="edit-keyword"
                  value={editingKeyword.keyword}
                  onChange={(e) =>
                    setEditingKeyword({ ...editingKeyword, keyword: e.target.value })
                  }
                  className="bg-zinc-900/50 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={editingKeyword.priority}
                  onValueChange={(v: any) =>
                    setEditingKeyword({ ...editingKeyword, priority: v })
                  }
                >
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔥 High</SelectItem>
                    <SelectItem value="medium">⚡ Medium</SelectItem>
                    <SelectItem value="low">📌 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Категория</Label>
                <Input
                  id="edit-category"
                  value={editingKeyword.category || ""}
                  onChange={(e) =>
                    setEditingKeyword({
                      ...editingKeyword,
                      category: e.target.value,
                    })
                  }
                  className="bg-zinc-900/50 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-target-url">Target Page URL</Label>
                <Input
                  id="edit-target-url"
                  value={editingKeyword.target_url || ""}
                  onChange={(e) =>
                    setEditingKeyword({
                      ...editingKeyword,
                      target_url: e.target.value,
                    })
                  }
                  placeholder="напр. /learn/testosterone-boost"
                  className="bg-zinc-900/50 border-zinc-700"
                />
                <p className="text-xs text-zinc-500">
                  Конкретната страница която този keyword трябва да target-ва
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-score">Focus Score</Label>
                <Input
                  id="edit-score"
                  type="number"
                  min="0"
                  max="100"
                  value={editingKeyword.focus_score}
                  onChange={(e) =>
                    setEditingKeyword({
                      ...editingKeyword,
                      focus_score: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-900/50 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingKeyword.notes || ""}
                  onChange={(e) =>
                    setEditingKeyword({ ...editingKeyword, notes: e.target.value })
                  }
                  className="bg-zinc-900/50 border-zinc-700"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleUpdateKeyword}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Запазване...
                  </>
                ) : (
                  "Запази промените"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SEO Analysis Dialog */}
      <Dialog open={isSEODialogOpen} onOpenChange={setIsSEODialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>On-Page SEO Анализ</DialogTitle>
            <DialogDescription>
              Детайлен SEO анализ за keyword и target page
            </DialogDescription>
          </DialogHeader>

          {selectedAnalysis && (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="flex items-center justify-between p-4 glass-card">
                <div>
                  <p className="text-sm text-zinc-400">SEO Score</p>
                  <p className="text-3xl font-bold text-foreground">
                    {selectedAnalysis.seo_score}/100
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-lg px-4 py-2 ${getSEOScoreColor(selectedAnalysis.seo_score)}`}
                >
                  {selectedAnalysis.seo_score >= 80 ? "Отлично" :
                   selectedAnalysis.seo_score >= 60 ? "Добро" :
                   selectedAnalysis.seo_score >= 40 ? "Средно" : "Нужди от подобрение"}
                </Badge>
              </div>

              {/* Target URL */}
              <div className="space-y-2">
                <Label>Target URL</Label>
                <a
                  href={selectedAnalysis.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline block truncate"
                >
                  {selectedAnalysis.target_url}
                </a>
              </div>

              {/* SEO Factors */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">SEO Фактори</h4>

                {/* H1 */}
                <div className="flex items-start gap-3 p-3 glass-card">
                  {selectedAnalysis.has_h1 && selectedAnalysis.h1_matches.length > 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">H1 Tag</p>
                    {selectedAnalysis.h1_matches.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {selectedAnalysis.h1_matches.map((h1, i) => (
                          <p key={i} className="text-sm text-zinc-400 bg-zinc-900/50 p-2 rounded">
                            "{h1}"
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">
                        {selectedAnalysis.has_h1 ? "H1 не съдържа keyword-а" : "Липсва H1 tag"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta Title */}
                <div className="flex items-start gap-3 p-3 glass-card">
                  {selectedAnalysis.meta_title_match ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Meta Title</p>
                    {selectedAnalysis.meta_title ? (
                      <p className="text-sm text-zinc-400 mt-2 bg-zinc-900/50 p-2 rounded">
                        "{selectedAnalysis.meta_title}"
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-400">Липсва meta title</p>
                    )}
                  </div>
                </div>

                {/* Meta Description */}
                <div className="flex items-start gap-3 p-3 glass-card">
                  {selectedAnalysis.meta_description_match ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Meta Description</p>
                    {selectedAnalysis.meta_description ? (
                      <p className="text-sm text-zinc-400 mt-2 bg-zinc-900/50 p-2 rounded">
                        "{selectedAnalysis.meta_description}"
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-400">Липсва meta description</p>
                    )}
                  </div>
                </div>

                {/* Keyword Density */}
                <div className="flex items-start gap-3 p-3 glass-card">
                  {selectedAnalysis.keyword_density >= 0.5 && selectedAnalysis.keyword_density <= 2.5 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Keyword Density</p>
                    <div className="mt-2 space-y-1 text-sm text-zinc-400">
                      <p>Density: <span className="text-foreground font-medium">{selectedAnalysis.keyword_density.toFixed(2)}%</span></p>
                      <p>Keyword срещания: {selectedAnalysis.keyword_count}</p>
                      <p>Общ брой думи: {selectedAnalysis.word_count}</p>
                      <p className="text-xs text-zinc-500 mt-2">Оптимален range: 1-2%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {selectedAnalysis.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Препоръки</h4>
                  <div className="space-y-2">
                    {selectedAnalysis.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${
                          rec.priority === "high"
                            ? "bg-red-500/10 border-red-500/30"
                            : rec.priority === "medium"
                            ? "bg-yellow-500/10 border-yellow-500/30"
                            : "bg-blue-500/10 border-blue-500/30"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Badge
                            variant="outline"
                            className={
                              rec.priority === "high"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : rec.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            }
                          >
                            {rec.priority === "high" ? "Висок" : rec.priority === "medium" ? "Среден" : "Нисък"}
                          </Badge>
                          <p className="text-sm text-zinc-300 flex-1">{rec.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Date */}
              <div className="text-xs text-zinc-500 text-center pt-4 border-t border-zinc-800">
                Анализ извършен: {new Date(selectedAnalysis.analyzed_at).toLocaleString('bg-BG')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auto-Match Results Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              AI Auto-Match Резултати
            </DialogTitle>
            <DialogDescription>
              {matchResults.length > 0
                ? `AI намери ${matchResults.length} keyword${matchResults.length > 1 ? 's' : ''} които пасват на съществуващо съдържание`
                : 'Няма намерени matches'}
            </DialogDescription>
          </DialogHeader>

          {matchResults.length > 0 && (
            <div className="space-y-4">
              {/* Match Results List */}
              <div className="space-y-3">
                {matchResults.map((match, index) => (
                  <div
                    key={index}
                    className="p-4 glass-card space-y-3 border border-purple-500/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Keyword */}
                        <div>
                          <div className="text-xs text-zinc-500 mb-1">Keyword:</div>
                          <div className="font-medium text-blue-400">
                            {match.keyword_text}
                          </div>
                        </div>

                        {/* Matched Content */}
                        <div>
                          <div className="text-xs text-zinc-500 mb-1">Match-нат към:</div>
                          <div className="font-medium text-green-400">
                            {match.content_title}
                          </div>
                        </div>

                        {/* Reason */}
                        <div>
                          <div className="text-xs text-zinc-500 mb-1">Защо този match:</div>
                          <div className="text-sm text-zinc-300">
                            {match.reason}
                          </div>
                        </div>
                      </div>

                      {/* Confidence Score */}
                      <div className="flex flex-col items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            match.confidence >= 0.9
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : match.confidence >= 0.8
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }
                        >
                          {(match.confidence * 100).toFixed(0)}%
                        </Badge>
                        <div className="text-xs text-zinc-500">confidence</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  variant="outline"
                  onClick={() => setIsMatchDialogOpen(false)}
                >
                  Затвори
                </Button>
                <Button
                  onClick={() => {
                    handleAutoMatch(true);
                    setIsMatchDialogOpen(false);
                  }}
                  disabled={isAutoMatching}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {isAutoMatching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Прилагане...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Приложи всички matches
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
