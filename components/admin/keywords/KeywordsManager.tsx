"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface Keyword {
  id: string;
  keyword: string;
  priority: "high" | "medium" | "low";
  category: string | null;
  focus_score: number;
  notes: string | null;
  created_at: string;
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

export function KeywordsManager() {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);

  // New keyword form state
  const [newKeyword, setNewKeyword] = useState({
    keyword: "",
    priority: "medium" as "high" | "medium" | "low",
    category: "",
    focus_score: 0,
    notes: "",
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
                <TableHead className="text-zinc-400 text-center">
                  Focus Score
                </TableHead>
                <TableHead className="text-zinc-400">Notes</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeywords.map((kw) => (
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
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                    >
                      {kw.focus_score}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400 max-w-xs truncate">
                    {kw.notes || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
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
              ))}
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
    </div>
  );
}
