"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Banknote,
  TrendingUp,
  TrendingDown,
  Users,
  UserMinus,
  UserPlus,
  ShoppingCart,
  RefreshCw,
  Download,
  Target,
  Package,
  Pill,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  BarChart3,
  Activity,
} from "lucide-react";

interface BusinessAnalytics {
  revenue: {
    total: number;
    periodRevenue: number;
    mrr: number;
    averageOrderValue: number;
    totalPurchases: number;
    periodPurchases: number;
    revenueByProduct: Record<string, number>;
    revenueTrend: Array<{
      month: string;
      revenue: number;
      purchases: number;
    }>;
    refunds: {
      total: number;
      count: number;
    };
    totalBottlesSold: number;
    totalCapsulesSold: number;
    periodBottlesSold: number;
    uniqueCustomers: number;
    periodUniqueCustomers: number;
  };
  retention: {
    churnRate: number;
    activeUsers: number;
    totalUsers: number;
    inactiveUsers: number;
    cohortAnalysis: Array<{
      month: string;
      totalUsers: number;
      retentionRates: Record<number, number>;
    }>;
  };
  email: {
    totalCampaigns: number;
    totalEmailsSent: number;
    averageOpenRate: number;
    averageClickRate: number;
    note: string;
  };
}

const COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

const PRODUCT_LABELS: Record<string, string> = {
  full: "Пълна опаковка (60 капсули)",
  sample: "Пробна опаковка (10 капсули)",
  unknown: "Други",
};

