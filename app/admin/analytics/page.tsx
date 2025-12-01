"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
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
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  RefreshCw,
  Download,
  TrendingUp,
  Users,
  Target,
  Activity,
  Home,
  Dumbbell,
  Heart,
  Zap,
  Flame,
} from "lucide-react";

interface QuizResult {
  id: string;
  email: string;
  firstName: string | null;
  category: string;
  totalScore: number;
  level: string;
  workoutLocation: string;
  breakdownSymptoms: number;
  breakdownNutrition: number;
  breakdownTraining: number;
  breakdownSleepRecovery: number;
  breakdownContext: number;
  completedAt: string;
  createdAt: string;
}

interface QuizStats {
  stats: {
    totalQuizzes: number;
    avgTotalScore: number;
    mostCommonCategory: string;
    mostCommonLevel: string;
    homeVsGymRatio: number;
  };
  categoryBreakdown: {
    libido: number;
    muscle: number;
    energy: number;
  };
  levelBreakdown: {
    low: number;
    moderate: number;
    good: number;
    optimal: number;
  };
  workoutLocationBreakdown: {
    home: number;
    gym: number;
  };
  avgBreakdown: {
    symptoms: number;
    nutrition: number;
    training: number;
    sleepRecovery: number;
    context: number;
  };
  trendData: Array<{
    date: string;
    total: number;
    libido: number;
    muscle: number;
    energy: number;
  }>;
  quizList: QuizResult[];
  dateRange: {
    from: string;
    to: string;
    days: number;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  libido: "#ef4444",
  muscle: "#3b82f6",
  energy: "#f59e0b",
};

const LEVEL_COLORS: Record<string, string> = {
  low: "#ef4444",
  moderate: "#f59e0b",
  good: "#22c55e",
  optimal: "#10b981",
};

const CATEGORY_LABELS: Record<string, string> = {
  libido: "Либидо",
  muscle: "Мускули",
  energy: "Енергия",
};

const LEVEL_LABELS: Record<string, string> = {
  low: "Нисък",
  moderate: "Умерен",
  good: "Добър",
  optimal: "Оптимален",
};

export default function QuizAnalyticsDashboard() {
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam =
        categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const statsUrl = `${baseUrl}/api/analytics/funnel-stats?days=${selectedDays}${categoryParam}`;

      console.log("Fetching quiz analytics from:", statsUrl);

      const response = await fetch(statsUrl);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Quiz analytics loaded:", data);
      setQuizStats(data);
    } catch (error) {
      console.error("Error fetching quiz analytics:", error);
      alert(
        `Грешка при зареждане на данните: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDays, categoryFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("bg-BG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    if (!quizStats) return;

    let csv = "Quiz Analytics Report\n\n";
    csv += `Date Range: Last ${selectedDays} days\n\n`;
    csv += "Overall Stats\n";
    csv += `Total Quizzes,${quizStats.stats.totalQuizzes}\n`;
    csv += `Average Score,${quizStats.stats.avgTotalScore}\n`;
    csv += `Most Common Category,${quizStats.stats.mostCommonCategory}\n`;
    csv += `Most Common Level,${quizStats.stats.mostCommonLevel}\n\n`;

    csv += "Category Breakdown\n";
    csv += `Libido,${quizStats.categoryBreakdown.libido}\n`;
    csv += `Muscle,${quizStats.categoryBreakdown.muscle}\n`;
    csv += `Energy,${quizStats.categoryBreakdown.energy}\n\n`;

    csv += "Quiz Results\n";
    csv += "Email,Name,Category,Score,Level,Location,Date\n";
    quizStats.quizList.forEach((quiz) => {
      csv += `${quiz.email},${quiz.firstName || "N/A"},${quiz.category},${quiz.totalScore},${quiz.level},${quiz.workoutLocation},${quiz.createdAt}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "libido":
        return <Heart className="w-4 h-4" />;
      case "muscle":
        return <Dumbbell className="w-4 h-4" />;
      case "energy":
        return <Zap className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const color = LEVEL_COLORS[level] || "#6b7280";
    return (
      <Badge style={{ backgroundColor: color, color: "white" }}>
        {LEVEL_LABELS[level] || level}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const color = CATEGORY_COLORS[category] || "#6b7280";
    return (
      <Badge style={{ backgroundColor: color, color: "white" }}>
        {CATEGORY_LABELS[category] || category}
      </Badge>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Зареждане на quiz анализи...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!quizStats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">Няма данни</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Prepare chart data
  const categoryChartData = [
    { name: "Либидо", value: quizStats.categoryBreakdown.libido, color: CATEGORY_COLORS.libido },
    { name: "Мускули", value: quizStats.categoryBreakdown.muscle, color: CATEGORY_COLORS.muscle },
    { name: "Енергия", value: quizStats.categoryBreakdown.energy, color: CATEGORY_COLORS.energy },
  ];

  const levelChartData = [
    { name: "Нисък", value: quizStats.levelBreakdown.low, color: LEVEL_COLORS.low },
    { name: "Умерен", value: quizStats.levelBreakdown.moderate, color: LEVEL_COLORS.moderate },
    { name: "Добър", value: quizStats.levelBreakdown.good, color: LEVEL_COLORS.good },
    { name: "Оптимален", value: quizStats.levelBreakdown.optimal, color: LEVEL_COLORS.optimal },
  ];

  const breakdownChartData = [
    { name: "Симптоми", value: quizStats.avgBreakdown.symptoms },
    { name: "Хранене", value: quizStats.avgBreakdown.nutrition },
    { name: "Тренировки", value: quizStats.avgBreakdown.training },
    { name: "Сън", value: quizStats.avgBreakdown.sleepRecovery },
    { name: "Контекст", value: quizStats.avgBreakdown.context },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Quiz Анализи
            </h1>
            <p className="text-muted-foreground mt-1">
              Последните {selectedDays} дни - {quizStats.stats.totalQuizzes} quiz резултата
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Date Range Selector */}
            <div className="flex gap-1">
              {[7, 30, 90].map((days) => (
                <Button
                  key={days}
                  variant={selectedDays === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDays(days)}
                >
                  {days}д
                </Button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex gap-1 border-l pl-2">
              {(["all", "libido", "muscle", "energy"] as const).map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === "all" ? "Всички" : CATEGORY_LABELS[cat]}
                </Button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Обнови
            </Button>

            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Експорт
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Общо Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {quizStats.stats.totalQuizzes}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Среден Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {quizStats.stats.avgTotalScore}
              </div>
              <p className="text-xs text-muted-foreground mt-1">от 100 точки</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Топ Категория
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {CATEGORY_LABELS[quizStats.stats.mostCommonCategory] || quizStats.stats.mostCommonCategory}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Топ Ниво
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {LEVEL_LABELS[quizStats.stats.mostCommonLevel] || quizStats.stats.mostCommonLevel}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Home className="w-4 h-4" />
                Вкъщи vs Фитнес
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizStats.stats.homeVsGymRatio}% / {100 - quizStats.stats.homeVsGymRatio}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {quizStats.workoutLocationBreakdown.home} вкъщи, {quizStats.workoutLocationBreakdown.gym} фитнес
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Категории</CardTitle>
              <CardDescription>Разпределение по категория</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Level Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Нива</CardTitle>
              <CardDescription>Разпределение по ниво</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={levelChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {levelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Breakdown Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Среден Score по Секция</CardTitle>
              <CardDescription>Средни стойности</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={breakdownChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        {quizStats.trendData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Дневен Тренд</CardTitle>
              <CardDescription>Quiz резултати по дни</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={quizStats.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8b5cf6"
                    name="Общо"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="libido"
                    stroke={CATEGORY_COLORS.libido}
                    name="Либидо"
                  />
                  <Line
                    type="monotone"
                    dataKey="muscle"
                    stroke={CATEGORY_COLORS.muscle}
                    name="Мускули"
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke={CATEGORY_COLORS.energy}
                    name="Енергия"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Quiz Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Последни Quiz Резултати</CardTitle>
            <CardDescription>
              {quizStats.quizList.length} резултата за периода
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quizStats.quizList.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Няма quiz резултати за този период</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Име</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Ниво</TableHead>
                      <TableHead>Локация</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizStats.quizList.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell className="font-medium">
                          {quiz.firstName || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {quiz.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(quiz.category)}
                            {getCategoryBadge(quiz.category)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold">{quiz.totalScore}</span>
                        </TableCell>
                        <TableCell>
                          {getLevelBadge(quiz.level)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {quiz.workoutLocation === "home" ? (
                              <Home className="w-4 h-4" />
                            ) : (
                              <Dumbbell className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                              {quiz.workoutLocation === "home" ? "Вкъщи" : "Фитнес"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(quiz.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
