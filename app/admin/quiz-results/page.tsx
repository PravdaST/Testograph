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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
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
  UserCheck,
  UserX,
  Crown,
  ShoppingCart,
  Copy,
  Mail,
  ExternalLink,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";

interface UserJourney {
  isRegistered: boolean;
  registeredAt: string | null;
  hasActiveSubscription: boolean;
  subscriptionExpiresAt: string | null;
  currentDay: number | null;
  lastSignIn: string | null;
  userId: string | null;
  hasPurchased: boolean;
  totalSpent: number;
  onboardingCompleted: boolean;
}

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
  userJourney: UserJourney;
}

interface ConversionStats {
  totalQuizSubmissions: number;
  registeredInApp: number;
  withSubscription: number;
  registrationRate: number;
  subscriptionRate: number;
  notRegisteredCount: number;
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
  conversion: ConversionStats;
}

export default function QuizResultsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [registrationFilter, setRegistrationFilter] = useState<string>("all");
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
  }, [currentPage, searchQuery, categoryFilter, levelFilter, registrationFilter, dateFrom, dateTo]);

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
      if (registrationFilter !== "all") params.append("registrationStatus", registrationFilter);
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
      "Регистриран",
      "PRO абонамент",
      "Покупка",
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
      r.userJourney.isRegistered ? "Да" : "Не",
      r.userJourney.hasActiveSubscription ? "Да" : "Не",
      r.userJourney.hasPurchased ? "Да" : "Не",
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

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({
      title: "Email копиран",
      description: email,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setLevelFilter("all");
    setRegistrationFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(0);
  };

  const hasActiveFilters =
    searchQuery || categoryFilter !== "all" || levelFilter !== "all" ||
    registrationFilter !== "all" || dateFrom || dateTo;

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

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Днес";
    if (diffDays === 1) return "Вчера";
    if (diffDays < 7) return `Преди ${diffDays} дни`;
    if (diffDays < 30) return `Преди ${Math.floor(diffDays / 7)} седм.`;
    return `Преди ${Math.floor(diffDays / 30)} мес.`;
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
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ClipboardCheck className="h-8 w-8" />
                Quiz Резултати
              </h1>
              <p className="text-muted-foreground mt-1">
                User journey tracking от quiz до app регистрация
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

          {/* Conversion Stats - NEW */}
          {stats?.conversion && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Quiz Submissions</p>
                      <p className="text-2xl font-bold">{stats.conversion.totalQuizSubmissions}</p>
                    </div>
                    <ClipboardCheck className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">App Регистрации</p>
                      <p className="text-2xl font-bold">
                        {stats.conversion.registeredInApp}
                        <span className="text-sm font-normal text-green-500 ml-2">
                          ({stats.conversion.registrationRate}%)
                        </span>
                      </p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">PRO Абонаменти</p>
                      <p className="text-2xl font-bold">
                        {stats.conversion.withSubscription}
                        <span className="text-sm font-normal text-purple-500 ml-2">
                          ({stats.conversion.subscriptionRate}%)
                        </span>
                      </p>
                    </div>
                    <Crown className="h-8 w-8 text-purple-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-l-4 border-l-orange-500 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setRegistrationFilter("not_registered")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Нуждаят се от follow-up</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {stats.conversion.notRegisteredCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Кликни за филтър</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-orange-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Category & Level Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Conversion Funnel</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="w-12 text-right">100%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.conversion.registrationRate}%` }}></div>
                      </div>
                      <span className="w-12 text-right">{stats.conversion.registrationRate}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${stats.conversion.subscriptionRate * stats.conversion.registrationRate / 100}%` }}></div>
                      </div>
                      <span className="w-12 text-right">{Math.round(stats.conversion.subscriptionRate * stats.conversion.registrationRate / 100)}%</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

                <div>
                  <Label className="text-xs mb-1">Регистрация</Label>
                  <Select value={registrationFilter} onValueChange={setRegistrationFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всички</SelectItem>
                      <SelectItem value="registered">Регистрирани</SelectItem>
                      <SelectItem value="not_registered">Нерегистрирани</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs mb-1">От</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1">До</Label>
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
                        <TableHead>Потребител</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead>User Journey</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => {
                        const catBadge = getCategoryBadge(result.category);
                        const levelBadge = getLevelBadge(result.determined_level);
                        const CatIcon = catBadge.icon;
                        const journey = result.userJourney;

                        return (
                          <TableRow
                            key={result.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => {
                              setSelectedResult(result);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <TableCell className="text-xs">
                              <div className="flex flex-col">
                                <span className="text-muted-foreground">{formatRelativeTime(result.created_at)}</span>
                                <span className="text-[10px] text-muted-foreground/70">
                                  {new Date(result.created_at).toLocaleDateString("bg-BG")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{result.first_name || "—"}</span>
                                <span className="text-xs text-muted-foreground">{result.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge className={catBadge.color}>
                                  <CatIcon className="w-3 h-3 mr-1" />
                                  {catBadge.label}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                  {levelBadge.label}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold text-lg">{result.total_score}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {journey.isRegistered ? (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                        <UserCheck className="w-3 h-3 mr-1" />
                                        App
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Регистриран в app</p>
                                      {journey.registeredAt && (
                                        <p className="text-xs text-muted-foreground">
                                          {formatDate(journey.registeredAt)}
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                                        <UserX className="w-3 h-3 mr-1" />
                                        No App
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Не е регистриран в app</p>
                                      <p className="text-xs text-orange-500">Нуждае се от follow-up</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {journey.hasActiveSubscription && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                                        <Crown className="w-3 h-3 mr-1" />
                                        PRO
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Активен PRO абонамент</p>
                                      {journey.currentDay && (
                                        <p className="text-xs">Ден {journey.currentDay}</p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {journey.hasPurchased && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                        <ShoppingCart className="w-3 h-3 mr-1" />
                                        {journey.totalSpent > 0 ? `${journey.totalSpent} лв` : 'Купил'}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Направил покупка</p>
                                      {journey.totalSpent > 0 && (
                                        <p className="text-xs">Общо: {journey.totalSpent} лв</p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => copyEmail(result.email)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Копирай email</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => window.open(`mailto:${result.email}`, '_blank')}
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Изпрати email</TooltipContent>
                                </Tooltip>

                                {journey.isRegistered && journey.userId && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => router.push(`/admin/users?search=${encodeURIComponent(result.email)}`)}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Виж в Users</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
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
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedResult?.first_name || 'Потребител'}
                {selectedResult?.userJourney.hasActiveSubscription && (
                  <Badge className="bg-purple-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    PRO
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                {selectedResult?.email}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => selectedResult && copyEmail(selectedResult.email)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </DialogDescription>
            </DialogHeader>

            {selectedResult && (
              <div className="space-y-6 mt-4">
                {/* User Journey Timeline */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    User Journey
                  </h3>
                  <div className="relative pl-6 space-y-4">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-muted"></div>

                    {/* Quiz Completed */}
                    <div className="relative flex gap-3">
                      <div className="absolute left-[-24px] w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <ClipboardCheck className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 bg-blue-500/10 rounded-lg p-3">
                        <p className="font-medium text-sm">Quiz попълнен</p>
                        <p className="text-xs text-muted-foreground">{formatDate(selectedResult.created_at)}</p>
                        <div className="mt-1 flex gap-1">
                          <Badge className={getCategoryBadge(selectedResult.category).color} variant="secondary">
                            {getCategoryBadge(selectedResult.category).label}
                          </Badge>
                          <Badge variant="outline">Score: {selectedResult.total_score}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* App Registration */}
                    <div className="relative flex gap-3">
                      <div className={`absolute left-[-24px] w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedResult.userJourney.isRegistered ? 'bg-green-500' : 'bg-muted'
                      }`}>
                        {selectedResult.userJourney.isRegistered ? (
                          <UserCheck className="w-3 h-3 text-white" />
                        ) : (
                          <UserX className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`flex-1 rounded-lg p-3 ${
                        selectedResult.userJourney.isRegistered ? 'bg-green-500/10' : 'bg-muted/50'
                      }`}>
                        <p className="font-medium text-sm">
                          {selectedResult.userJourney.isRegistered ? 'App регистрация' : 'Не е регистриран в app'}
                        </p>
                        {selectedResult.userJourney.registeredAt ? (
                          <p className="text-xs text-muted-foreground">{formatDate(selectedResult.userJourney.registeredAt)}</p>
                        ) : (
                          <p className="text-xs text-orange-500">Follow-up needed</p>
                        )}
                      </div>
                    </div>

                    {/* Subscription */}
                    {selectedResult.userJourney.isRegistered && (
                      <div className="relative flex gap-3">
                        <div className={`absolute left-[-24px] w-5 h-5 rounded-full flex items-center justify-center ${
                          selectedResult.userJourney.hasActiveSubscription ? 'bg-purple-500' : 'bg-muted'
                        }`}>
                          <Crown className={`w-3 h-3 ${selectedResult.userJourney.hasActiveSubscription ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div className={`flex-1 rounded-lg p-3 ${
                          selectedResult.userJourney.hasActiveSubscription ? 'bg-purple-500/10' : 'bg-muted/50'
                        }`}>
                          <p className="font-medium text-sm">
                            {selectedResult.userJourney.hasActiveSubscription ? 'PRO Абонамент активен' : 'Без PRO абонамент'}
                          </p>
                          {selectedResult.userJourney.currentDay && (
                            <p className="text-xs text-muted-foreground">Текущ ден: {selectedResult.userJourney.currentDay}</p>
                          )}
                          {selectedResult.userJourney.lastSignIn && (
                            <p className="text-xs text-muted-foreground">
                              Последен login: {formatRelativeTime(selectedResult.userJourney.lastSignIn)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Purchase */}
                    {selectedResult.userJourney.hasPurchased && (
                      <div className="relative flex gap-3">
                        <div className="absolute left-[-24px] w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <ShoppingCart className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 bg-emerald-500/10 rounded-lg p-3">
                          <p className="font-medium text-sm">Направена покупка</p>
                          {selectedResult.userJourney.totalSpent > 0 && (
                            <p className="text-xs text-muted-foreground">Общо похарчени: {selectedResult.userJourney.totalSpent} лв</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quiz Breakdown */}
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Quiz Breakdown</h3>
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
                    <span className="text-muted-foreground">Ниво</span>
                    <div className="mt-1">
                      <Badge className={getLevelBadge(selectedResult.determined_level).color}>
                        {getLevelBadge(selectedResult.determined_level).label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Тренировъчна локация</span>
                    <p className="font-semibold">
                      {selectedResult.workout_location === 'home' ? 'Вкъщи' :
                       selectedResult.workout_location === 'gym' ? 'Фитнес' : '—'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Цел</span>
                    <p className="font-semibold">{selectedResult.goal || '—'}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyEmail(selectedResult.email)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Копирай email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`mailto:${selectedResult.email}`, '_blank')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Изпрати email
                  </Button>
                  {selectedResult.userJourney.isRegistered && selectedResult.userJourney.userId && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        router.push(`/admin/users?search=${encodeURIComponent(selectedResult.email)}`);
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Виж в Users
                    </Button>
                  )}
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                  <p>Quiz ID: {selectedResult.id}</p>
                  <p>Session: {selectedResult.session_id}</p>
                  {selectedResult.userJourney.userId && (
                    <p>User ID: {selectedResult.userJourney.userId}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </AdminLayout>
  );
}
