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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  TrendingDown,
  TrendingUp,
  Users,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  Dumbbell,
  Zap,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Eye,
  ChevronLeft,
  ChevronRight,
  Database,
  Info,
  BarChart3,
  Home,
  Building2,
  ShoppingCart,
  CreditCard,
  Package,
  Mail,
  Send,
  UserX,
  UserCheck,
  Crown,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============ INTERFACES ============
interface FunnelStep {
  step: number;
  sessions: number;
  dropRate: number;
}

interface DropOff {
  step: number;
  count: number;
  percentage: number;
  questionIds: string[];
}

interface Session {
  session_id: string;
  email: string | null;
  first_name: string | null;
  category: string;
  total_score: number;
  determined_level: string;
  workout_location: string | null;
  started_at: string;
  has_tracking: boolean;
  last_step: number;
  total_time: number;
  completed: boolean;
  abandoned: boolean;
  device: string | null;
  utm_source: string | null;
  back_clicks: number;
  offer_selected: string | null;
  order: {
    status: string;
    total_price: number;
    order_number: string;
    products: Array<{ title: string; quantity: number; capsules: number }>;
    totalCapsules: number;
  } | null;
}

interface StatsData {
  overview: {
    totalSessions: number;
    completedSessions: number;
    abandonedSessions: number;
    completionRate: number;
    abandonmentEvents: number;
  };
  deviceBreakdown: Record<string, number>;
  trafficSources: Array<{ source: string; count: number }>;
  avgTimePerStep: Record<number, number>;
}

interface SessionDetail {
  session_id: string;
  category: string;
  started_at: string;
  deviceInfo: {
    device: string | null;
    screen: string | null;
    referrer: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    language: string | null;
    timezone: string | null;
  };
  stats: {
    totalTime: number;
    maxStep: number;
    completed: boolean;
    abandoned: boolean;
    totalEvents: number;
    backClicks: number;
    pageHiddenCount: number;
  };
  timeline: Array<{
    timestamp: string;
    step: number;
    question_id: string | null;
    event_type: string;
    time_spent: number | null;
    answer: string | null;
  }>;
}

interface TrendsData {
  totalQuizzes: number;
  avgScore: number;
  categoryBreakdown: { libido: number; muscle: number; energy: number };
  levelBreakdown: { low: number; moderate: number; good: number; optimal: number };
  trendData: Array<{
    date: string;
    total: number;
    libido: number;
    muscle: number;
    energy: number;
    avgScore: number;
  }>;
}

interface UserJourneyResult {
  id: string;
  email: string;
  first_name: string | null;
  category: string;
  total_score: number;
  determined_level: string;
  created_at: string;
  userJourney: {
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
  };
}

interface ConversionStats {
  totalQuizSubmissions: number;
  registeredInApp: number;
  withSubscription: number;
  registrationRate: number;
  subscriptionRate: number;
  notRegisteredCount: number;
}

interface CrmSegment {
  name: string;
  description: string;
  action: string;
  count: number;
  users: Array<{
    email: string;
    first_name?: string;
    category?: string;
    total_score?: number;
    determined_level?: string;
    quiz_date?: string;
    status?: string;
    total_price?: number;
    products?: string;
    totalCapsules?: number;
    order_date?: string;
  }>;
}

interface CrmData {
  segments: {
    quizNoOrder: CrmSegment;
    orderNoQuiz: CrmSegment;
    paidNoQuiz: CrmSegment;
  };
  summary: {
    totalQuizUsers: number;
    totalOrderUsers: number;
    overlap: number;
  };
}

interface OverviewData {
  tracking: {
    enabled: boolean;
    firstEvent: string | null;
    lastEvent: string | null;
    totalSessions: number;
    note: string;
  };
  completions: {
    total: number;
    firstCompletion: string | null;
    lastCompletion: string | null;
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
  };
}

// ============ CONSTANTS ============
const CATEGORY_COLORS: Record<string, string> = {
  libido: "#ef4444",
  muscle: "#3b82f6",
  energy: "#f59e0b",
};

const CATEGORY_LABELS: Record<string, string> = {
  libido: "Либидо",
  muscle: "Мускули",
  energy: "Енергия",
};

