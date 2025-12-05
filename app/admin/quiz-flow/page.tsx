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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  RefreshCw,
  Download,
  TrendingDown,
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
  ArrowLeft,
  Eye,
  MousePointer,
  Timer,
  ChevronLeft,
  ChevronRight,
  Database,
  Calendar,
  Info,
  BarChart3,
  Home,
  Building2,
  ShoppingCart,
  CreditCard,
  Package,
} from "lucide-react";

// Interfaces
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
  // Tracking data
  has_tracking: boolean;
  last_step: number;
  total_time: number;
  completed: boolean;
  abandoned: boolean;
  device: string | null;
  utm_source: string | null;
  back_clicks: number;
  offer_selected: string | null;
  // Order data
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

interface QuizCompletion {
  id: string;
  session_id: string;
  email: string | null;
  first_name: string | null;
  category: string;
  total_score: number;
  determined_level: string;
  workout_location: string | null;
  created_at: string;
  breakdown: {
    symptoms: number | null;
    nutrition: number | null;
    training: number | null;
    sleep_recovery: number | null;
    context: number | null;
  };
  order: {
    status: string;
    total_price: number;
    paid_at: string | null;
    order_number: string;
    products: Array<{ title: string; quantity: number; capsules: number }>;
    totalCapsules: number;
  } | null;
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
  summary: {
    message: string;
  };
}

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

const DEVICE_COLORS: Record<string, string> = {
  mobile: "#22c55e",
  tablet: "#f59e0b",
  desktop: "#3b82f6",
  unknown: "#6b7280",
};

// Question labels matching actual quiz structure (26 questions + email)
// Based on energy.json: 26 questions (step 0-25), email is step 26
// All 3 categories (libido/energy/muscle) follow similar structure
const STEP_LABELS: Record<number, string> = {
  0: "Възраст",                       // eng_age - Каква е Вашата възраст?
  1: "Основен проблем",              // eng_main_problem - Кой от следните проблеми...
  2: "Име",                           // eng_name - Как да се обръщаме към Вас?
  3: "Професия",                      // eng_profession - С какво се занимавате?
  4: "Работен стрес",                // eng_work_stress - Доколко е стресираща работата?
  5: "[Transition] Телесни показатели", // eng_transition_body_metrics
  6: "Височина",                      // eng_height - Каква е Вашата височина?
  7: "Тегло",                         // eng_weight - Какво е Вашето тегло?
  8: "Подкожни мазнини",             // eng_body_fat - Какъв % подкожни мазнини?
  9: "[Transition] Timeline",        // eng_transition_timeline - траектория на възстановяване
  10: "Хранителен режим",            // eng_nutrition_regime - Какъв е хранителният режим?
  11: "Пушене",                      // eng_smoking - Пушите ли?
  12: "Алкохол",                     // eng_alcohol - Колко често консумирате алкохол?
  13: "Сън (часове)",                // eng_sleep_hours - Колко часа спите средно?
  14: "[Transition] Навици",         // eng_transition_habits - Благодаря за откровеността
  15: "Кога сте уморен",             // eng_tired_time - През коя част от деня сте уморен?
  16: "Ниво на енергия",             // eng_energy_level - Оценете енергията 1-10
  17: "Разочарование",               // eng_frustration - Какво Ви разочарова най-много?
  18: "Какво бих променил",          // eng_change_one_thing - Ако можехте да промените...
  19: "[Transition] Social Proof",   // eng_transition_social_proof - Не сте сам в това
  20: "Опитвани решения",            // eng_tried_solutions - Опитвали ли сте вече...
  21: "Важен фактор при избор",      // eng_important_factor - Какво е най-важно?
  22: "Визия (текст)",               // eng_vision - Ако проблемът е решен след 30 дни...
  23: "Локация тренировка",          // eng_workout_location - Къде предпочитате да тренирате?
  24: "Хранителни предпочитания",    // eng_dietary_preference - Имате ли ограничения?
  25: "[Transition] Резултати",      // eng_transition_results - Отлична работа!
  26: "Email Capture",               // Final step - email collection
  27: "Оферта Избор",                // Results page - offer selection
};