export default function BusinessAnalyticsPage() {
  const [data, setData] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedDays]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/business-analytics?days=${selectedDays}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const analytics = await res.json();
      setData(analytics);
    } catch (error) {
      console.error("Error fetching business analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    const csv = [
      "Бизнес Аналитика - Отчет",
      `Генериран: ${new Date().toLocaleDateString("bg-BG")}`,
      `Период: последните ${selectedDays} дни`,
      "",
      "=== ПРИХОДИ ===",
      `Общи приходи,${data.revenue.total} лв.`,
      `Приходи за периода,${data.revenue.periodRevenue} лв.`,
      `Месечен приход (MRR),${data.revenue.mrr} лв.`,
      `Средна стойност на поръчка,${data.revenue.averageOrderValue} лв.`,
      `Общо поръчки,${data.revenue.totalPurchases}`,
      `Поръчки за периода,${data.revenue.periodPurchases}`,
      "",
      "=== ПРОДУКТИ ===",
      `Продадени опаковки (общо),${data.revenue.totalBottlesSold}`,
      `Продадени опаковки (период),${data.revenue.periodBottlesSold}`,
      `Продадени капсули,${data.revenue.totalCapsulesSold}`,
      "",
      "=== КЛИЕНТИ ===",
      `Уникални клиенти (общо),${data.revenue.uniqueCustomers}`,
      `Нови клиенти (период),${data.revenue.periodUniqueCustomers}`,
      "",
      "=== РЕТЕНЦИЯ ===",
      `Активни потребители,${data.retention.activeUsers}`,
      `Неактивни потребители,${data.retention.inactiveUsers}`,
      `Churn Rate,${data.retention.churnRate}%`,
    ].join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `biznes-analitika-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Prepare chart data
  const revenueByProductData = data
    ? Object.entries(data.revenue.revenueByProduct).map(([name, value]) => ({
        name: PRODUCT_LABELS[name] || name,
        value: Math.round(value * 100) / 100,
      }))
    : [];

  // Calculate growth rate
  const calculateGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return { rate: 0, isPositive: true };
    const rate = Math.round(((current - previous) / previous) * 100);
    return { rate: Math.abs(rate), isPositive: rate >= 0 };
  };

  // Format Bulgarian months for chart
  const formatBulgarianMonth = (monthStr: string) => {
    const months: Record<string, string> = {
      Jan: "Яну",
      Feb: "Фев",
      Mar: "Мар",
      Apr: "Апр",
      May: "Май",
      Jun: "Юни",
      Jul: "Юли",
      Aug: "Авг",
      Sep: "Сеп",
      Oct: "Окт",
      Nov: "Ное",
      Dec: "Дек",
    };
    const parts = monthStr.split(" ");
    return `${months[parts[0]] || parts[0]} ${parts[1]?.slice(2) || ""}`;
  };

  const formattedRevenueTrend = data?.revenue.revenueTrend.map((item) => ({
    ...item,
    month: formatBulgarianMonth(item.month),
  }));

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Бизнес Аналитика
            </h1>
            <p className="text-muted-foreground mt-1">
              Приходи, продажби, клиенти и ретенция
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {[
                { days: 7, label: "7 дни" },
                { days: 30, label: "30 дни" },
                { days: 90, label: "90 дни" },
                { days: 365, label: "1 год." },
              ].map(({ days, label }) => (
                <Button
                  key={days}
                  variant={selectedDays === days ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDays(days)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalyticsData}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Обнови
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Експорт
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Зареждане на данни...</p>
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Няма налични данни</p>
          </div>
        ) : (
          <>
            {/* Main KPIs - Revenue */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    Общи Приходи
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {data.revenue.total.toLocaleString("bg-BG")} лв.
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      <ArrowUpRight className="w-3 h-3 mr-1" />+
                      {data.revenue.periodRevenue.toLocaleString("bg-BG")} лв.
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      последни {selectedDays} дни
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Месечен Приход (MRR)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {data.revenue.mrr.toLocaleString("bg-BG")} лв.
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Приходи за последните 30 дни
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Средна Поръчка (AOV)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {data.revenue.averageOrderValue.toLocaleString("bg-BG")} лв.
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Average Order Value
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Общо Поръчки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {data.revenue.totalPurchases}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700"
                    >
                      +{data.revenue.periodPurchases}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      последни {selectedDays} дни
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product & Customer KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    Продадени Опаковки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data.revenue.totalBottlesSold}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      +{data.revenue.periodBottlesSold}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      последни {selectedDays} дни
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Pill className="w-4 h-4 text-purple-500" />
                    Продадени Капсули
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data.revenue.totalCapsulesSold.toLocaleString("bg-BG")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Общо разпределени капсули
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Уникални Клиенти
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data.revenue.uniqueCustomers}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className="bg-indigo-100 text-indigo-700"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />+
                      {data.revenue.periodUniqueCustomers}
                    </Badge>
                    <span className="text-xs text-muted-foreground">нови</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-500" />
                    Конверсия
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data.revenue.uniqueCustomers > 0
                      ? Math.round(
                          (data.revenue.totalPurchases /
                            data.revenue.uniqueCustomers) *
                            100
                        ) / 100
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Поръчки на клиент (средно)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Тренд на Приходите (12 месеца)
                </CardTitle>
                <CardDescription>
                  Месечни приходи и брой поръчки
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={formattedRevenueTrend}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value} лв.`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "Приходи"
                          ? `${value.toLocaleString("bg-BG")} лв.`
                          : value,
                        name,
                      ]}
                      labelStyle={{ color: "#666" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                      name="Приходи"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="purchases"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2 }}
                      name="Поръчки"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Product & Retention Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Приходи по Продукт
                  </CardTitle>
                  <CardDescription>
                    Разпределение на приходите по тип продукт
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueByProductData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={revenueByProductData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {revenueByProductData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) =>
                              `${value.toLocaleString("bg-BG")} лв.`
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-4">
                        {revenueByProductData.map((item, index) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              />
                              <span className="text-sm">{item.name}</span>
                            </div>
                            <span className="font-medium">
                              {item.value.toLocaleString("bg-BG")} лв.
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Няма данни за продукти
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Ретенция на Потребители
                  </CardTitle>
                  <CardDescription>
                    Активност и задържане на потребители
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center">
                        <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-green-600">
                          {data.retention.activeUsers}
                        </div>
                        <p className="text-xs text-green-600/80 mt-1">
                          Активни (30 дни)
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center">
                        <UserMinus className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-red-600">
                          {data.retention.inactiveUsers}
                        </div>
                        <p className="text-xs text-red-600/80 mt-1">
                          Неактивни
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Общо потребители
                        </span>
                        <span className="text-2xl font-bold">
                          {data.retention.totalUsers}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Churn Rate</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-3xl font-bold ${
                              data.retention.churnRate > 30
                                ? "text-red-500"
                                : data.retention.churnRate > 15
                                  ? "text-yellow-500"
                                  : "text-green-500"
                            }`}
                          >
                            {data.retention.churnRate}%
                          </span>
                          {data.retention.churnRate > 30 ? (
                            <ArrowUpRight className="w-5 h-5 text-red-500" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Процент потребители неактивни 30+ дни
                      </p>
                    </div>

                    {/* Retention rate bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ретенция</span>
                        <span className="font-medium">
                          {100 - data.retention.churnRate}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${100 - data.retention.churnRate}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cohort Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Кохортен Анализ (6 месеца)
                </CardTitle>
                <CardDescription>
                  Процент на задържане по месец на регистрация
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Кохорта</th>
                        <th className="text-center p-3 font-medium">
                          Потребители
                        </th>
                        <th className="text-center p-3 font-medium">М0</th>
                        <th className="text-center p-3 font-medium">М1</th>
                        <th className="text-center p-3 font-medium">М2</th>
                        <th className="text-center p-3 font-medium">М3</th>
                        <th className="text-center p-3 font-medium">М4</th>
                        <th className="text-center p-3 font-medium">М5</th>
                        <th className="text-center p-3 font-medium">М6</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.retention.cohortAnalysis.length > 0 ? (
                        data.retention.cohortAnalysis.map((cohort) => (
                          <tr
                            key={cohort.month}
                            className="border-b hover:bg-muted/50 transition-colors"
                          >
                            <td className="p-3 font-medium">{cohort.month}</td>
                            <td className="text-center p-3 font-medium">
                              {cohort.totalUsers}
                            </td>
                            {[0, 1, 2, 3, 4, 5, 6].map((month) => {
                              const rate = cohort.retentionRates[month] || 0;
                              return (
                                <td
                                  key={month}
                                  className="text-center p-3 font-medium transition-colors"
                                  style={{
                                    backgroundColor: `rgba(139, 92, 246, ${rate / 100})`,
                                    color: rate > 50 ? "white" : "inherit",
                                  }}
                                >
                                  {rate}%
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center p-8 text-muted-foreground"
                          >
                            Няма достатъчно данни за кохортен анализ
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  М0 = месец на регистрация, М1 = 1 месец по-късно, и т.н.
                  По-тъмен цвят = по-висок процент на задържане.
                </p>
              </CardContent>
            </Card>

            {/* Summary Stats Footer */}
            <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      {data.revenue.total.toLocaleString("bg-BG")} лв.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Общи приходи
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {data.revenue.uniqueCustomers}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Уникални клиенти
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">
                      {data.revenue.totalBottlesSold}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Продадени опаковки
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-600">
                      {100 - data.retention.churnRate}%
                    </p>
                    <p className="text-sm text-muted-foreground">Ретенция</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