const LEVEL_COLORS: Record<string, string> = {
  low: "#ef4444",
  moderate: "#f59e0b",
  good: "#22c55e",
  optimal: "#10b981",
};

const LEVEL_LABELS: Record<string, string> = {
  low: "Нисък",
  moderate: "Умерен",
  good: "Добър",
  optimal: "Оптимален",
};

const DEVICE_COLORS: Record<string, string> = {
  mobile: "#22c55e",
  tablet: "#f59e0b",
  desktop: "#3b82f6",
  unknown: "#6b7280",
};

const STEP_LABELS: Record<number, string> = {
  0: "Възраст",
  1: "Основен проблем",
  2: "Име",
  3: "Професия",
  4: "Работен стрес",
  5: "[Transition] Телесни показатели",
  6: "Височина",
  7: "Тегло",
  8: "Подкожни мазнини",
  9: "[Transition] Timeline",
  10: "Хранителен режим",
  11: "Пушене",
  12: "Алкохол",
  13: "Сън (часове)",
  14: "[Transition] Навици",
  15: "Кога сте уморен",
  16: "Ниво на енергия",
  17: "Разочарование",
  18: "Какво бих променил",
  19: "[Transition] Social Proof",
  20: "Опитвани решения",
  21: "Важен фактор при избор",
  22: "Визия (текст)",
  23: "Локация тренировка",
  24: "Хранителни предпочитания",
  25: "[Transition] Резултати",
  26: "Email Capture",
  27: "Оферта Избор",
};

type TabType = "overview" | "funnel" | "trends" | "sessions" | "user-journey" | "crm";