// Human-readable answer labels for common option IDs
// Maps option.id from quiz JSON to readable Bulgarian text
const ANSWER_LABELS: Record<string, string> = {
  // Age options
  age_25_35: "25-35 години",
  age_36_45: "36-45 години",
  age_46_55: "46-55 години",
  age_56_plus: "56+ години",

  // Main problem (energy)
  problem_fatigue: "Постоянна умора",
  problem_brain_fog: "Мозъчна мъгла",
  problem_motivation: "Липса на мотивация",
  problem_endurance: "Ниска издръжливост",

  // Work stress
  stress_low: "Ниско",
  stress_moderate: "Умерено",
  stress_high: "Високо",
  stress_extreme: "Екстремно",

  // Height
  height_160_170: "160-170 см",
  height_171_180: "171-180 см",
  height_181_190: "181-190 см",
  height_191_plus: "191+ см",

  // Weight
  weight_60_75: "60-75 кг",
  weight_76_85: "76-85 кг",
  weight_86_95: "86-95 кг",
  weight_96_110: "96-110 кг",
  weight_111_plus: "111+ кг",

  // Body fat
  bf_8_12: "8-12% (атлетична)",
  bf_13_17: "13-17% (добра форма)",
  bf_18_22: "18-22% (средна)",
  bf_23_27: "23-27% (наднормено)",
  bf_28_plus: "28%+ (затлъстяване)",

  // Nutrition
  nutrition_high_protein_fat: "Високопротеинов",
  nutrition_balanced: "Балансиран",
  nutrition_high_carb: "Високовъглехидратен",
  nutrition_low_fat: "Нискомазнинен",
  nutrition_irregular: "Нередовен",

  // Smoking
  smoke_never: "Не, никога",
  smoke_quit: "Отказал преди 1+ година",
  smoke_occasional: "Понякога",
  smoke_regular: "До 10 цигари/ден",
  smoke_heavy: "Над 10 цигари/ден",

  // Alcohol
  alcohol_never: "Никога/рядко",
  alcohol_occasional: "1-2 пъти месечно",
  alcohol_weekly: "1-2 пъти седмично",
  alcohol_frequent: "3-4 пъти седмично",
  alcohol_daily: "Ежедневно",

  // Sleep
  sleep_optimal: "7-9 часа (оптимално)",
  sleep_6_7: "6-7 часа",
  sleep_less_6: "Под 6 часа",
  sleep_more_9: "Над 9 часа",
  sleep_irregular: "Нередовно",

  // Tired time
  tired_morning: "Сутрин",
  tired_afternoon: "Следобед (14-16ч)",
  tired_evening: "Вечер",
  tired_all_day: "Целия ден",

  // Energy level
  energy_excellent: "8-10/10 (отлично)",
  energy_good: "6-7/10 (добро)",
  energy_moderate: "4-5/10 (средно)",
  energy_low: "2-3/10 (ниско)",
  energy_very_low: "0-1/10 (много ниско)",

  // Frustration
  frustration_work: "Неефективност в работата",
  frustration_hobbies: "Нямам енергия за хобита",
  frustration_social: "Уморен за социални контакти",
  frustration_focus: "Трудна концентрация",

  // Change one thing
  change_morning_energy: "Събуждане с енергия",
  change_sustained_energy: "Стабилна енергия без спадове",
  change_mental_clarity: "Бистър ум и фокус",
  change_motivation: "Да възвърна мотивацията",

  // Tried solutions
  tried_supplements: "Добавки (витамини и др.)",
  tried_lifestyle: "Промени в начина на живот",
  tried_medical: "Медицински консултации",
  tried_nothing: "Първи сериозен опит",

  // Important factor
  factor_natural: "Естествено и безопасно",
  factor_proven: "Доказана ефективност",
  factor_simple: "Лесно за прилагане",
  factor_fast: "Бързи резултати",

  // Workout location
  location_home: "Вкъщи",
  location_gym: "Фитнес зала",

  // Dietary preference
  diet_omnivor: "Ям всичко",
  diet_pescatarian: "Вегетарианец + риба",
  diet_vegetarian: "Вегетарианец",
  diet_vegan: "Веган",

  // Offer selection (Results page)
  testoup_3months: "3x TestoUP (90 дни)",
  free_sample_7days: "Безплатна проба 7 дни",
  login_app: "Вход в приложението",
};

// Helper function to get readable answer
const getReadableAnswer = (answerId: string | null): string => {
  if (!answerId) return "";
  return ANSWER_LABELS[answerId] || answerId;
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  step_entered: "Влезе в стъпка",
  step_exited: "Излезе от стъпка",
  answer_selected: "Избра отговор",
  back_clicked: "Натисна Назад",
  quiz_abandoned: "Напусна Quiz",
  page_hidden: "Скри страницата",
  page_visible: "Върна се",
  quiz_completed: "Завърши Quiz",
  results_viewed: "Видя резултатите",
  offer_clicked: "Кликна оферта",
};

