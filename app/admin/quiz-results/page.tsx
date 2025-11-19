"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  TrendingDown,
  TrendingUp,
  Filter,
  X,
} from "lucide-react";

interface QuizResult {
  id: string;
  first_name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  score: number;
  testosterone_level: number;
  testosterone_category: string;
  risk_level: string;
  created_at: string;
  // All other fields
  sleep?: number;
  alcohol?: string;
  nicotine?: string;
  diet?: string;
  stress?: number;
  training_frequency?: string;
  training_type?: string;
  recovery?: string;
  supplements?: string;
  libido?: number;
  morning_erection?: string;
  morning_energy?: number;
  concentration?: number;
  mood?: string;
  muscle_mass?: string;
}

interface Stats {
  total: number;
  avgScore: number;
  avgTestosterone: number;
  byRiskLevel: {
    good: number;
    moderate: number;
    critical: number;
  };
  byTestosteroneCategory: {
    low: number;
    normal: number;
    high: number;
  };
}

export default function QuizResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("all");
  const [testosteroneCategoryFilter, setTestosteroneCategoryFilter] =
    useState<string>("all");
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
  }, [
    currentPage,
    searchQuery,
    riskLevelFilter,
    testosteroneCategoryFilter,
    dateFrom,
    dateTo,
  ]);

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
      if (riskLevelFilter !== "all")
        params.append("riskLevel", riskLevelFilter);
      if (testosteroneCategoryFilter !== "all")
        params.append("testosteroneCategory", testosteroneCategoryFilter);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await fetch(
        `/api/admin/quiz-results?${params.toString()}`,
      );
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

    // CSV headers
    const headers = [
      "Дата",
      "Име",
      "Email",
      "Възраст",
      "Височина",
      "Тегло",
      "Рисков индекс",
      "Тестостерон (nmol/L)",
      "Категория тестостерон",
      "Рисково ниво",
      "Сън (часа)",
      "Алкохол",
      "Никотин",
      "Диета",
      "Стрес (1-10)",
      "Тренировки/седмица",
      "Тип тренировки",
      "Възстановяване",
      "Добавки",
      "Либидо (1-10)",
      "Сутрешна ерекция",
      "Сутрешна енергия (1-10)",
      "Концентрация (1-10)",
      "Настроение",
      "Мускулна маса",
    ];

    // CSV rows
    const rows = results.map((r) => [
      new Date(r.created_at).toLocaleDateString("bg-BG"),
      r.first_name || "",
      r.email || "",
      r.age || "",
      r.height || "",
      r.weight || "",
      r.score || "",
      r.testosterone_level || "",
      r.testosterone_category || "",
      r.risk_level || "",
      r.sleep || "",
      r.alcohol || "",
      r.nicotine || "",
      r.diet || "",
      r.stress || "",
      r.training_frequency || "",
      r.training_type || "",
      r.recovery || "",
      r.supplements || "",
      r.libido || "",
      r.morning_erection || "",
      r.morning_energy || "",
      r.concentration || "",
      r.mood || "",
      r.muscle_mass || "",
    ]);

    // Create CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download
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
    setRiskLevelFilter("all");
    setTestosteroneCategoryFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(0);
  };

  const hasActiveFilters =
    searchQuery ||
    riskLevelFilter !== "all" ||
    testosteroneCategoryFilter !== "all" ||
    dateFrom ||
    dateTo;

  const getRiskBadgeColor = (level: string) => {
    if (level === "good") return "bg-green-500 text-white";
    if (level === "moderate") return "bg-yellow-500 text-white";
    if (level === "critical") return "bg-red-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getTestosteroneBadgeColor = (category: string) => {
    if (category === "high") return "bg-green-500 text-white";
    if (category === "normal") return "bg-yellow-500 text-white";
    if (category === "low") return "bg-red-500 text-white";
    return "bg-gray-500 text-white";
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
              Всички submissions от /test страницата
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchQuizResults(true)}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
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
              title="Среден Рисков индекс"
              value={stats.avgScore.toFixed(1)}
              icon={Activity}
              valueColor="text-primary"
              description="От 0 (отличен) до 100 (критичен)"
            />
            <StatCard
              title="Среден Тестостерон"
              value={`${stats.avgTestosterone.toFixed(1)} nmol/L`}
              icon={TrendingUp}
              valueColor="text-green-600"
              description="Референтни: 12-26 nmol/L"
            />
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">Разпределение</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>🟢 Добро:</span>
                    <span className="font-semibold">
                      {stats.byRiskLevel.good}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>🟡 Умерено:</span>
                    <span className="font-semibold">
                      {stats.byRiskLevel.moderate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>🔴 Критично:</span>
                    <span className="font-semibold">
                      {stats.byRiskLevel.critical}
                    </span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto"
                >
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
                <Label htmlFor="risk-level" className="text-xs mb-1">
                  Рисково ниво
                </Label>
                <Select
                  value={riskLevelFilter}
                  onValueChange={setRiskLevelFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички</SelectItem>
                    <SelectItem value="good">🟢 Добро</SelectItem>
                    <SelectItem value="moderate">🟡 Умерено</SelectItem>
                    <SelectItem value="critical">🔴 Критично</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="testosterone" className="text-xs mb-1">
                  Тестостерон
                </Label>
                <Select
                  value={testosteroneCategoryFilter}
                  onValueChange={setTestosteroneCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички</SelectItem>
                    <SelectItem value="high">⭐ Високо</SelectItem>
                    <SelectItem value="normal">✓ Нормално</SelectItem>
                    <SelectItem value="low">⚠️ Ниско</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="date-from" className="text-xs mb-1">
                    От дата
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-xs mb-1">
                    До дата
                  </Label>
                  <Input
                    id="date-to"
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
                      <TableHead className="text-right">Възраст</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Testosterone</TableHead>
                      <TableHead>Рисково ниво</TableHead>
                      <TableHead>T-категория</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
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
                        <TableCell className="text-right">
                          {result.age}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {result.score}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {result.testosterone_level}{" "}
                          <span className="text-xs text-muted-foreground">
                            nmol/L
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getRiskBadgeColor(result.risk_level)}
                          >
                            {result.risk_level === "good" && "🟢 Добро"}
                            {result.risk_level === "moderate" && "🟡 Умерено"}
                            {result.risk_level === "critical" && "🔴 Критично"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getTestosteroneBadgeColor(
                              result.testosterone_category,
                            )}
                          >
                            {result.testosterone_category === "high" &&
                              "⭐ Високо"}
                            {result.testosterone_category === "normal" &&
                              "✓ Нормално"}
                            {result.testosterone_category === "low" &&
                              "⚠️ Ниско"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResult(result);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            Детайли →
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
                    ← Предишна
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                    }
                    disabled={currentPage === totalPages - 1}
                  >
                    Следваща →
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детайли за {selectedResult?.first_name}</DialogTitle>
            <DialogDescription>{selectedResult?.email}</DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6 mt-4">
              {/* Demographics */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  📊 Демография
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Възраст:</span>
                    <p className="font-semibold">{selectedResult.age} години</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Височина:</span>
                    <p className="font-semibold">{selectedResult.height} см</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Тегло:</span>
                    <p className="font-semibold">{selectedResult.weight} кг</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">BMI:</span>
                    <p className="font-semibold">
                      {(
                        selectedResult.weight /
                        Math.pow(selectedResult.height / 100, 2)
                      ).toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  📈 Резултати
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Рисков индекс:
                    </span>
                    <p className="font-bold text-xl">{selectedResult.score}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Тестостерон:</span>
                    <p className="font-bold text-xl">
                      {selectedResult.testosterone_level} nmol/L
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Рисково ниво:</span>
                    <Badge
                      className={getRiskBadgeColor(selectedResult.risk_level)}
                    >
                      {selectedResult.risk_level}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">T-категория:</span>
                    <Badge
                      className={getTestosteroneBadgeColor(
                        selectedResult.testosterone_category,
                      )}
                    >
                      {selectedResult.testosterone_category}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Lifestyle */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  🌙 Начин на живот
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Сън:</span>
                    <p className="font-semibold">{selectedResult.sleep} часа</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Алкохол:</span>
                    <p className="font-semibold">
                      {selectedResult.alcohol || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Никотин:</span>
                    <p className="font-semibold">
                      {selectedResult.nicotine || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Диета:</span>
                    <p className="font-semibold">
                      {selectedResult.diet || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Стрес:</span>
                    <p className="font-semibold">{selectedResult.stress}/10</p>
                  </div>
                </div>
              </div>

              {/* Training */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  💪 Тренировки
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Честота:</span>
                    <p className="font-semibold">
                      {selectedResult.training_frequency || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Тип:</span>
                    <p className="font-semibold">
                      {selectedResult.training_type || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Възстановяване:
                    </span>
                    <p className="font-semibold">
                      {selectedResult.recovery || "—"}
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <span className="text-muted-foreground">Добавки:</span>
                    <p className="font-semibold">
                      {selectedResult.supplements || "Няма"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                  ❤️ Симптоми
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Либидо:</span>
                    <p className="font-semibold">{selectedResult.libido}/10</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Сутрешна ерекция:
                    </span>
                    <p className="font-semibold">
                      {selectedResult.morning_erection || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Сутрешна енергия:
                    </span>
                    <p className="font-semibold">
                      {selectedResult.morning_energy}/10
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Концентрация:</span>
                    <p className="font-semibold">
                      {selectedResult.concentration}/10
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Настроение:</span>
                    <p className="font-semibold">
                      {selectedResult.mood || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Мускулна маса:
                    </span>
                    <p className="font-semibold">
                      {selectedResult.muscle_mass || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Submission ID: {selectedResult.id}
                </p>
                <p className="text-xs text-muted-foreground">
                  Дата: {formatDate(selectedResult.created_at)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
