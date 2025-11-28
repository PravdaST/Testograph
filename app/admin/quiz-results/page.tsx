"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { SearchBar } from "@/components/admin/SearchBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ClipboardCheck,
  Download,
  RefreshCw,
  Loader2,
  Activity,
  Filter,
  X,
  Zap,
  Heart,
  Dumbbell,
} from "lucide-react";

interface QuizResult {
  id: string;
  session_id: string;
  email: string;
  first_name: string;
  category: 'energy' | 'libido' | 'muscle';
  total_score: number;
  determined_level: 'beginner' | 'intermediate' | 'advanced';
  breakdown_symptoms: number;
  breakdown_nutrition: number;
  breakdown_training: number;
  breakdown_sleep_recovery: number;
  breakdown_context: number;
  breakdown_overall: number;
  workout_location: 'home' | 'gym';
  profile_picture_url: string;
  goal: string;
  created_at: string;
  completed_at: string;
  program_end_date: string;
}

interface Stats {
  total: number;
  avgScore: number;
  byCategory: {
    energy: number;
    libido: number;
    muscle: number;
  };
  byLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export default function QuizResultsPage() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(50);

  // Detail modal
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchQuizResults();
  }, [currentPage, searchQuery, categoryFilter, levelFilter, dateFrom, dateTo]);

  const fetchQuizResults = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (currentPage * limit).toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (levelFilter !== "all") params.append("level", levelFilter);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await fetch(`/api/admin/quiz-results?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
        setStats(data.stats);
        setTotalCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = [
      "Дата",
      "Име",
      "Email",
      "Категория",
      "Score",
      "Ниво",
      "Симптоми",
      "Хранене",
      "Тренировки",
      "Сън",
      "Контекст",
      "Общо",
      "Локация",
      "Цел",
    ];

    const rows = results.map((r) => [
      new Date(r.created_at).toLocaleDateString("bg-BG"),
      r.first_name || "",
      r.email || "",
      r.category || "",
      r.total_score || "",
      r.determined_level || "",
      r.breakdown_symptoms || "",
      r.breakdown_nutrition || "",
      r.breakdown_training || "",
      r.breakdown_sleep_recovery || "",
      r.breakdown_context || "",
      r.breakdown_overall || "",
      r.workout_location || "",
      r.goal || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `quiz-results-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setLevelFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(0);
  };

  const hasActiveFilters =
    searchQuery || categoryFilter !== "all" || levelFilter !== "all" || dateFrom || dateTo;

  const getCategoryBadge = (category: string) => {
    if (category === "energy") return { color: "bg-yellow-500 text-white", icon: Zap, label: "Енергия" };
    if (category === "libido") return { color: "bg-pink-500 text-white", icon: Heart, label: "Либидо" };
    if (category === "muscle") return { color: "bg-blue-500 text-white", icon: Dumbbell, label: "Мускули" };
    return { color: "bg-gray-500 text-white", icon: Activity, label: category };
  };

  const getLevelBadge = (level: string) => {
    if (level === "beginner") return { color: "bg-green-500 text-white", label: "Начинаещ" };
    if (level === "intermediate") return { color: "bg-yellow-500 text-white", label: "Среден" };
    if (level === "advanced") return { color: "bg-red-500 text-white", label: "Напреднал" };
    return { color: "bg-gray-500 text-white", label: level };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(totalCount / limit);

  if (isLoading && !isRefreshing) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ClipboardCheck className="h-8 w-8" />
              Quiz Резултати
            </h1>
            <p className="text-muted-foreground mt-1">
              Всички submissions от quiz-a (quiz_results_v2)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchQuizResults(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Обнови
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleExportCSV}
              disabled={results.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Общо Submissions"
              value={stats.total}
              icon={ClipboardCheck}
              description="Общ брой попълнени тестове"
            />
            <StatCard
              title="Среден Score"
              value={stats.avgScore.toFixed(1)}
              icon={Activity}
              valueColor="text-primary"
              description="Среден total_score"
            />
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">По категория</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Енергия:</span>
                    <span className="font-semibold">{stats.byCategory.energy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-500" /> Либидо:</span>
                    <span className="font-semibold">{stats.byCategory.libido}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3 text-blue-500" /> Мускули:</span>
                    <span className="font-semibold">{stats.byCategory.muscle}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">По ниво</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Начинаещ:</span>
                    <span className="font-semibold">{stats.byLevel.beginner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Среден:</span>
                    <span className="font-semibold">{stats.byLevel.intermediate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Напреднал:</span>
                    <span className="font-semibold">{stats.byLevel.advanced}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Филтри
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                  <X className="h-4 w-4 mr-1" />
                  Изчисти
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="search" className="text-xs mb-1">
                  Търсене (име/email)
                </Label>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Търси по име или email..."
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-xs mb-1">Категория</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички</SelectItem>
                    <SelectItem value="energy">Енергия</SelectItem>
                    <SelectItem value="libido">Либидо</SelectItem>
                    <SelectItem value="muscle">Мускули</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1">Ниво</Label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички</SelectItem>
                    <SelectItem value="beginner">Начинаещ</SelectItem>
                    <SelectItem value="intermediate">Среден</SelectItem>
                    <SelectItem value="advanced">Напреднал</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1">От дата</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1">До дата</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Резултати ({totalCount})</CardTitle>
            <CardDescription>
              Показани {results.length} от {totalCount} submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-semibold">Няма резултати</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasActiveFilters
                    ? "Пробвай да промениш филтрите"
                    : "Още няма submissions от quiz-a"}
                </p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Име</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead>Ниво</TableHead>
                      <TableHead>Локация</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => {
                      const catBadge = getCategoryBadge(result.category);
                      const levelBadge = getLevelBadge(result.determined_level);
                      const CatIcon = catBadge.icon;
                      return (
                        <TableRow
                          key={result.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedResult(result);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(result.created_at)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {result.first_name || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {result.email}
                          </TableCell>
                          <TableCell>
                            <Badge className={catBadge.color}>
                              <CatIcon className="w-3 h-3 mr-1" />
                              {catBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {result.total_score}
                          </TableCell>
                          <TableCell>
                            <Badge className={levelBadge.color}>
                              {levelBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {result.workout_location === 'home' ? 'Вкъщи' : result.workout_location === 'gym' ? 'Фитнес' : '—'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Детайли
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Страница {currentPage + 1} от {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    Предишна
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    Следваща
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детайли за {selectedResult?.first_name || 'Потребител'}</DialogTitle>
            <DialogDescription>{selectedResult?.email}</DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6 mt-4">
              {/* Main Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Категория</span>
                  <div className="mt-1">
                    <Badge className={getCategoryBadge(selectedResult.category).color}>
                      {getCategoryBadge(selectedResult.category).label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total Score</span>
                  <p className="font-bold text-2xl">{selectedResult.total_score}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Ниво</span>
                  <div className="mt-1">
                    <Badge className={getLevelBadge(selectedResult.determined_level).color}>
                      {getLevelBadge(selectedResult.determined_level).label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div>
                <h3 className="font-semibold mb-3 text-primary">Breakdown по категории</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <span className="text-muted-foreground">Симптоми</span>
                    <p className="font-bold text-lg">{selectedResult.breakdown_symptoms}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <span className="text-muted-foreground">Хранене</span>
                    <p className="font-bold text-lg">{selectedResult.breakdown_nutrition}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <span className="text-muted-foreground">Тренировки</span>
                    <p className="font-bold text-lg">{selectedResult.breakdown_training}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <span className="text-muted-foreground">Сън/Възстановяване</span>
                    <p className="font-bold text-lg">{selectedResult.breakdown_sleep_recovery}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <span className="text-muted-foreground">Контекст</span>
                    <p className="font-bold text-lg">{selectedResult.breakdown_context}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <span className="text-muted-foreground">Общо</span>
                    <p className="font-bold text-lg">{selectedResult.breakdown_overall}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Тренировъчна локация</span>
                  <p className="font-semibold">
                    {selectedResult.workout_location === 'home' ? 'Вкъщи' :
                     selectedResult.workout_location === 'gym' ? 'Фитнес' : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Цел</span>
                  <p className="font-semibold">{selectedResult.goal || '—'}</p>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                <p>ID: {selectedResult.id}</p>
                <p>Session: {selectedResult.session_id}</p>
                <p>Създаден: {formatDate(selectedResult.created_at)}</p>
                {selectedResult.completed_at && (
                  <p>Завършен: {formatDate(selectedResult.completed_at)}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