export default function QuizFlowDashboard() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [dropOffData, setDropOffData] = useState<any>(null);
  const [sessionsData, setSessionsData] = useState<any>(null);
  const [completionsData, setCompletionsData] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"stats" | "funnel" | "dropoffs" | "sessions" | "completions">("completions");

  // Sessions pagination
  const [sessionsPage, setSessionsPage] = useState(1);
  const sessionsPageSize = 50;

  // Completions pagination
  const [completionsPage, setCompletionsPage] = useState(1);
  const completionsPageSize = 50;

  // Session detail modal
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";

      const [statsRes, funnelRes, dropOffRes, sessionsRes, completionsRes, overviewRes] = await Promise.all([
        fetch(`${baseUrl}/api/admin/quiz-flow?view=stats&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=funnel&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=dropoffs&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=sessions&days=0${categoryParam}&limit=${sessionsPageSize}&offset=0`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=completions&days=0${categoryParam}&limit=${completionsPageSize}&offset=0`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=overview${categoryParam}`),
      ]);

      if (statsRes.ok) setStatsData(await statsRes.json());
      if (funnelRes.ok) setFunnelData(await funnelRes.json());
      if (dropOffRes.ok) setDropOffData(await dropOffRes.json());
      if (sessionsRes.ok) {
        setSessionsData(await sessionsRes.json());
        setSessionsPage(1);
      }
      if (completionsRes.ok) {
        setCompletionsData(await completionsRes.json());
        setCompletionsPage(1);
      }
      if (overviewRes.ok) {
        setOverviewData(await overviewRes.json());
      }
    } catch (error) {
      console.error("Error fetching quiz flow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionsPage = async (page: number) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const offset = (page - 1) * sessionsPageSize;

      const res = await fetch(
        `${baseUrl}/api/admin/quiz-flow?view=sessions&days=0${categoryParam}&limit=${sessionsPageSize}&offset=${offset}`
      );

      if (res.ok) {
        setSessionsData(await res.json());
        setSessionsPage(page);
      }
    } catch (error) {
      console.error("Error fetching sessions page:", error);
    }
  };

  const fetchCompletionsPage = async (page: number) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const offset = (page - 1) * completionsPageSize;

      const res = await fetch(
        `${baseUrl}/api/admin/quiz-flow?view=completions&days=0${categoryParam}&limit=${completionsPageSize}&offset=${offset}`
      );

      if (res.ok) {
        setCompletionsData(await res.json());
        setCompletionsPage(page);
      }
    } catch (error) {
      console.error("Error fetching completions page:", error);
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

  const exportToCSV = () => {
    if (!sessionsData) return;

    let csv = "Quiz Flow Report\n\n";
    csv += `Date Range: Last ${selectedDays} days\n`;
    csv += `Category: ${categoryFilter}\n\n`;
    csv += "Sessions\n";
    csv += "Session ID,Category,Device,UTM Source,Last Step,Total Time,Completed,Abandoned,Back Clicks,Started At\n";
    sessionsData.sessions.forEach((s: Session) => {
      csv += `${s.session_id},${s.category},${s.device || 'unknown'},${s.utm_source || 'direct'},${s.last_step},${s.total_time},${s.completed},${s.abandoned},${s.back_clicks},${s.started_at}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-flow-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Зареждане на quiz flow данни...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Prepare device pie chart data
  const deviceChartData = statsData?.deviceBreakdown
    ? Object.entries(statsData.deviceBreakdown)
        .filter(([_, count]) => count > 0)
        .map(([device, count]) => ({
          name: device === "mobile" ? "Мобилен" : device === "tablet" ? "Таблет" : device === "desktop" ? "Десктоп" : "Неизвестен",
          value: count,
          fill: DEVICE_COLORS[device] || "#6b7280",
        }))
    : [];

  // Prepare funnel chart data
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

  // Prepare drop-off chart data
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

  // Prepare avg time chart data
  const prepareAvgTimeChartData = () => {
    if (!statsData?.avgTimePerStep) return [];
    return Object.entries(statsData.avgTimePerStep)
      .map(([step, time]) => ({
        step: parseInt(step),
        name: STEP_LABELS[parseInt(step)] || `Step ${step}`,
        time,
      }))
      .sort((a, b) => a.step - b.step);
  };

  const funnelChartData = prepareFunnelChartData();
  const dropOffChartData = prepareDropOffChartData();
  const avgTimeChartData = prepareAvgTimeChartData();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Quiz Flow Анализ
            </h1>
            <p className="text-muted-foreground mt-1">
              Подробно проследяване на потребителското поведение
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1">
              {[7, 14, 30].map((days) => (
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
                Започнали
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsData?.overview.totalSessions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                за {selectedDays} дни
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Завършили
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {statsData?.overview.completedSessions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {statsData?.overview.completionRate || 0}% completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Отпаднали
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {statsData?.overview.abandonedSessions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {100 - (statsData?.overview.completionRate || 0)}% drop-off
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Напуснали
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {statsData?.overview.abandonmentEvents || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                abandon events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Най-лош Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {dropOffChartData.length > 0
                  ? STEP_LABELS[dropOffChartData[0].step] || `Step ${dropOffChartData[0].step}`
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dropOffChartData.length > 0 ? `${dropOffChartData[0].count} отпаднали` : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Status Banner */}
        {overviewData && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-500" />
                    <span><strong>{overviewData.completions.total}</strong> Quiz завършени</span>
                    <span className="text-muted-foreground text-xs">
                      ({overviewData.completions.firstCompletion ? new Date(overviewData.completions.firstCompletion).toLocaleDateString('bg-BG') : 'N/A'} - сега)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span><strong>{overviewData.tracking.totalSessions}</strong> Step-tracked сесии</span>
                    <span className="text-muted-foreground text-xs">
                      (от {overviewData.tracking.firstEvent ? new Date(overviewData.tracking.firstEvent).toLocaleDateString('bg-BG') : 'N/A'})
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Step-by-step tracking беше добавен на {overviewData.tracking.firstEvent ? new Date(overviewData.tracking.firstEvent).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}.
                  За пълен преглед на всички quiz резултати използвай таба "Всички Резултати".
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          <Button variant={activeTab === "completions" ? "default" : "ghost"} onClick={() => setActiveTab("completions")}>
            <Database className="w-4 h-4 mr-2" />
            Всички Резултати
            {overviewData && <Badge variant="secondary" className="ml-2 text-xs">{overviewData.completions.total}</Badge>}
          </Button>
          <Button variant={activeTab === "stats" ? "default" : "ghost"} onClick={() => setActiveTab("stats")}>
            <Activity className="w-4 h-4 mr-2" />
            Статистики
          </Button>
          <Button variant={activeTab === "funnel" ? "default" : "ghost"} onClick={() => setActiveTab("funnel")}>
            <TrendingDown className="w-4 h-4 mr-2" />
            Funnel
          </Button>
          <Button variant={activeTab === "dropoffs" ? "default" : "ghost"} onClick={() => setActiveTab("dropoffs")}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Drop-offs
          </Button>
          <Button variant={activeTab === "sessions" ? "default" : "ghost"} onClick={() => setActiveTab("sessions")}>
            <Users className="w-4 h-4 mr-2" />
            Sessions
          </Button>
        </div>

        {/* ============ COMPLETIONS TAB ============ */}
        {activeTab === "completions" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Всички Quiz Резултати ({completionsData?.totalCompletions || 0})
                </span>
                {completionsData?.pagination && (
                  <span className="text-sm font-normal text-muted-foreground">
                    Показване {((completionsPage - 1) * completionsPageSize) + 1}-{Math.min(completionsPage * completionsPageSize, completionsData.totalCompletions)} от {completionsData.totalCompletions}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Пълен списък на всички завършени quiz-ове от quiz_results_v2 таблицата
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary Stats */}
              {completionsData && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{completionsData.totalCompletions}</p>
                    <p className="text-xs text-muted-foreground">Quiz завършени</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{completionsData.avgScore}</p>
                    <p className="text-xs text-muted-foreground">Среден резултат</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-500">{completionsData.levelDistribution?.low || 0}</p>
                    <p className="text-xs text-muted-foreground">Low Level</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-500">{(completionsData.levelDistribution?.good || 0) + (completionsData.levelDistribution?.optimal || 0)}</p>
                    <p className="text-xs text-muted-foreground">Good/Optimal</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-600">{completionsData.orderStats?.paid || 0}</p>
                    <p className="text-xs text-green-600">Paid Orders</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3 text-center border border-amber-200 dark:border-amber-800">
                    <p className="text-2xl font-bold text-amber-600">{completionsData.orderStats?.pending || 0}</p>
                    <p className="text-xs text-amber-600">Pending Orders</p>
                  </div>
                </div>
              )}

              {completionsData?.completions && completionsData.completions.length > 0 ? (
                <>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Име</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Резултат</TableHead>
                        <TableHead>Ниво</TableHead>
                        <TableHead>Поръчка</TableHead>
                        <TableHead>Локация</TableHead>
                        <TableHead>Дата</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completionsData.completions.map((completion: QuizCompletion) => (
                        <TableRow key={completion.id}>
                          <TableCell>
                            {completion.email ? (
                              <span className="text-sm font-medium text-blue-600">{completion.email}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {completion.first_name || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(completion.category)}
                              {getCategoryBadge(completion.category)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{completion.total_score}</span>
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    completion.total_score >= 70 ? 'bg-green-500' :
                                    completion.total_score >= 50 ? 'bg-amber-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${completion.total_score}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                completion.determined_level === 'optimal' ? 'border-green-500 text-green-600' :
                                completion.determined_level === 'good' ? 'border-blue-500 text-blue-600' :
                                completion.determined_level === 'moderate' ? 'border-amber-500 text-amber-600' :
                                'border-red-500 text-red-600'
                              }
                            >
                              {completion.determined_level === 'optimal' ? 'Оптимално' :
                               completion.determined_level === 'good' ? 'Добро' :
                               completion.determined_level === 'moderate' ? 'Умерено' :
                               'Ниско'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {completion.order ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  {completion.order.status === 'paid' ? (
                                    <Badge className="bg-green-500 text-white text-xs">
                                      <CreditCard className="w-3 h-3 mr-1" />
                                      Paid {completion.order.total_price} лв
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">
                                      <Package className="w-3 h-3 mr-1" />
                                      Pending {completion.order.total_price} лв
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {completion.order.products?.map((p, i) => (
                                    <span key={i}>
                                      {p.quantity}x {p.title?.replace('TestoUP - Натурална Тесто Формула', 'TestoUP').replace('TESTOGRAPH', 'App')}
                                      {i < completion.order!.products.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-xs font-medium text-purple-600">
                                  {completion.order.totalCapsules} капсули
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-red-400">няма поръчка</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs">
                              {completion.workout_location === 'home' ? (
                                <>
                                  <Home className="w-3 h-3" />
                                  <span>Вкъщи</span>
                                </>
                              ) : completion.workout_location === 'gym' ? (
                                <>
                                  <Building2 className="w-3 h-3" />
                                  <span>Фитнес</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(completion.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {completionsData?.pagination && completionsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Страница {completionsPage} от {completionsData.pagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchCompletionsPage(completionsPage - 1)}
                        disabled={completionsPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Назад
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, completionsData.pagination.totalPages) }).map((_, i) => {
                          let pageNum: number;
                          const totalPages = completionsData.pagination.totalPages;

                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (completionsPage <= 3) {
                            pageNum = i + 1;
                          } else if (completionsPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = completionsPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={completionsPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => fetchCompletionsPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchCompletionsPage(completionsPage + 1)}
                        disabled={!completionsData.pagination.hasMore}
                      >
                        Напред
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Няма quiz резултати</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ============ STATS TAB ============ */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Breakdown
                </CardTitle>
                <CardDescription>Разпределение по устройство</CardDescription>
              </CardHeader>
              <CardContent>
                {deviceChartData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Няма данни</p>
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

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Traffic Sources
                </CardTitle>
                <CardDescription>Откъде идва трафикът</CardDescription>
              </CardHeader>
              <CardContent>
                {!statsData?.trafficSources || statsData.trafficSources.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Няма данни</p>
                ) : (
                  <div className="space-y-3">
                    {statsData.trafficSources.map((source, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm truncate max-w-[200px]" title={source.source}>
                          {source.source === "direct" ? "Direct / Organic" : source.source}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${Math.round((source.count / (statsData.overview.totalSessions || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{source.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Average Time Per Step */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Средно време на стъпка
                </CardTitle>
                <CardDescription>Колко време средно отнема всяка стъпка (в секунди)</CardDescription>
              </CardHeader>
              <CardContent>
                {avgTimeChartData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Няма данни</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={avgTimeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value}s`, "Avg Time"]} />
                      <Bar dataKey="time" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============ FUNNEL TAB ============ */}
        {activeTab === "funnel" && (
          <Card>
            <CardHeader>
              <CardTitle>Quiz Funnel</CardTitle>
              <CardDescription>Брой потребители на всяка стъпка</CardDescription>
            </CardHeader>
            <CardContent>
              {funnelChartData.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Няма данни за този период</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={funnelChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => [`${value} sessions`, "Users"]} />
                    <Bar dataKey="sessions" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                      {funnelChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* ============ DROPOFFS TAB ============ */}
        {activeTab === "dropoffs" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Top Drop-off Points</CardTitle>
                <CardDescription>Стъпките с най-много отпаднали потребители</CardDescription>
              </CardHeader>
              <CardContent>
                {dropOffChartData.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Няма отпаднали потребители</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dropOffChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value} users`, "Drop-offs"]} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {dropOffChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Drop-off Детайли</CardTitle>
              </CardHeader>
              <CardContent>
                {dropOffData?.dropOffs && dropOffData.dropOffs.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Step</TableHead>
                          <TableHead>Описание</TableHead>
                          <TableHead>Отпаднали</TableHead>
                          <TableHead>%</TableHead>
                          <TableHead>Severity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dropOffData.dropOffs.map((d: DropOff) => (
                          <TableRow key={d.step}>
                            <TableCell className="font-mono">#{d.step}</TableCell>
                            <TableCell className="font-medium">{STEP_LABELS[d.step] || `Step ${d.step}`}</TableCell>
                            <TableCell><span className="font-bold">{d.count}</span></TableCell>
                            <TableCell>{d.percentage}%</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  d.percentage > 20 ? "border-red-500 text-red-500" :
                                  d.percentage > 10 ? "border-amber-500 text-amber-500" :
                                  "border-green-500 text-green-500"
                                }
                              >
                                {d.percentage > 20 ? "Critical" : d.percentage > 10 ? "Warning" : "OK"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Няма drop-off данни</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ============ SESSIONS TAB ============ */}
        {activeTab === "sessions" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Всички Потребители ({sessionsData?.totalSessions || 0})
                </span>
                {sessionsData?.pagination && (
                  <span className="text-sm font-normal text-muted-foreground">
                    Показване {((sessionsPage - 1) * sessionsPageSize) + 1}-{Math.min(sessionsPage * sessionsPageSize, sessionsData.totalSessions)} от {sessionsData.totalSessions}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Всички quiz завършвания. Кликни иконата за пълен timeline (само за tracked сесии).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Stats Summary */}
              {sessionsData?.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{sessionsData.totalSessions}</p>
                    <p className="text-xs text-muted-foreground">Общо потребители</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-800">
                    <p className="text-2xl font-bold text-purple-600">{sessionsData.stats.tracked}</p>
                    <p className="text-xs text-purple-600">С пълен tracking</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-600">{sessionsData.stats.paid}</p>
                    <p className="text-xs text-green-600">Paid Orders</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-3 text-center border border-amber-200 dark:border-amber-800">
                    <p className="text-2xl font-bold text-amber-600">{sessionsData.stats.withOrder - sessionsData.stats.paid}</p>
                    <p className="text-xs text-amber-600">Pending Orders</p>
                  </div>
                </div>
              )}

              {sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
                <>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Име</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Резултат</TableHead>
                        <TableHead>Поръчка</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Tracking</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionsData.sessions.map((session: Session) => (
                        <TableRow key={session.session_id} className={`hover:bg-muted/50 ${session.has_tracking ? '' : 'opacity-70'}`}>
                          <TableCell>
                            {session.email ? (
                              <span className="text-sm font-medium text-blue-600">{session.email}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {session.first_name || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(session.category)}
                              {getCategoryBadge(session.category)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{session.total_score}</span>
                              <Badge
                                variant="outline"
                                className={
                                  session.determined_level === 'optimal' ? 'border-green-500 text-green-600 text-xs' :
                                  session.determined_level === 'good' ? 'border-blue-500 text-blue-600 text-xs' :
                                  session.determined_level === 'moderate' ? 'border-amber-500 text-amber-600 text-xs' :
                                  'border-red-500 text-red-600 text-xs'
                                }
                              >
                                {session.determined_level === 'optimal' ? 'Опт' :
                                 session.determined_level === 'good' ? 'Добро' :
                                 session.determined_level === 'moderate' ? 'Умер' :
                                 'Ниско'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {session.order ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  {session.order.status === 'paid' ? (
                                    <Badge className="bg-green-500 text-white text-xs">
                                      <CreditCard className="w-3 h-3 mr-1" />
                                      Paid {session.order.total_price} лв
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">
                                      <Package className="w-3 h-3 mr-1" />
                                      Pending {session.order.total_price} лв
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {session.order.products?.map((p, i) => (
                                    <span key={i}>
                                      {p.quantity}x {p.title?.replace('TestoUP - Натурална Тесто Формула', 'TestoUP').replace('TESTOGRAPH', 'App')}
                                      {i < session.order!.products.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-xs font-medium text-purple-600">
                                  {session.order.totalCapsules} капсули
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-red-400">няма поръчка</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {session.has_tracking ? (
                              <div className="flex items-center gap-1">
                                {getDeviceIcon(session.device)}
                                <span className="text-xs">{session.device || "?"}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {session.has_tracking ? (
                              <Badge className="bg-purple-500 text-white text-xs">
                                <Activity className="w-3 h-3 mr-1" />
                                {formatTime(session.total_time)}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                Без данни
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(session.started_at)}
                          </TableCell>
                          <TableCell>
                            {session.has_tracking ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchSessionDetail(session.session_id)}
                                disabled={loadingSession}
                                title="Виж timeline"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" disabled title="Няма tracking данни">
                                <Eye className="w-4 h-4 opacity-30" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {sessionsData?.pagination && sessionsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Страница {sessionsPage} от {sessionsData.pagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSessionsPage(sessionsPage - 1)}
                        disabled={sessionsPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Назад
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, sessionsData.pagination.totalPages) }).map((_, i) => {
                          let pageNum: number;
                          const totalPages = sessionsData.pagination.totalPages;

                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (sessionsPage <= 3) {
                            pageNum = i + 1;
                          } else if (sessionsPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = sessionsPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={sessionsPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => fetchSessionsPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSessionsPage(sessionsPage + 1)}
                        disabled={!sessionsData.pagination.hasMore}
                      >
                        Напред
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Няма sessions за този период</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Session Detail Modal */}
        <Dialog open={sessionModalOpen} onOpenChange={setSessionModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Session Timeline
              </DialogTitle>
              <DialogDescription>
                {selectedSession?.session_id}
              </DialogDescription>
            </DialogHeader>

            {selectedSession && (
              <div className="space-y-6">
                {/* Progress Bar - Visual Step Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Прогрес</span>
                    <span className="font-medium">
                      {selectedSession.stats.maxStep} / 24 стъпки ({Math.round((selectedSession.stats.maxStep / 24) * 100)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedSession.stats.completed ? "bg-green-500" :
                        selectedSession.stats.abandoned ? "bg-red-500" :
                        "bg-amber-500"
                      }`}
                      style={{ width: `${Math.round((selectedSession.stats.maxStep / 24) * 100)}%` }}
                    />
                  </div>
                  {/* Mini step indicators */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-sm ${
                          i <= selectedSession.stats.maxStep
                            ? selectedSession.stats.completed ? "bg-green-400" : "bg-primary"
                            : "bg-muted"
                        }`}
                        title={STEP_LABELS[i] || `Step ${i}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Session Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Категория</p>
                    {getCategoryBadge(selectedSession.category)}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Device</p>
                    <div className="flex items-center gap-1 font-medium">
                      {getDeviceIcon(selectedSession.deviceInfo.device)}
                      <span className="capitalize">{selectedSession.deviceInfo.device || "?"}</span>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Време</p>
                    <p className="font-bold text-lg">{formatTime(selectedSession.stats.totalTime)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Назад</p>
                    <p className="font-bold text-lg">{selectedSession.stats.backClicks}x</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Статус</p>
                    {selectedSession.stats.completed ? (
                      <Badge className="bg-green-500">Завършен</Badge>
                    ) : selectedSession.stats.abandoned ? (
                      <Badge variant="destructive">Напуснал</Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">Отпаднал</Badge>
                    )}
                  </div>
                </div>

                {/* Traffic Source */}
                {(selectedSession.deviceInfo.utm_source || selectedSession.deviceInfo.referrer) && (
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Traffic Source</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {selectedSession.deviceInfo.utm_source && (
                        <Badge variant="secondary">utm_source: {selectedSession.deviceInfo.utm_source}</Badge>
                      )}
                      {selectedSession.deviceInfo.utm_medium && (
                        <Badge variant="secondary">utm_medium: {selectedSession.deviceInfo.utm_medium}</Badge>
                      )}
                      {selectedSession.deviceInfo.utm_campaign && (
                        <Badge variant="secondary">utm_campaign: {selectedSession.deviceInfo.utm_campaign}</Badge>
                      )}
                      {selectedSession.deviceInfo.referrer && (
                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                          Referrer: {selectedSession.deviceInfo.referrer}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline - Grouped by Step */}
                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeline ({selectedSession.stats.totalEvents} събития)
                  </h4>

                  <div className="relative max-h-[400px] overflow-y-auto pr-2">
                    {/* Group events by step */}
                    {(() => {
                      const groupedByStep: Record<number, typeof selectedSession.timeline> = {};
                      selectedSession.timeline.forEach(event => {
                        if (!groupedByStep[event.step]) {
                          groupedByStep[event.step] = [];
                        }
                        groupedByStep[event.step].push(event);
                      });

                      const steps = Object.keys(groupedByStep).map(Number).sort((a, b) => a - b);

                      return (
                        <div className="space-y-4">
                          {steps.map((stepNum, stepIndex) => {
                            const stepEvents = groupedByStep[stepNum];
                            const enterEvent = stepEvents.find(e => e.event_type === "step_entered");
                            const exitEvent = stepEvents.find(e => e.event_type === "step_exited");
                            const answerEvent = stepEvents.find(e => e.event_type === "answer_selected");
                            const backEvent = stepEvents.find(e => e.event_type === "back_clicked");
                            const abandonEvent = stepEvents.find(e => e.event_type === "quiz_abandoned");
                            const isLastStep = stepIndex === steps.length - 1;

                            return (
                              <div key={stepNum} className="relative">
                                {/* Vertical line connecting steps */}
                                {!isLastStep && (
                                  <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-border" />
                                )}

                                {/* Step header */}
                                <div className="flex items-start gap-3">
                                  {/* Step number circle */}
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                    abandonEvent ? "bg-red-500 text-white" :
                                    answerEvent ? "bg-green-500 text-white" :
                                    exitEvent ? "bg-primary text-primary-foreground" :
                                    "bg-muted text-muted-foreground"
                                  }`}>
                                    {stepNum}
                                  </div>

                                  {/* Step content */}
                                  <div className="flex-1 pb-4">
                                    {/* Step title & time */}
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <span className="font-semibold text-base">
                                          {STEP_LABELS[stepNum] || `Step ${stepNum}`}
                                        </span>
                                        {exitEvent?.time_spent && (
                                          <Badge variant="outline" className="ml-2 text-xs">
                                            <Timer className="w-3 h-3 mr-1" />
                                            {exitEvent.time_spent}s
                                          </Badge>
                                        )}
                                      </div>
                                      {enterEvent && (
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(enterEvent.timestamp).toLocaleTimeString("bg-BG", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                          })}
                                        </span>
                                      )}
                                    </div>

                                    {/* Events for this step */}
                                    <div className="space-y-1.5">
                                      {/* Answer selected - most important */}
                                      {answerEvent && (
                                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 rounded-md px-3 py-2 border border-green-200 dark:border-green-800">
                                          <MousePointer className="w-4 h-4 text-green-600" />
                                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                            Избра: <span className="font-bold">{getReadableAnswer(answerEvent.answer)}</span>
                                          </span>
                                        </div>
                                      )}

                                      {/* Back clicked */}
                                      {backEvent && (
                                        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 rounded-md px-3 py-2 border border-amber-200 dark:border-amber-800">
                                          <ArrowLeft className="w-4 h-4 text-amber-600" />
                                          <span className="text-sm text-amber-700 dark:text-amber-300">
                                            Натисна Назад
                                          </span>
                                        </div>
                                      )}

                                      {/* Page hidden events */}
                                      {stepEvents.filter(e => e.event_type === "page_hidden").map((e, i) => (
                                        <div key={`hidden-${i}`} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-md px-3 py-1.5 border border-gray-200 dark:border-gray-700">
                                          <Eye className="w-3 h-3 text-gray-500" />
                                          <span className="text-xs text-gray-600 dark:text-gray-400">
                                            Скри таба
                                          </span>
                                        </div>
                                      ))}

                                      {/* Abandoned */}
                                      {abandonEvent && (
                                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 rounded-md px-3 py-2 border border-red-200 dark:border-red-800">
                                          <XCircle className="w-4 h-4 text-red-600" />
                                          <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                            Напусна quiz-а тук
                                          </span>
                                        </div>
                                      )}

                                      {/* No answer on this step (just visited) */}
                                      {!answerEvent && !abandonEvent && !backEvent && stepEvents.filter(e => e.event_type === "page_hidden").length === 0 && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Activity className="w-3 h-3" />
                                          <span>Премина без действие</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Device Details (collapsed by default) */}
                <details className="group">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Технически детайли
                    <span className="text-xs">(клик за повече)</span>
                  </summary>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Screen</p>
                      <p>{selectedSession.deviceInfo.screen || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Language</p>
                      <p>{selectedSession.deviceInfo.language || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Timezone</p>
                      <p>{selectedSession.deviceInfo.timezone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p>{formatDate(selectedSession.started_at)}</p>
                    </div>
                  </div>
                </details>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