export default function QuizAnalyticsDashboard() {
  const { toast } = useToast();

  // Data states
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [dropOffData, setDropOffData] = useState<any>(null);
  const [sessionsData, setSessionsData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [userJourneyData, setUserJourneyData] = useState<{
    conversionStats: ConversionStats;
    results: UserJourneyResult[];
    pagination: any;
  } | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [crmData, setCrmData] = useState<CrmData | null>(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Pagination
  const [sessionsPage, setSessionsPage] = useState(1);
  const [userJourneyPage, setUserJourneyPage] = useState(1);
  const pageSize = 50;

  // Session detail modal
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  // CRM email compose
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // ============ DATA FETCHING ============
  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";

      const [statsRes, funnelRes, dropOffRes, sessionsRes, trendsRes, userJourneyRes, overviewRes, crmRes] = await Promise.all([
        fetch(`${baseUrl}/api/admin/quiz-flow?view=stats&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=funnel&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=dropoffs&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=sessions&days=0${categoryParam}&limit=${pageSize}&offset=0`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=trends&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=user-journey&days=0${categoryParam}&limit=${pageSize}&offset=0`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=overview${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=crm`),
      ]);

      if (statsRes.ok) setStatsData(await statsRes.json());
      if (funnelRes.ok) setFunnelData(await funnelRes.json());
      if (dropOffRes.ok) setDropOffData(await dropOffRes.json());
      if (sessionsRes.ok) {
        setSessionsData(await sessionsRes.json());
        setSessionsPage(1);
      }
      if (trendsRes.ok) setTrendsData(await trendsRes.json());
      if (userJourneyRes.ok) {
        setUserJourneyData(await userJourneyRes.json());
        setUserJourneyPage(1);
      }
      if (overviewRes.ok) setOverviewData(await overviewRes.json());
      if (crmRes.ok) setCrmData(await crmRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionsPage = async (page: number) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const offset = (page - 1) * pageSize;

      const res = await fetch(
        `${baseUrl}/api/admin/quiz-flow?view=sessions&days=0${categoryParam}&limit=${pageSize}&offset=${offset}`
      );

      if (res.ok) {
        setSessionsData(await res.json());
        setSessionsPage(page);
      }
    } catch (error) {
      console.error("Error fetching sessions page:", error);
    }
  };

  const fetchUserJourneyPage = async (page: number) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const offset = (page - 1) * pageSize;

      const res = await fetch(
        `${baseUrl}/api/admin/quiz-flow?view=user-journey&days=0${categoryParam}&limit=${pageSize}&offset=${offset}`
      );

      if (res.ok) {
        setUserJourneyData(await res.json());
        setUserJourneyPage(page);
      }
    } catch (error) {
      console.error("Error fetching user journey page:", error);
    }
  };

  const fetchSessionDetail = async (sessionId: string) => {
    setLoadingSession(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/quiz-flow?view=session-detail&session_id=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSession(data);
        setSessionModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching session detail:", error);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDays, categoryFilter]);

  // ============ HELPERS ============
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("bg-BG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "libido": return <Heart className="w-4 h-4" />;
      case "muscle": return <Dumbbell className="w-4 h-4" />;
      case "energy": return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getDeviceIcon = (device: string | null) => {
    switch (device) {
      case "mobile": return <Smartphone className="w-4 h-4" />;
      case "tablet": return <Tablet className="w-4 h-4" />;
      case "desktop": return <Monitor className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const color = CATEGORY_COLORS[category] || "#6b7280";
    return (
      <Badge style={{ backgroundColor: color, color: "white" }}>
        {CATEGORY_LABELS[category] || category}
      </Badge>
    );
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({ title: "Email копиран", description: email });
  };

  // ============ CRM EMAIL ============
  const openEmailModal = (segmentKey: string) => {
    if (!crmData) return;

    const segment = crmData.segments[segmentKey as keyof typeof crmData.segments];
    if (!segment) return;

    setSelectedSegment(segmentKey);

    // Pre-fill based on segment
    if (segmentKey === "quizNoOrder") {
      setEmailSubject("Завърши поръчката си за TestoUP");
      setEmailMessage(`Здравей,

Видяхме, че завърши нашия тестостеронов quiz и получи своите резултати.

За да отключиш достъп до персонализираната програма в приложението Testograph, трябва да направиш поръчка на TestoUP.

Поръчай сега: https://shop.testograph.eu

Поздрави,
Екипът на Testograph`);
    } else if (segmentKey === "orderNoQuiz" || segmentKey === "paidNoQuiz") {
      setEmailSubject("Завърши Quiz-а за персонализиран план");
      setEmailMessage(`Здравей,

Видяхме, че вече направи поръчка на TestoUP - благодарим ти!

За да получиш своя персонализиран 30-дневен план, моля завърши нашия кратък Quiz:

Започни Quiz: https://www.testograph.eu/quiz/start

След като завършиш, ще получиш достъп до приложението с програма, съобразена с твоите цели.

Поздрави,
Екипът на Testograph`);
    }

    setEmailModalOpen(true);
  };

  const sendBulkEmail = async () => {
    if (!crmData || !selectedSegment) return;

    const segment = crmData.segments[selectedSegment as keyof typeof crmData.segments];
    if (!segment || segment.users.length === 0) return;

    setSendingEmail(true);
    try {
      const recipients = segment.users.map(u => u.email);

      const res = await fetch("/api/admin/communication/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipients,
          subject: emailSubject,
          message: emailMessage,
          isBulk: true,
          adminId: "quiz-analytics-crm",
          adminEmail: "admin@testograph.eu",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Emails изпратени",
          description: `Успешно изпратени ${data.results?.length || recipients.length} emails`,
        });
        setEmailModalOpen(false);
      } else {
        toast({
          title: "Грешка",
          description: data.error || "Неуспешно изпращане",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Неуспешно изпращане на emails",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // ============ CHART DATA ============
  const deviceChartData = statsData?.deviceBreakdown
    ? Object.entries(statsData.deviceBreakdown)
        .filter(([_, count]) => count > 0)
        .map(([device, count]) => ({
          name: device === "mobile" ? "Мобилен" : device === "tablet" ? "Таблет" : device === "desktop" ? "Десктоп" : "Неизвестен",
          value: count,
          fill: DEVICE_COLORS[device] || "#6b7280",
        }))
    : [];

  const categoryChartData = trendsData?.categoryBreakdown
    ? [
        { name: "Либидо", value: trendsData.categoryBreakdown.libido, color: CATEGORY_COLORS.libido },
        { name: "Мускули", value: trendsData.categoryBreakdown.muscle, color: CATEGORY_COLORS.muscle },
        { name: "Енергия", value: trendsData.categoryBreakdown.energy, color: CATEGORY_COLORS.energy },
      ]
    : [];

  const levelChartData = trendsData?.levelBreakdown
    ? [
        { name: "Нисък", value: trendsData.levelBreakdown.low, color: LEVEL_COLORS.low },
        { name: "Умерен", value: trendsData.levelBreakdown.moderate, color: LEVEL_COLORS.moderate },
        { name: "Добър", value: trendsData.levelBreakdown.good, color: LEVEL_COLORS.good },
        { name: "Оптимален", value: trendsData.levelBreakdown.optimal, color: LEVEL_COLORS.optimal },
      ]
    : [];

  const prepareFunnelChartData = () => {
    if (!funnelData?.funnel) return [];
    const categories = categoryFilter === "all" ? Object.keys(funnelData.funnel) : [categoryFilter];
    const aggregated: Record<number, number> = {};

    categories.forEach(cat => {
      const catData = funnelData.funnel[cat] || [];
      catData.forEach((step: FunnelStep) => {
        aggregated[step.step] = (aggregated[step.step] || 0) + step.sessions;
      });
    });

    return Object.entries(aggregated)
      .map(([step, sessions]) => ({
        step: parseInt(step),
        name: STEP_LABELS[parseInt(step)] || `Step ${step}`,
        sessions,
        fill: sessions > 0 ? "#8b5cf6" : "#e5e7eb",
      }))
      .filter(d => d.step <= 24)
      .sort((a, b) => a.step - b.step);
  };

  const prepareDropOffChartData = () => {
    if (!dropOffData?.dropOffs) return [];
    return dropOffData.dropOffs.slice(0, 10).map((d: DropOff) => ({
      step: d.step,
      name: STEP_LABELS[d.step] || `Step ${d.step}`,
      count: d.count,
      percentage: d.percentage,
      fill: d.percentage > 20 ? "#ef4444" : d.percentage > 10 ? "#f59e0b" : "#22c55e",
    }));
  };

  const funnelChartData = prepareFunnelChartData();
  const dropOffChartData = prepareDropOffChartData();

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Зареждане на Quiz Analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                Quiz Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Всичко за quiz-а на едно място - статистики, funnel, trends, user journey и CRM
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Общо Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewData?.completions.total || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Среден Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trendsData?.avgScore || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statsData?.overview.completionRate || 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  App Регистрации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {userJourneyData?.conversionStats.registrationRate || 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-500" />
                  PRO Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {userJourneyData?.conversionStats.subscriptionRate || 0}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  CRM Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {crmData ? crmData.segments.quizNoOrder.count + crmData.segments.orderNoQuiz.count : 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-2">
            <Button variant={activeTab === "overview" ? "default" : "ghost"} onClick={() => setActiveTab("overview")}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button variant={activeTab === "funnel" ? "default" : "ghost"} onClick={() => setActiveTab("funnel")}>
              <TrendingDown className="w-4 h-4 mr-2" />
              Funnel
            </Button>
            <Button variant={activeTab === "trends" ? "default" : "ghost"} onClick={() => setActiveTab("trends")}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </Button>
            <Button variant={activeTab === "sessions" ? "default" : "ghost"} onClick={() => setActiveTab("sessions")}>
              <Users className="w-4 h-4 mr-2" />
              Sessions
            </Button>
            <Button variant={activeTab === "user-journey" ? "default" : "ghost"} onClick={() => setActiveTab("user-journey")}>
              <UserCheck className="w-4 h-4 mr-2" />
              User Journey
            </Button>
            <Button variant={activeTab === "crm" ? "default" : "ghost"} onClick={() => setActiveTab("crm")}>
              <Mail className="w-4 h-4 mr-2" />
              CRM
              {crmData && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {crmData.segments.quizNoOrder.count + crmData.segments.orderNoQuiz.count}
                </Badge>
              )}
            </Button>
          </div>

          {/* ============ OVERVIEW TAB ============ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Pie Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Category Pie */}
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

                {/* Level Pie */}
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

                {/* Device Pie */}
                <Card>
                  <CardHeader>
                    <CardTitle>Устройства</CardTitle>
                    <CardDescription>Разпределение по устройство</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {deviceChartData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Няма данни за устройства</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={deviceChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {deviceChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Conversion Funnel Visual */}
              {userJourneyData?.conversionStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                    <CardDescription>Quiz - App Registration - PRO Subscription</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-4 py-6">
                      {/* Quiz */}
                      <div className="text-center">
                        <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white mx-auto">
                          <div>
                            <p className="text-3xl font-bold">{userJourneyData.conversionStats.totalQuizSubmissions}</p>
                            <p className="text-xs">Quiz</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">100%</p>
                      </div>

                      <ChevronRight className="w-8 h-8 text-muted-foreground" />

                      {/* App Registration */}
                      <div className="text-center">
                        <div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center text-white mx-auto">
                          <div>
                            <p className="text-2xl font-bold">{userJourneyData.conversionStats.registeredInApp}</p>
                            <p className="text-xs">App</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-green-600 font-semibold">{userJourneyData.conversionStats.registrationRate}%</p>
                      </div>

                      <ChevronRight className="w-8 h-8 text-muted-foreground" />

                      {/* PRO */}
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center text-white mx-auto">
                          <div>
                            <p className="text-xl font-bold">{userJourneyData.conversionStats.withSubscription}</p>
                            <p className="text-xs">PRO</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-purple-600 font-semibold">
                          {Math.round(userJourneyData.conversionStats.subscriptionRate * userJourneyData.conversionStats.registrationRate / 100)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ============ FUNNEL TAB ============ */}
          {activeTab === "funnel" && (
            <div className="space-y-6">
              {/* Funnel Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Step-by-Step Funnel</CardTitle>
                  <CardDescription>Брой сесии на всяка стъпка от quiz-а</CardDescription>
                </CardHeader>
                <CardContent>
                  {funnelChartData.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Няма tracking данни за избрания период</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={funnelChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="step" />
                        <YAxis />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-background border rounded-lg p-3 shadow-lg">
                                  <p className="font-semibold">Step {data.step}: {data.name}</p>
                                  <p className="text-primary">{data.sessions} сесии</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="sessions" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Drop-offs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Top Drop-off Points
                  </CardTitle>
                  <CardDescription>Стъпки с най-много отпаднали потребители</CardDescription>
                </CardHeader>
                <CardContent>
                  {dropOffChartData.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Няма drop-off данни</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dropOffChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Bar dataKey="count" name="Отпаднали">
                          {dropOffChartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============ TRENDS TAB ============ */}
          {activeTab === "trends" && (
            <div className="space-y-6">
              {/* Daily Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Дневен Trend</CardTitle>
                  <CardDescription>Quiz резултати по дни за последните {selectedDays} дни</CardDescription>
                </CardHeader>
                <CardContent>
                  {trendsData?.trendData && trendsData.trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={trendsData.trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#8b5cf6" name="Общо" strokeWidth={2} />
                        <Line type="monotone" dataKey="libido" stroke={CATEGORY_COLORS.libido} name="Либидо" />
                        <Line type="monotone" dataKey="muscle" stroke={CATEGORY_COLORS.muscle} name="Мускули" />
                        <Line type="monotone" dataKey="energy" stroke={CATEGORY_COLORS.energy} name="Енергия" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Няма trend данни за избрания период</p>
                  )}
                </CardContent>
              </Card>

              {/* Average Score Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Среден Score по дни</CardTitle>
                </CardHeader>
                <CardContent>
                  {trendsData?.trendData && trendsData.trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={trendsData.trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avgScore" stroke="#10b981" name="Среден Score" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Няма score данни</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============ SESSIONS TAB ============ */}
          {activeTab === "sessions" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Quiz Sessions ({sessionsData?.totalSessions || 0})
                  </span>
                </CardTitle>
                <CardDescription>
                  Всички quiz completions с tracking информация и поръчки
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
                  <>
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Категория</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Tracking</TableHead>
                            <TableHead>Поръчка</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sessionsData.sessions.map((session: Session) => (
                            <TableRow key={session.session_id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{session.first_name || "-"}</span>
                                  <span className="text-xs text-muted-foreground">{session.email || "-"}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(session.category)}
                                  {getCategoryBadge(session.category)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-bold">{session.total_score}</span>
                              </TableCell>
                              <TableCell>
                                {session.has_tracking ? (
                                  <div className="flex items-center gap-1 text-xs">
                                    {getDeviceIcon(session.device)}
                                    <span>{formatTime(session.total_time)}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Няма</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {session.order ? (
                                  <Badge className={session.order.status === "paid" ? "bg-green-500" : "bg-amber-500"}>
                                    {session.order.status === "paid" ? "Paid" : "Pending"} {session.order.total_price} лв
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-red-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDate(session.started_at)}
                              </TableCell>
                              <TableCell>
                                {session.has_tracking && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => fetchSessionDetail(session.session_id)}
                                    disabled={loadingSession}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {sessionsData.pagination && sessionsData.pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <span className="text-sm text-muted-foreground">
                          Страница {sessionsPage} от {sessionsData.pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchSessionsPage(sessionsPage - 1)}
                            disabled={sessionsPage <= 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchSessionsPage(sessionsPage + 1)}
                            disabled={!sessionsData.pagination.hasMore}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Няма sessions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ============ USER JOURNEY TAB ============ */}
          {activeTab === "user-journey" && (
            <div className="space-y-6">
              {/* Conversion Stats Cards */}
              {userJourneyData?.conversionStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Quiz Submissions</p>
                          <p className="text-2xl font-bold">{userJourneyData.conversionStats.totalQuizSubmissions}</p>
                        </div>
                        <Database className="h-8 w-8 text-blue-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">App Регистрации</p>
                          <p className="text-2xl font-bold">
                            {userJourneyData.conversionStats.registeredInApp}
                            <span className="text-sm font-normal text-green-500 ml-2">
                              ({userJourneyData.conversionStats.registrationRate}%)
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
                            {userJourneyData.conversionStats.withSubscription}
                            <span className="text-sm font-normal text-purple-500 ml-2">
                              ({userJourneyData.conversionStats.subscriptionRate}%)
                            </span>
                          </p>
                        </div>
                        <Crown className="h-8 w-8 text-purple-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Нуждаят се от follow-up</p>
                          <p className="text-2xl font-bold text-orange-500">
                            {userJourneyData.conversionStats.notRegisteredCount}
                          </p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-orange-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* User Journey Table */}
              <Card>
                <CardHeader>
                  <CardTitle>User Journey List</CardTitle>
                  <CardDescription>Quiz - App Registration - PRO Subscription tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  {userJourneyData?.results && userJourneyData.results.length > 0 ? (
                    <>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Потребител</TableHead>
                              <TableHead>Категория</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>User Journey</TableHead>
                              <TableHead>Дата</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userJourneyData.results.map((result) => (
                              <TableRow key={result.id}>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{result.first_name || "-"}</span>
                                    <span className="text-xs text-muted-foreground">{result.email}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getCategoryIcon(result.category)}
                                    {getCategoryBadge(result.category)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-bold">{result.total_score}</span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {result.userJourney.isRegistered ? (
                                      <UITooltip>
                                        <TooltipTrigger>
                                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                            <UserCheck className="w-3 h-3 mr-1" />
                                            App
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Регистриран в app</p>
                                          {result.userJourney.registeredAt && (
                                            <p className="text-xs">{formatDate(result.userJourney.registeredAt)}</p>
                                          )}
                                        </TooltipContent>
                                      </UITooltip>
                                    ) : (
                                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                                        <UserX className="w-3 h-3 mr-1" />
                                        No App
                                      </Badge>
                                    )}

                                    {result.userJourney.hasActiveSubscription && (
                                      <UITooltip>
                                        <TooltipTrigger>
                                          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                                            <Crown className="w-3 h-3 mr-1" />
                                            PRO
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>PRO абонамент</p>
                                          {result.userJourney.currentDay && (
                                            <p className="text-xs">Ден {result.userJourney.currentDay}</p>
                                          )}
                                        </TooltipContent>
                                      </UITooltip>
                                    )}

                                    {result.userJourney.hasPurchased && (
                                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                        <ShoppingCart className="w-3 h-3 mr-1" />
                                        {result.userJourney.totalSpent > 0 ? `${result.userJourney.totalSpent} лв` : "Купил"}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {formatRelativeTime(result.created_at)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyEmail(result.email)}>
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`mailto:${result.email}`, "_blank")}>
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {userJourneyData.pagination && userJourneyData.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <span className="text-sm text-muted-foreground">
                            Страница {userJourneyPage} от {userJourneyData.pagination.totalPages}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchUserJourneyPage(userJourneyPage - 1)}
                              disabled={userJourneyPage <= 1}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchUserJourneyPage(userJourneyPage + 1)}
                              disabled={!userJourneyData.pagination.hasMore}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Няма user journey данни</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============ CRM TAB ============ */}
          {activeTab === "crm" && crmData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{crmData.summary.totalQuizUsers}</p>
                    <p className="text-sm text-muted-foreground">Quiz Users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{crmData.summary.totalOrderUsers}</p>
                    <p className="text-sm text-muted-foreground">Order Users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-purple-600">{crmData.summary.overlap}</p>
                    <p className="text-sm text-muted-foreground">Quiz + Order</p>
                  </CardContent>
                </Card>
              </div>

              {/* Segment Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quiz No Order */}
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader className="bg-red-50 dark:bg-red-950">
                    <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                      <UserX className="w-5 h-5" />
                      {crmData.segments.quizNoOrder.name}
                    </CardTitle>
                    <CardDescription>{crmData.segments.quizNoOrder.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-bold text-red-600">{crmData.segments.quizNoOrder.count}</span>
                      <Button size="sm" onClick={() => openEmailModal("quizNoOrder")} disabled={crmData.segments.quizNoOrder.count === 0}>
                        <Send className="w-4 h-4 mr-2" />
                        Изпрати Email
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{crmData.segments.quizNoOrder.action}</p>
                    {crmData.segments.quizNoOrder.users.slice(0, 3).map((user, i) => (
                      <div key={i} className="text-xs text-muted-foreground truncate">{user.email}</div>
                    ))}
                    {crmData.segments.quizNoOrder.count > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">...и още {crmData.segments.quizNoOrder.count - 3}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Order No Quiz */}
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader className="bg-amber-50 dark:bg-amber-950">
                    <CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      {crmData.segments.orderNoQuiz.name}
                    </CardTitle>
                    <CardDescription>{crmData.segments.orderNoQuiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-bold text-amber-600">{crmData.segments.orderNoQuiz.count}</span>
                      <Button size="sm" onClick={() => openEmailModal("orderNoQuiz")} disabled={crmData.segments.orderNoQuiz.count === 0}>
                        <Send className="w-4 h-4 mr-2" />
                        Изпрати Email
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{crmData.segments.orderNoQuiz.action}</p>
                    {crmData.segments.orderNoQuiz.users.slice(0, 3).map((user, i) => (
                      <div key={i} className="text-xs text-muted-foreground truncate">{user.email}</div>
                    ))}
                    {crmData.segments.orderNoQuiz.count > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">...и още {crmData.segments.orderNoQuiz.count - 3}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Paid No Quiz */}
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader className="bg-green-50 dark:bg-green-950">
                    <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      {crmData.segments.paidNoQuiz.name}
                    </CardTitle>
                    <CardDescription>{crmData.segments.paidNoQuiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-bold text-green-600">{crmData.segments.paidNoQuiz.count}</span>
                      <Button size="sm" onClick={() => openEmailModal("paidNoQuiz")} disabled={crmData.segments.paidNoQuiz.count === 0}>
                        <Send className="w-4 h-4 mr-2" />
                        Изпрати Email
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{crmData.segments.paidNoQuiz.action}</p>
                    {crmData.segments.paidNoQuiz.users.slice(0, 3).map((user, i) => (
                      <div key={i} className="text-xs text-muted-foreground truncate">{user.email}</div>
                    ))}
                    {crmData.segments.paidNoQuiz.count > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">...и още {crmData.segments.paidNoQuiz.count - 3}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* ============ SESSION DETAIL MODAL ============ */}
        <Dialog open={sessionModalOpen} onOpenChange={setSessionModalOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: CATEGORY_COLORS[selectedSession?.category || ""] + "20" }}>
                  {selectedSession && getCategoryIcon(selectedSession.category)}
                </div>
                <div>
                  <span>Session Journey</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    {selectedSession?.session_id.substring(0, 20)}...
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedSession && (
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3 py-4 border-b">
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: CATEGORY_COLORS[selectedSession.category] }}>
                      {CATEGORY_LABELS[selectedSession.category]}
                    </p>
                    <p className="text-xs text-muted-foreground">Категория</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatTime(selectedSession.stats.totalTime)}</p>
                    <p className="text-xs text-muted-foreground">Общо време</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedSession.stats.maxStep}</p>
                    <p className="text-xs text-muted-foreground">Max Step</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getDeviceIcon(selectedSession.deviceInfo.device)}
                      <p className="text-lg font-medium capitalize">{selectedSession.deviceInfo.device || "Unknown"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Device</p>
                  </div>
                </div>

                {/* Answers Table */}
                <div className="flex-1 overflow-auto py-4">
                  {(() => {
                    // Extract only answer_selected events and group by step (keep last answer per step)
                    const answersByStep = new Map<number, { answer: string; timestamp: string; timeSpent: number | null }>();
                    const timeByStep = new Map<number, number>();

                    // Calculate time spent per step from step_exited events
                    selectedSession.timeline.forEach(event => {
                      if (event.event_type === 'step_exited' && event.time_spent) {
                        timeByStep.set(event.step, event.time_spent);
                      }
                      if (event.event_type === 'answer_selected' && event.answer) {
                        answersByStep.set(event.step, {
                          answer: event.answer,
                          timestamp: event.timestamp,
                          timeSpent: timeByStep.get(event.step) || null
                        });
                      }
                    });

                    // Convert to sorted array
                    const sortedAnswers = Array.from(answersByStep.entries())
                      .sort((a, b) => a[0] - b[0]);

                    if (sortedAnswers.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          Няма записани отговори
                        </div>
                      );
                    }

                    return (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-16 text-center">#</TableHead>
                            <TableHead className="min-w-[200px]">Въпрос</TableHead>
                            <TableHead className="min-w-[150px]">Отговор</TableHead>
                            <TableHead className="w-24 text-center">Време</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedAnswers.map(([step, data]) => {
                            const questionLabel = STEP_LABELS[step] || `Въпрос ${step + 1}`;
                            const isTransition = questionLabel.startsWith('[Transition]');

                            // Skip transition messages in the answers table
                            if (isTransition) return null;

                            return (
                              <TableRow key={step} className="hover:bg-muted/30">
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {step + 1}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">{questionLabel}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium text-primary">
                                    {data.answer.length > 50 ? data.answer.substring(0, 50) + "..." : data.answer}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  {data.timeSpent ? (
                                    <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTime(data.timeSpent)}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    );
                  })()}
                </div>

                {/* Footer with raw timeline toggle */}
                <div className="pt-3 border-t">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      Покажи пълен Timeline ({selectedSession.timeline.length} events)
                    </summary>
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1 bg-muted/30 rounded-lg p-2">
                      {selectedSession.timeline.map((event, i) => (
                        <div key={i} className="flex gap-2 p-1.5 bg-background/50 rounded text-xs">
                          <span className="text-muted-foreground w-16 shrink-0">
                            {new Date(event.timestamp).toLocaleTimeString("bg-BG")}
                          </span>
                          <Badge variant="outline" className="text-[10px] h-5">
                            {event.event_type}
                          </Badge>
                          <span className="text-muted-foreground">Step {event.step}</span>
                          {event.answer && (
                            <span className="text-primary truncate">
                              {event.answer.length > 30 ? event.answer.substring(0, 30) + "..." : event.answer}
                            </span>
                          )}
                          {event.time_spent && (
                            <span className="text-muted-foreground ml-auto">{event.time_spent}s</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ============ EMAIL COMPOSE MODAL ============ */}
        <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Изпрати Email кампания
              </DialogTitle>
              <DialogDescription>
                {selectedSegment && crmData && (
                  <>До {crmData.segments[selectedSegment as keyof typeof crmData.segments]?.count || 0} потребителя</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Email message..."
                  rows={8}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
                  Откажи
                </Button>
                <Button onClick={sendBulkEmail} disabled={sendingEmail || !emailSubject || !emailMessage}>
                  {sendingEmail ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Изпращане...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Изпрати
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </AdminLayout>
  );
}
