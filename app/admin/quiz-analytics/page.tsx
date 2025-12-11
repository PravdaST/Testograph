"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  User,
  Radio,
  Search,
  MessageSquare,
  Filter,
  BarChart2,
  MoreVertical,
  StickyNote,
  Tag,
  Plus,
  MailOpen,
  MousePointerClick,
  Bell,
  BellRing,
  Settings,
  Trash2,
  Power,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataSheet, quizSessionColumns, sessionEventColumns, quizNoOrderColumns, orderNoQuizColumns, orderColumns, conversionColumns } from "@/components/admin/DataSheet";

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
  app_user: {
    is_registered: boolean;
    current_day: number | null;
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
  ageBreakdown: Record<string, number>;
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
  workout_location: string | null;
  created_at: string;
  userJourney: {
    // App Registration (from auth.users)
    isRegistered: boolean;
    registeredAt: string | null;
    lastSignIn: string | null;
    userId: string | null;
    // Order Info
    hasPurchased: boolean;
    orderStatus: string | null;
    orderNumber: string | null;
    totalSpent: number;
    totalCapsules: number;
    orderDate: string | null;
    paidAt: string | null;
    // Inventory
    capsulesRemaining: number;
    daysSupply: number;
    // Activity Stats
    isActive: boolean;
    activityStats: {
      workouts: number;
      meals: number;
      sleep: number;
      testoup: number;
      progressDays: number;
      avgProgressScore: number;
      lastActivity: string | null;
    } | null;
  };
}

interface ConversionStats {
  totalQuizSubmissions: number;
  registeredInApp: number;
  withPaidOrder: number;
  activeInApp: number;
  registrationRate: number;
  purchaseRate: number;
  activeRate: number;
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
  normal: "#f59e0b",  // От базата идва като "normal"
  moderate: "#f59e0b",
  good: "#22c55e",
  optimal: "#10b981",
};

const LEVEL_LABELS: Record<string, string> = {
  low: "Нисък",
  normal: "Нормален",  // От базата идва като "normal"
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

const AGE_COLORS: Record<string, string> = {
  "25-35": "#3b82f6",
  "36-45": "#22c55e",
  "46-55": "#f59e0b",
  "56+": "#ef4444",
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

type TabType = "dashboard" | "analytics" | "sessions-crm";

// Session Explorer interfaces
interface SessionExplorerData {
  summary: {
    totalSessions: number;
    completedSessions: number;
    abandonedSessions: number;
    completionRate: number;
    avgTotalTime: number;
  };
  dropoffFunnel: Array<{
    step: number;
    reached: number;
    dropoff: number;
    dropoffRate: number;
  }>;
  problemQuestions: Array<{
    step: number;
    question_id: string | null;
    avgTime: number;
    dropoffCount: number;
    dropoffRate: number;
    reason: string;
  }>;
  abandonedSessions: {
    total: number;
    offset: number;
    limit: number;
    data: Array<{
      session_id: string;
      category: string | null;
      started_at: string;
      last_activity: string;
      max_step: number;
      total_time: number;
      device: string | null;
      utm_source: string | null;
      event_count: number;
      last_answer: string | null;
    }>;
  };
  recentCompleted: Array<{
    session_id: string;
    category: string | null;
    email: string | null;
    first_name: string | null;
    total_score: number | null;
    level: string | null;
    total_time: number;
    completed_at: string | null;
  }>;
}

interface SessionTimelineData {
  session_id: string;
  category: string | null;
  started_at: string;
  last_activity: string;
  is_completed: boolean;
  completion_data: {
    email: string;
    first_name: string | null;
    total_score: number;
    level: string;
    completed_at: string;
  } | null;
  device: string | null;
  utm_source: string | null;
  referrer: string | null;
  max_step: number;
  total_time: number;
  event_count: number;
  timeline: Array<{
    step: number;
    question_id: string | null;
    event_type: string;
    answer: string | null;
    time_spent: number | null;
    timestamp: string;
  }>;
  answers: Array<{
    step: number;
    question_id: string | null;
    answer: string | null;
    time_spent: number | null;
  }>;
}

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
  const [sessionExplorerData, setSessionExplorerData] = useState<SessionExplorerData | null>(null);
  const [sessionTimelineData, setSessionTimelineData] = useState<SessionTimelineData | null>(null);
  const [sessionTimelineModalOpen, setSessionTimelineModalOpen] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [abandonedPage, setAbandonedPage] = useState(1);

  // UI states
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Pagination
  const [sessionsPage, setSessionsPage] = useState(1);
  const [userJourneyPage, setUserJourneyPage] = useState(1);
  const pageSize = 50;

  // Session detail modal
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  // Additional session info from sessions list (email, order, etc.)
  const [selectedSessionInfo, setSelectedSessionInfo] = useState<Session | null>(null);
  // User journey data (app access, order status, etc.)
  const [selectedUserJourney, setSelectedUserJourney] = useState<any | null>(null);

  // CRM email compose
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Live sessions (real-time monitoring)
  interface LiveSession {
    session_id: string;
    category: string | null;
    started_at: string;
    current_step: number;
    last_activity: string;
  }
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);

  // Metric card detail dialog
  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'total' | 'tracked' | 'completed' | 'abandoned' | null>(null);

  // DataSheet for full data access
  const [dataSheetOpen, setDataSheetOpen] = useState(false);
  const [dataSheetConfig, setDataSheetConfig] = useState<{
    title: string;
    description: string;
    dataType: string;
    additionalFilters?: Record<string, string>;
  } | null>(null);

  // Sub-tab for sessions-crm
  const [sessionsSubTab, setSessionsSubTab] = useState<'users' | 'crm' | 'explorer' | 'cohort' | 'retention' | 'emails' | 'heatmap'>('users');

  // Cohort Analysis state
  const [cohortData, setCohortData] = useState<{
    groupBy: string;
    cohorts: Array<{
      period: string;
      startDate: string;
      quizCompletions: number;
      withOrder: number;
      withPaidOrder: number;
      withAppRegistration: number;
      totalRevenue: number;
      orderRate: number;
      paidRate: number;
      appRate: number;
      avgRevenue: number;
      categoryBreakdown: { libido: number; muscle: number; energy: number };
      levelBreakdown: { low: number; normal: number; good: number };
    }>;
    summary: {
      totalCohorts: number;
      totalQuizCompletions: number;
      avgOrderRate: number;
      avgPaidRate: number;
      avgAppRate: number;
      totalRevenue: number;
    };
  } | null>(null);
  const [cohortGroupBy, setCohortGroupBy] = useState<'week' | 'month'>('week');
  const [isLoadingCohort, setIsLoadingCohort] = useState(false);

  // Retention Metrics state
  // Email Campaign Tracking state
  const [emailCampaignData, setEmailCampaignData] = useState<{
    stats: {
      total: number;
      sent: number;
      pending: number;
      failed: number;
      bounced: number;
      opened: number;
      clicked: number;
      openRate: number;
      clickRate: number;
      clickToOpenRate: number;
      deliveryRate: number;
      bounceRate: number;
    };
    templateStats: Array<{ name: string; sent: number; opened: number; clicked: number }>;
    dailyTrend: Array<{ date: string; sent: number; opened: number; clicked: number }>;
    recentEmails: Array<{
      id: string;
      recipient: string;
      recipientName: string | null;
      subject: string;
      templateName: string | null;
      status: string;
      sentAt: string | null;
      openedAt: string | null;
      clickedAt: string | null;
      isBulk: boolean;
      sentByEmail: string;
    }>;
    topRecipients: Array<{ email: string; count: number; opened: number; clicked: number }>;
  } | null>(null);
  const [isLoadingEmailCampaigns, setIsLoadingEmailCampaigns] = useState(false);

  const [retentionData, setRetentionData] = useState<{
    metrics: {
      dau: number;
      wau: number;
      mau: number;
      totalUsers: number;
      weeklyChurn: number;
      monthlyChurn: number;
      wauGrowth: number;
      mauGrowth: number;
    };
    dailyTrend: Array<{
      date: string;
      activeUsers: number;
      newUsers: number;
    }>;
    weeklyTrend: Array<{
      week: string;
      activeUsers: number;
      newUsers: number;
      retention: number;
    }>;
    engagementByType: {
      quiz: number;
      orders: number;
      workouts: number;
      meals: number;
      supplements: number;
    };
  } | null>(null);
  const [isLoadingRetention, setIsLoadingRetention] = useState(false);

  // Saved Filters state
  interface SavedFilter {
    id: string;
    name: string;
    description: string | null;
    filter_config: {
      selectedDays: number;
      categoryFilter: string;
      sessionsSubTab?: string;
      cohortGroupBy?: string;
    };
    created_at: string;
    use_count: number;
  }
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterDescription, setNewFilterDescription] = useState('');
  const [isSavingFilter, setIsSavingFilter] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Comparison Mode state
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState<'previous' | 'custom'>('previous');
  const [comparisonCategory, setComparisonCategory] = useState<string>('none');
  const [comparisonData, setComparisonData] = useState<{
    current: {
      period: string;
      category: string;
      stats: {
        totalSessions: number;
        completedSessions: number;
        abandonedSessions: number;
        completionRate: number;
      };
    };
    comparison: {
      period: string;
      category: string;
      stats: {
        totalSessions: number;
        completedSessions: number;
        abandonedSessions: number;
        completionRate: number;
      };
    };
    changes: {
      totalSessions: { value: number; percent: number };
      completedSessions: { value: number; percent: number };
      abandonedSessions: { value: number; percent: number };
      completionRate: { value: number; percent: number };
    };
  } | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  // Alerts state
  interface AdminAlert {
    id: string;
    name: string;
    description: string | null;
    metric_type: string;
    condition: string;
    threshold: number;
    category: string;
    is_active: boolean;
    last_triggered_at: string | null;
    trigger_count: number;
    created_at: string;
  }
  interface AlertNotification {
    id: string;
    alert_id: string;
    triggered_at: string;
    metric_value: number;
    threshold_value: number;
    message: string;
    is_read: boolean;
    admin_alerts?: { name: string; metric_type: string };
  }
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [alertNotifications, setAlertNotifications] = useState<AlertNotification[]>([]);
  const [alertsUnreadCount, setAlertsUnreadCount] = useState(0);
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [createAlertDialogOpen, setCreateAlertDialogOpen] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    description: '',
    metric_type: 'completion_rate',
    condition: 'below',
    threshold: 50,
    category: 'all',
  });

  // Step Heatmap
  interface HeatmapStep {
    questionId: string;
    stepNumber: number;
    sampleCount: number;
    avgTime: number;
    medianTime: number;
    minTime: number;
    maxTime: number;
    p90Time: number;
    categoryBreakdown: { category: string; count: number; avgTime: number }[];
  }
  interface HeatmapSummary {
    totalSamples: number;
    avgTimePerStep: number;
    totalQuestions: number;
    slowestQuestions: HeatmapStep[];
    fastestQuestions: HeatmapStep[];
    timeBuckets: Record<string, number>;
  }
  const [heatmapData, setHeatmapData] = useState<HeatmapStep[]>([]);
  const [heatmapSummary, setHeatmapSummary] = useState<HeatmapSummary | null>(null);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);

  // User search and filter
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'purchased' | 'not-purchased' | 'in-app' | 'active'>('all');
  const [isSearching, setIsSearching] = useState(false);

  // ============ DATA FETCHING ============
  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";

      const [statsRes, funnelRes, dropOffRes, sessionsRes, trendsRes, userJourneyRes, overviewRes, crmRes, sessionExplorerRes, cohortRes] = await Promise.all([
        fetch(`${baseUrl}/api/admin/quiz-flow?view=stats&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=funnel&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=dropoffs&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=sessions&days=0${categoryParam}&limit=${pageSize}&offset=0`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=trends&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=user-journey&days=0${categoryParam}&limit=${pageSize}&offset=0`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=overview${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=crm`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=session-explorer&days=0${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=cohort&groupBy=${cohortGroupBy}`),
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
      if (sessionExplorerRes.ok) {
        setSessionExplorerData(await sessionExplorerRes.json());
        setAbandonedPage(1);
      }
      if (cohortRes.ok) setCohortData(await cohortRes.json());
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

  const fetchUserJourneyPage = async (page: number, search?: string, status?: string) => {
    try {
      setIsSearching(true);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const statusParam = status && status !== 'all' ? `&status=${status}` : "";
      const offset = (page - 1) * pageSize;

      const res = await fetch(
        `${baseUrl}/api/admin/quiz-flow?view=user-journey&days=0${categoryParam}${searchParam}${statusParam}&limit=${pageSize}&offset=${offset}`
      );

      if (res.ok) {
        setUserJourneyData(await res.json());
        setUserJourneyPage(page);
      }
    } catch (error) {
      console.error("Error fetching user journey page:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // CSV Export state
  const [isExporting, setIsExporting] = useState(false);

  // Quick Actions state - Notes dialog
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedUserForNote, setSelectedUserForNote] = useState<{ email: string; name: string } | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [userNotes, setUserNotes] = useState<{ id: string; note: string; created_at: string; created_by: string }[]>([]);

  // Fetch notes for a user
  const fetchUserNotes = async (email: string) => {
    try {
      const res = await fetch(`/api/admin/user-notes?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setUserNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // Add note to user
  const addNoteToUser = async () => {
    if (!selectedUserForNote || !newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const res = await fetch("/api/admin/user-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUserForNote.email,
          note: newNote.trim(),
        }),
      });

      if (res.ok) {
        toast({ title: "Бележката е добавена" });
        setNewNote("");
        fetchUserNotes(selectedUserForNote.email);
      } else {
        throw new Error("Failed to add note");
      }
    } catch (error) {
      toast({ title: "Грешка при добавяне на бележка", variant: "destructive" });
    } finally {
      setIsAddingNote(false);
    }
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/admin/user-notes?id=${noteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({ title: "Бележката е изтрита" });
        if (selectedUserForNote) {
          fetchUserNotes(selectedUserForNote.email);
        }
      }
    } catch (error) {
      toast({ title: "Грешка при изтриване", variant: "destructive" });
    }
  };

  // Open notes dialog for a user
  const openNotesDialog = (email: string, name: string) => {
    setSelectedUserForNote({ email, name });
    setNewNote("");
    setUserNotes([]);
    fetchUserNotes(email);
    setNotesDialogOpen(true);
  };

  // Fetch cohort data with specific groupBy
  const fetchCohortData = async (groupBy: 'week' | 'month') => {
    setIsLoadingCohort(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/quiz-flow?view=cohort&groupBy=${groupBy}`);
      if (res.ok) {
        setCohortData(await res.json());
        setCohortGroupBy(groupBy);
      }
    } catch (error) {
      console.error("Error fetching cohort data:", error);
    } finally {
      setIsLoadingCohort(false);
    }
  };

  // Fetch retention metrics
  const fetchRetentionData = async () => {
    setIsLoadingRetention(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/quiz-flow?view=retention`);
      if (res.ok) {
        setRetentionData(await res.json());
      }
    } catch (error) {
      console.error("Error fetching retention data:", error);
    } finally {
      setIsLoadingRetention(false);
    }
  };

  // Fetch email campaign data
  const fetchEmailCampaignData = async () => {
    setIsLoadingEmailCampaigns(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/quiz-flow?view=email-campaigns`);
      if (res.ok) {
        setEmailCampaignData(await res.json());
      }
    } catch (error) {
      console.error("Error fetching email campaign data:", error);
    } finally {
      setIsLoadingEmailCampaigns(false);
    }
  };

  // Fetch comparison data
  const fetchComparisonData = async () => {
    if (!comparisonEnabled) return;

    setIsLoadingComparison(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

      // Calculate comparison period dates
      let compDays = selectedDays;
      if (selectedDays === -1) compDays = 365; // Default to year for "all time"

      // Current period
      const currentCategoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const currentRes = await fetch(`${baseUrl}/api/admin/quiz-flow?view=stats&days=${selectedDays}${currentCategoryParam}`);

      // Comparison period (previous period or different category)
      let comparisonRes;
      let compPeriodLabel = "";
      let compCategoryLabel = "";

      if (comparisonCategory !== 'none' && comparisonCategory !== categoryFilter) {
        // Compare with different category (same time period)
        const compCategoryParam = `&category=${comparisonCategory}`;
        comparisonRes = await fetch(`${baseUrl}/api/admin/quiz-flow?view=stats&days=${selectedDays}${compCategoryParam}`);
        compPeriodLabel = selectedDays === -1 ? "Всички" : `${selectedDays} дни`;
        compCategoryLabel = comparisonCategory;
      } else {
        // Compare with previous period
        // For 30 days current, compare with 30-60 days ago
        const comparisonRes2 = await fetch(`${baseUrl}/api/admin/quiz-flow?view=stats&days=${compDays * 2}${currentCategoryParam}`);
        comparisonRes = comparisonRes2;
        compPeriodLabel = `Предишни ${compDays} дни`;
        compCategoryLabel = categoryFilter;
      }

      if (currentRes.ok && comparisonRes.ok) {
        const currentData = await currentRes.json();
        const compData = await comparisonRes.json();

        // For previous period comparison, subtract current from extended period
        let compStats = compData.overview;
        if (comparisonCategory === 'none' || comparisonCategory === categoryFilter) {
          // Calculate the previous period stats by subtracting
          compStats = {
            totalSessions: Math.max(0, compData.overview.totalSessions - currentData.overview.totalSessions),
            completedSessions: Math.max(0, compData.overview.completedSessions - currentData.overview.completedSessions),
            abandonedSessions: Math.max(0, compData.overview.abandonedSessions - currentData.overview.abandonedSessions),
            completionRate: compData.overview.totalSessions - currentData.overview.totalSessions > 0
              ? ((compData.overview.completedSessions - currentData.overview.completedSessions) /
                 (compData.overview.totalSessions - currentData.overview.totalSessions) * 100)
              : 0
          };
        }

        // Calculate changes
        const calcChange = (current: number, comp: number) => ({
          value: current - comp,
          percent: comp > 0 ? ((current - comp) / comp * 100) : (current > 0 ? 100 : 0)
        });

        setComparisonData({
          current: {
            period: selectedDays === -1 ? "Всички" : `${selectedDays} дни`,
            category: categoryFilter === "all" ? "Всички" : categoryFilter,
            stats: {
              totalSessions: currentData.overview.totalSessions,
              completedSessions: currentData.overview.completedSessions,
              abandonedSessions: currentData.overview.abandonedSessions,
              completionRate: currentData.overview.completionRate,
            }
          },
          comparison: {
            period: compPeriodLabel,
            category: compCategoryLabel === "all" ? "Всички" : compCategoryLabel,
            stats: {
              totalSessions: compStats.totalSessions,
              completedSessions: compStats.completedSessions,
              abandonedSessions: compStats.abandonedSessions,
              completionRate: compStats.completionRate,
            }
          },
          changes: {
            totalSessions: calcChange(currentData.overview.totalSessions, compStats.totalSessions),
            completedSessions: calcChange(currentData.overview.completedSessions, compStats.completedSessions),
            abandonedSessions: calcChange(currentData.overview.abandonedSessions, compStats.abandonedSessions),
            completionRate: calcChange(currentData.overview.completionRate, compStats.completionRate),
          }
        });
      }
    } catch (error) {
      console.error("Error fetching comparison data:", error);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  // Alerts functions
  const fetchAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/alerts`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setAlertsUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const fetchAlertNotifications = async () => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/alerts?view=notifications`);
      if (res.ok) {
        const data = await res.json();
        setAlertNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching alert notifications:", error);
    }
  };

  const createAlert = async () => {
    if (!newAlert.name.trim()) {
      toast({ title: "Моля въведи име за алерта", variant: "destructive" });
      return;
    }

    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });

      if (res.ok) {
        toast({ title: "Алертът е създаден успешно!" });
        setCreateAlertDialogOpen(false);
        setNewAlert({
          name: '',
          description: '',
          metric_type: 'completion_rate',
          condition: 'below',
          threshold: 50,
          category: 'all',
        });
        fetchAlerts();
      } else {
        throw new Error("Failed to create alert");
      }
    } catch (error) {
      console.error("Error creating alert:", error);
      toast({ title: "Грешка при създаване на алерт", variant: "destructive" });
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      await fetch(`${baseUrl}/api/admin/alerts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: alertId, is_active: !isActive }),
      });
      fetchAlerts();
    } catch (error) {
      console.error("Error toggling alert:", error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      await fetch(`${baseUrl}/api/admin/alerts?id=${alertId}`, {
        method: "DELETE",
      });
      toast({ title: "Алертът е изтрит" });
      fetchAlerts();
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      await fetch(`${baseUrl}/api/admin/alerts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_read: true }),
      });
      setAlertsUnreadCount(0);
      setAlertNotifications([]);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Step Heatmap functions
  const fetchHeatmapData = async () => {
    setIsLoadingHeatmap(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const res = await fetch(`${baseUrl}/api/admin/quiz-flow?view=step-heatmap&days=${selectedDays}${categoryParam}`);
      if (res.ok) {
        const data = await res.json();
        setHeatmapData(data.heatmapData || []);
        setHeatmapSummary(data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
    } finally {
      setIsLoadingHeatmap(false);
    }
  };

  // Saved Filters functions
  const fetchSavedFilters = async () => {
    setIsLoadingFilters(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/saved-filters`);
      if (res.ok) {
        const data = await res.json();
        setSavedFilters(data.filters || []);
      }
    } catch (error) {
      console.error("Error fetching saved filters:", error);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const saveCurrentFilter = async () => {
    if (!newFilterName.trim()) {
      toast({ title: "Моля въведи име за филтъра", variant: "destructive" });
      return;
    }

    setIsSavingFilter(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const filterConfig = {
        selectedDays,
        categoryFilter,
        sessionsSubTab,
        cohortGroupBy,
      };

      const res = await fetch(`${baseUrl}/api/admin/saved-filters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFilterName.trim(),
          description: newFilterDescription.trim() || null,
          filter_config: filterConfig,
        }),
      });

      if (res.ok) {
        toast({ title: "Филтърът е запазен успешно!" });
        setSaveFilterDialogOpen(false);
        setNewFilterName('');
        setNewFilterDescription('');
        fetchSavedFilters();
      } else {
        throw new Error("Failed to save filter");
      }
    } catch (error) {
      console.error("Error saving filter:", error);
      toast({ title: "Грешка при запазване на филтъра", variant: "destructive" });
    } finally {
      setIsSavingFilter(false);
    }
  };

  const loadSavedFilter = async (filter: SavedFilter) => {
    // Apply filter config
    if (filter.filter_config.selectedDays !== undefined) {
      setSelectedDays(filter.filter_config.selectedDays);
    }
    if (filter.filter_config.categoryFilter !== undefined) {
      setCategoryFilter(filter.filter_config.categoryFilter);
    }
    if (filter.filter_config.sessionsSubTab !== undefined) {
      setSessionsSubTab(filter.filter_config.sessionsSubTab as 'users' | 'crm' | 'explorer' | 'cohort' | 'retention' | 'emails' | 'heatmap');
    }
    if (filter.filter_config.cohortGroupBy !== undefined) {
      setCohortGroupBy(filter.filter_config.cohortGroupBy as 'week' | 'month');
    }

    // Increment use count
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      await fetch(`${baseUrl}/api/admin/saved-filters`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: filter.id, increment_use: true }),
      });
      fetchSavedFilters();
    } catch (error) {
      console.error("Error updating filter use count:", error);
    }

    toast({ title: `Филтър "${filter.name}" е зареден` });
  };

  const deleteSavedFilter = async (filterId: string) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/saved-filters?id=${filterId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({ title: "Филтърът е изтрит" });
        fetchSavedFilters();
      } else {
        throw new Error("Failed to delete filter");
      }
    } catch (error) {
      console.error("Error deleting filter:", error);
      toast({ title: "Грешка при изтриване на филтъра", variant: "destructive" });
    }
  };

  // Load saved filters and alerts on mount
  useEffect(() => {
    fetchSavedFilters();
    fetchAlerts();
    fetchAlertNotifications();

    // Check for new notifications every 5 minutes
    const notificationInterval = setInterval(() => {
      fetchAlertNotifications();
    }, 5 * 60 * 1000);

    return () => clearInterval(notificationInterval);
  }, []);

  // Export users to CSV
  const exportUsersToCSV = async () => {
    setIsExporting(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const daysParam = selectedPeriod === -1 ? "&days=-1" : `&days=0`;
      const searchParam = userSearchQuery ? `&search=${encodeURIComponent(userSearchQuery)}` : "";
      const statusParam = userStatusFilter !== 'all' ? `&status=${userStatusFilter}` : "";

      // Fetch ALL users (limit=10000 to get all)
      const res = await fetch(
        `${baseUrl}/api/admin/quiz-flow?view=user-journey${daysParam}${categoryParam}${searchParam}${statusParam}&limit=10000&offset=0`
      );

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      const users = data.results || [];

      if (users.length === 0) {
        toast({ title: "Няма данни за експорт", variant: "destructive" });
        return;
      }

      // CSV Headers
      const headers = [
        "Email",
        "Име",
        "Категория",
        "Score",
        "Ниво",
        "Локация",
        "Quiz дата",
        "Поръчка",
        "Сума поръчка",
        "Дата поръчка",
        "App регистрация",
        "App дата",
        "Тренировки",
        "Хранения",
        "Сън логове",
        "Chat сесии",
        "Chat съобщения",
        "Breakdown: Симптоми",
        "Breakdown: Хранене",
        "Breakdown: Тренировка",
        "Breakdown: Сън",
        "Breakdown: Контекст",
      ];

      // CSV Rows
      const rows = users.map((user: any) => [
        user.email || "",
        user.firstName || "",
        user.category || "",
        user.totalScore || 0,
        user.determinedLevel || "",
        user.workoutLocation || "",
        user.quizCreatedAt ? new Date(user.quizCreatedAt).toLocaleDateString("bg-BG") : "",
        user.userJourney?.hasPurchased ? "Да" : "Не",
        user.userJourney?.orderTotal || "",
        user.userJourney?.orderDate ? new Date(user.userJourney.orderDate).toLocaleDateString("bg-BG") : "",
        user.userJourney?.isRegistered ? "Да" : "Не",
        user.userJourney?.registeredAt ? new Date(user.userJourney.registeredAt).toLocaleDateString("bg-BG") : "",
        user.userJourney?.workouts || 0,
        user.userJourney?.meals || 0,
        user.userJourney?.sleepLogs || 0,
        user.userJourney?.chatSessions || 0,
        user.userJourney?.totalMessages || 0,
        user.breakdown?.symptoms || 0,
        user.breakdown?.nutrition || 0,
        user.breakdown?.training || 0,
        user.breakdown?.sleep_recovery || 0,
        user.breakdown?.context || 0,
      ]);

      // Build CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      // Add BOM for Excel UTF-8 compatibility
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

      // Generate filename with date and filter info
      const dateStr = new Date().toISOString().split("T")[0];
      const filterStr = userStatusFilter !== 'all' ? `-${userStatusFilter}` : "";
      const searchStr = userSearchQuery ? `-search` : "";
      const filename = `testograph-users-${dateStr}${filterStr}${searchStr}.csv`;

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "CSV експортиран успешно!",
        description: `${users.length} потребители експортирани`
      });

    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({ title: "Грешка при експорт", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const fetchAbandonedSessionsPage = async (page: number) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const offset = (page - 1) * pageSize;

      const res = await fetch(
        `${baseUrl}/api/admin/quiz-flow?view=session-explorer&days=0${categoryParam}&limit=${pageSize}&offset=${offset}`
      );

      if (res.ok) {
        setSessionExplorerData(await res.json());
        setAbandonedPage(page);
      }
    } catch (error) {
      console.error("Error fetching abandoned sessions page:", error);
    }
  };

  const fetchSessionTimeline = async (sessionId: string) => {
    setLoadingTimeline(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/admin/quiz-flow?view=session-timeline&session_id=${sessionId}`);

      if (res.ok) {
        const data = await res.json();
        setSessionTimelineData(data);
        setSessionTimelineModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching session timeline:", error);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const fetchSessionDetail = async (sessionId: string, sessionInfo?: Session) => {
    setLoadingSession(true);
    setSelectedSessionInfo(sessionInfo || null);
    setSelectedUserJourney(null);

    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

      // Fetch session timeline detail
      const res = await fetch(`${baseUrl}/api/admin/quiz-flow?view=session-detail&session_id=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSession(data);
        setSessionModalOpen(true);

        // If we have email, also fetch user journey data (app access, order status)
        const email = sessionInfo?.email;
        if (email) {
          const journeyRes = await fetch(`${baseUrl}/api/admin/user-audit?email=${encodeURIComponent(email)}`);
          if (journeyRes.ok) {
            const journeyData = await journeyRes.json();
            setSelectedUserJourney(journeyData);
          }
        }
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

  // Fetch comparison data when comparison mode is enabled or settings change
  useEffect(() => {
    if (comparisonEnabled) {
      fetchComparisonData();
    }
  }, [comparisonEnabled, selectedDays, categoryFilter, comparisonCategory]);

  // ============ REALTIME SUBSCRIPTION ============
  // Listen for order status changes (pending -> paid) and auto-refresh
  useEffect(() => {
    const channel = supabase
      .channel('pending_orders_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pending_orders',
        },
        (payload: any) => {
          console.log('[Quiz Analytics] Order updated:', payload);
          // Refresh sessions data when an order is updated (e.g., status changed to paid)
          fetchSessionsPage(sessionsPage);
          // Also refresh user journey if it's visible
          if (userJourneyData) {
            fetchUserJourneyPage(userJourneyPage);
          }
          // Show toast notification
          const newStatus = payload.new?.status;
          const oldStatus = payload.old?.status;
          if (oldStatus === 'pending' && newStatus === 'paid') {
            toast({
              title: "Поръчка платена!",
              description: `Поръчка #${payload.new?.order_number || 'N/A'} е платена. Данните са обновени.`,
            });
          } else {
            toast({
              title: "Данните са обновени",
              description: "Поръчка беше актуализирана.",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pending_orders',
        },
        (payload: any) => {
          console.log('[Quiz Analytics] New order created:', payload);
          fetchSessionsPage(sessionsPage);
          if (userJourneyData) {
            fetchUserJourneyPage(userJourneyPage);
          }
          // Show toast notification for new order
          toast({
            title: "Нова поръчка!",
            description: `Поръчка #${payload.new?.order_number || 'N/A'} беше създадена.`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionsPage, userJourneyPage, userJourneyData, toast]);

  // ============ LIVE QUIZ SESSIONS REALTIME ============
  // Listen for new quiz step events and track active sessions
  useEffect(() => {
    const LIVE_SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes - session is considered "live" if active within this time

    const quizChannel = supabase
      .channel('quiz_step_events_live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_step_events',
        },
        (payload: any) => {
          console.log('[Quiz Analytics] New quiz step event:', payload);
          const newEvent = payload.new;

          if (!newEvent) return;

          setLiveSessions((prev) => {
            // Find if session already exists
            const existingIndex = prev.findIndex(s => s.session_id === newEvent.session_id);
            const now = new Date().toISOString();

            if (existingIndex >= 0) {
              // Update existing session
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                current_step: Math.max(updated[existingIndex].current_step, newEvent.step_number || 0),
                last_activity: now,
                category: newEvent.category || updated[existingIndex].category,
              };
              return updated;
            } else {
              // Add new session
              const newSession: LiveSession = {
                session_id: newEvent.session_id,
                category: newEvent.category,
                started_at: now,
                current_step: newEvent.step_number || 1,
                last_activity: now,
              };

              // Show toast for new quiz start
              if (newEvent.step_number === 1 || !newEvent.step_number) {
                toast({
                  title: "🟢 Нов Quiz започна!",
                  description: `Категория: ${newEvent.category || 'неизвестна'}`,
                });
              }

              return [newSession, ...prev].slice(0, 20); // Keep only last 20 sessions
            }
          });
        }
      )
      .subscribe((status) => {
        console.log('[Quiz Analytics] Realtime subscription status:', status);
      });

    // Cleanup stale sessions every 30 seconds
    const cleanupInterval = setInterval(() => {
      const cutoffTime = new Date(Date.now() - LIVE_SESSION_TIMEOUT).toISOString();
      setLiveSessions((prev) =>
        prev.filter((s) => s.last_activity > cutoffTime)
      );
    }, 30000);

    return () => {
      supabase.removeChannel(quizChannel);
      clearInterval(cleanupInterval);
    };
  }, [toast]);

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

  // Use overviewData for category/level charts (has ALL quiz completions, not just tracked)
  const categoryChartData = overviewData?.completions?.byCategory
    ? [
        { name: "Либидо", value: overviewData.completions.byCategory.libido || 0, color: CATEGORY_COLORS.libido },
        { name: "Мускули", value: overviewData.completions.byCategory.muscle || 0, color: CATEGORY_COLORS.muscle },
        { name: "Енергия", value: overviewData.completions.byCategory.energy || 0, color: CATEGORY_COLORS.energy },
      ]
    : [];

  const levelChartData = overviewData?.completions?.byLevel
    ? Object.entries(overviewData.completions.byLevel)
        .filter(([_, count]) => (count as number) > 0)
        .map(([level, count]) => ({
          name: LEVEL_LABELS[level] || level,
          value: count as number,
          color: LEVEL_COLORS[level] || "#6b7280",
        }))
    : [];

  const ageChartData = statsData?.ageBreakdown
    ? Object.entries(statsData.ageBreakdown)
        .filter(([_, count]) => count > 0)
        .map(([age, count]) => ({
          name: age,
          value: count,
          fill: AGE_COLORS[age] || "#6b7280",
        }))
        .sort((a, b) => {
          const order = ["25-35", "36-45", "46-55", "56+"];
          return order.indexOf(a.name) - order.indexOf(b.name);
        })
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
                {[7, 30, 90, -1].map((days) => (
                  <Button
                    key={days}
                    variant={selectedDays === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDays(days)}
                  >
                    {days === -1 ? 'Всички' : `${days}д`}
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

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open('/api/admin/quiz-flow?view=csv-export', '_blank')
                }}
                className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>

              {/* Comparison Mode Toggle */}
              <div className="border-l pl-2 flex gap-1 items-center">
                <Button
                  variant={comparisonEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setComparisonEnabled(!comparisonEnabled)}
                  className={comparisonEnabled ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  <BarChart2 className="w-4 h-4 mr-1" />
                  Сравнение
                </Button>
                {comparisonEnabled && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {comparisonCategory === 'none' ? 'Предишен период' : `vs ${comparisonCategory === 'all' ? 'Всички' : comparisonCategory}`}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Сравни с</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setComparisonCategory('none')}>
                        Предишен период
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs">Друга категория</DropdownMenuLabel>
                      {(["all", "libido", "muscle", "energy"] as const)
                        .filter(cat => cat !== categoryFilter)
                        .map((cat) => (
                          <DropdownMenuItem key={cat} onClick={() => setComparisonCategory(cat)}>
                            {cat === "all" ? "Всички" : cat}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Saved Filters */}
              <div className="border-l pl-2 flex gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoadingFilters}>
                      <Filter className="w-4 h-4 mr-2" />
                      Филтри ({savedFilters.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Запазени филтри</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {savedFilters.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        Няма запазени филтри
                      </div>
                    ) : (
                      savedFilters.map((filter) => (
                        <DropdownMenuItem
                          key={filter.id}
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => loadSavedFilter(filter)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{filter.name}</div>
                            {filter.description && (
                              <div className="text-xs text-muted-foreground truncate">{filter.description}</div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {filter.filter_config.selectedDays === -1 ? 'Всички' : `${filter.filter_config.selectedDays}д`}
                              {filter.filter_config.categoryFilter !== 'all' && ` / ${filter.filter_config.categoryFilter}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Badge variant="secondary" className="text-xs">{filter.use_count}x</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSavedFilter(filter.id);
                              }}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSaveFilterDialogOpen(true)}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Запази
                </Button>
              </div>

              {/* Alerts & Notifications */}
              <div className="border-l pl-2 flex gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="relative">
                      {alertsUnreadCount > 0 ? (
                        <BellRing className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                      {alertsUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {alertsUnreadCount > 9 ? '9+' : alertsUnreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Известия</span>
                      {alertsUnreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={async () => {
                            await fetch('/api/admin/alerts', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ mark_read: true }),
                            });
                            setAlertNotifications([]);
                            setAlertsUnreadCount(0);
                          }}
                        >
                          Маркирай като прочетени
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {alertNotifications.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        Няма нови известия
                      </div>
                    ) : (
                      alertNotifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className="px-2 py-2 border-b last:border-0 hover:bg-muted/50"
                        >
                          <div className="font-medium text-sm">{notification.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.triggered_at).toLocaleString('bg-BG')}
                          </div>
                        </div>
                      ))
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="justify-center cursor-pointer"
                      onClick={() => setAlertsDialogOpen(true)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Управление на известия
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Live Sessions Indicator */}
          {liveSessions.length > 0 && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950 mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                  LIVE - {liveSessions.length} активни Quiz сесии
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {liveSessions.map((session) => (
                    <TooltipProvider key={session.session_id}>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 bg-white dark:bg-gray-900"
                          >
                            {getCategoryIcon(session.category || '')}
                            <span className="text-xs">
                              Стъпка {session.current_step}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Session: {session.session_id.slice(0, 8)}...</p>
                          <p>Категория: {session.category || 'неизвестна'}</p>
                          <p>Текуща стъпка: {session.current_step}</p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Mode Results */}
          {comparisonEnabled && comparisonData && (
            <Card className="border-purple-300 bg-purple-50/50 dark:bg-purple-950/30 mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <BarChart2 className="w-4 h-4" />
                  Сравнение: {comparisonData.current.period} ({comparisonData.current.category}) vs {comparisonData.comparison.period} ({comparisonData.comparison.category})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingComparison ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                    <span className="ml-2 text-muted-foreground">Зареждане...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Total Sessions Comparison */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground mb-1">Сесии</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold">{comparisonData.current.stats.totalSessions}</div>
                          <div className="text-xs text-muted-foreground">vs {comparisonData.comparison.stats.totalSessions}</div>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${comparisonData.changes.totalSessions.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {comparisonData.changes.totalSessions.value >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {comparisonData.changes.totalSessions.percent.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Completed Sessions Comparison */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground mb-1">Завършени</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold">{comparisonData.current.stats.completedSessions}</div>
                          <div className="text-xs text-muted-foreground">vs {comparisonData.comparison.stats.completedSessions}</div>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${comparisonData.changes.completedSessions.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {comparisonData.changes.completedSessions.value >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {comparisonData.changes.completedSessions.percent.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Abandoned Sessions Comparison */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground mb-1">Изоставени</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold">{comparisonData.current.stats.abandonedSessions}</div>
                          <div className="text-xs text-muted-foreground">vs {comparisonData.comparison.stats.abandonedSessions}</div>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${comparisonData.changes.abandonedSessions.value <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {comparisonData.changes.abandonedSessions.value <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                          {Math.abs(comparisonData.changes.abandonedSessions.percent).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Completion Rate Comparison */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground mb-1">Completion Rate</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold">{comparisonData.current.stats.completionRate.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">vs {comparisonData.comparison.stats.completionRate.toFixed(1)}%</div>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${comparisonData.changes.completionRate.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {comparisonData.changes.completionRate.value >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {comparisonData.changes.completionRate.value >= 0 ? '+' : ''}{comparisonData.changes.completionRate.value.toFixed(1)}pp
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <UITooltip>
              <TooltipTrigger asChild>
                <Card className="cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Общо Quiz
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData?.completions.total || 0}</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold">Всички Quiz Completions (All-time)</p>
                <p className="text-xs mt-1">Източник: quiz_results_v2 таблица</p>
                <p className="text-xs">Включва ВСИЧКИ завършени quiz-ове от началото (10.11.2024)</p>
              </TooltipContent>
            </UITooltip>

            <UITooltip>
              <TooltipTrigger asChild>
                <Card className="cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Среден Score
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{trendsData?.avgScore || 0}</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold">Среден Total Score</p>
                <p className="text-xs mt-1">Изчислен от всички завършени quiz-ове</p>
                <p className="text-xs">Максимален score: 100 точки</p>
              </TooltipContent>
            </UITooltip>

            <UITooltip>
              <TooltipTrigger asChild>
                <Card className="cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Completion Rate
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {statsData?.overview.completionRate || 0}%
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold">Completion Rate (от Tracked сесии)</p>
                <p className="text-xs mt-1">Източник: quiz_step_events (step tracking)</p>
                <p className="text-xs text-amber-600">Важно: Tracking е активно от 02.12.2024!</p>
                <p className="text-xs mt-1">Показва: {statsData?.overview.completedSessions || 0} завършени от {statsData?.overview.totalSessions || 0} tracked сесии</p>
              </TooltipContent>
            </UITooltip>

            <UITooltip>
              <TooltipTrigger asChild>
                <Card className="cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-500" />
                      Платени поръчки
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {userJourneyData?.conversionStats.purchaseRate || 0}%
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold">Purchase Rate</p>
                <p className="text-xs mt-1">% от quiz потребители които са купили</p>
                <p className="text-xs">Източник: pending_orders таблица</p>
              </TooltipContent>
            </UITooltip>

            <UITooltip>
              <TooltipTrigger asChild>
                <Card className="cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-500" />
                      В App
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {userJourneyData?.conversionStats.registrationRate || 0}%
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold">App Registration Rate</p>
                <p className="text-xs mt-1">% от quiz потребители регистрирани в app.testograph.eu</p>
                <p className="text-xs">Източник: Supabase Auth users</p>
              </TooltipContent>
            </UITooltip>

            <UITooltip>
              <TooltipTrigger asChild>
                <Card className="cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-500" />
                      Активни
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {userJourneyData?.conversionStats.activeRate || 0}%
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold">Active Users Rate</p>
                <p className="text-xs mt-1">% от регистрирани потребители с активност в app-а</p>
                <p className="text-xs">Активност = workout/meal/sleep logs</p>
              </TooltipContent>
            </UITooltip>

            <UITooltip>
              <TooltipTrigger asChild>
                <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 cursor-help">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center gap-2 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      CRM Actions
                      <Info className="w-3 h-3" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {crmData ? crmData.segments.quizNoOrder.count + crmData.segments.orderNoQuiz.count : 0}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold">CRM Action Items</p>
                <p className="text-xs mt-1">Потребители изискващи внимание:</p>
                <p className="text-xs">• Quiz без поръчка: {crmData?.segments.quizNoOrder.count || 0}</p>
                <p className="text-xs">• Поръчка без quiz: {crmData?.segments.orderNoQuiz.count || 0}</p>
              </TooltipContent>
            </UITooltip>
          </div>

          {/* Tab Navigation - Simplified 3 tabs */}
          <div className="flex gap-1 border-b pb-2">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => setActiveTab("dashboard")}
              className="text-base"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              onClick={() => setActiveTab("analytics")}
              className="text-base"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant={activeTab === "sessions-crm" ? "default" : "ghost"}
              onClick={() => setActiveTab("sessions-crm")}
              className="text-base"
            >
              <Users className="w-4 h-4 mr-2" />
              Sessions & CRM
              {(sessionExplorerData?.summary.abandonedSessions || 0) > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {sessionExplorerData?.summary.abandonedSessions}
                </Badge>
              )}
            </Button>
          </div>

          {/* ============ DASHBOARD TAB ============ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Data Sources Info Banner */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Данните идват от 2 източника:</p>
                    <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2 text-amber-700 dark:text-amber-300">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span><strong>quiz_results_v2</strong> - Всички завършени quiz-ове (от 10.11.2024)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        <span><strong>quiz_step_events</strong> - Step tracking (от 02.12.2024)</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Hover върху всяка метрика за детайлно обяснение на източника.
                    </p>
                  </div>
                </div>
              </div>

              {/* Circular Progress Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Quiz Completions (All-time) */}
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className="p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all"
                      onClick={() => { setSelectedMetric('total'); setMetricDialogOpen(true); }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                            <circle
                              cx="48" cy="48" r="40"
                              stroke="#3b82f6"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={0}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">{overviewData?.completions.total || 0}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                          Общо Quiz <Info className="w-3 h-3" />
                        </p>
                        <p className="text-xs text-muted-foreground">(all-time)</p>
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-semibold text-blue-600">Всички Quiz Completions</p>
                    <p className="text-xs mt-1">Източник: quiz_results_v2</p>
                    <p className="text-xs">Включва ВСИЧКИ завършени quiz-ове от 10.11.2024</p>
                    <p className="text-xs mt-1 text-green-600">Това е истинският брой завършени quiz-ове!</p>
                  </TooltipContent>
                </UITooltip>

                {/* Tracked Sessions */}
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className="p-4 cursor-pointer hover:shadow-lg hover:border-amber-300 transition-all"
                      onClick={() => { setSelectedMetric('tracked'); setMetricDialogOpen(true); }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                            <circle
                              cx="48" cy="48" r="40"
                              stroke="#f59e0b"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={0}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-amber-600">{statsData?.overview.totalSessions || 0}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                          Tracked <Info className="w-3 h-3" />
                        </p>
                        <p className="text-xs text-muted-foreground">({selectedDays === -1 ? 'Всички' : `${selectedDays} дни`})</p>
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-semibold text-amber-600">Tracked Sessions (Step Tracking)</p>
                    <p className="text-xs mt-1">Източник: quiz_step_events</p>
                    <p className="text-xs text-amber-600 font-medium">Tracking активно от: 02.12.2024!</p>
                    <p className="text-xs mt-1">Сесии със записани стъпки (step_entered, step_exited)</p>
                    <p className="text-xs">НЕ включва quiz-ове преди 02.12.2024</p>
                  </TooltipContent>
                </UITooltip>

                {/* Completed from Tracked */}
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className="p-4 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all"
                      onClick={() => { setSelectedMetric('completed'); setMetricDialogOpen(true); }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                            <circle
                              cx="48" cy="48" r="40"
                              stroke="#22c55e"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - (statsData?.overview.completionRate || 0) / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-green-600">{statsData?.overview.completedSessions || 0}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                          Завършени <Info className="w-3 h-3" />
                        </p>
                        <p className="text-xs text-amber-600">(от tracked)</p>
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-semibold text-green-600">Завършени от Tracked Сесии</p>
                    <p className="text-xs mt-1">Tracked сесии стигнали до step 24+</p>
                    <p className="text-xs text-amber-600 font-medium">Само от tracking данните (от 02.12.2024)</p>
                    <p className="text-xs mt-1">Completion Rate: {statsData?.overview.completionRate || 0}%</p>
                    <p className="text-xs">({statsData?.overview.completedSessions || 0} от {statsData?.overview.totalSessions || 0} tracked)</p>
                  </TooltipContent>
                </UITooltip>

                {/* Abandoned from Tracked */}
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className="p-4 cursor-pointer hover:shadow-lg hover:border-red-300 transition-all"
                      onClick={() => { setSelectedMetric('abandoned'); setMetricDialogOpen(true); }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                            <circle
                              cx="48" cy="48" r="40"
                              stroke="#ef4444"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (statsData?.overview.completionRate || 0) / 100}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-red-500">{statsData?.overview.abandonedSessions || 0}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                          Изоставени <Info className="w-3 h-3" />
                        </p>
                        <p className="text-xs text-amber-600">(от tracked)</p>
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-semibold text-red-600">Изоставени Tracked Сесии</p>
                    <p className="text-xs mt-1">Tracked сесии НЕ стигнали до финала</p>
                    <p className="text-xs text-amber-600 font-medium">Само от tracking данните (от 02.12.2024)</p>
                    <p className="text-xs mt-1">Drop Rate: {100 - (statsData?.overview.completionRate || 0)}%</p>
                    <p className="text-xs">({statsData?.overview.abandonedSessions || 0} от {statsData?.overview.totalSessions || 0} tracked)</p>
                  </TooltipContent>
                </UITooltip>
              </div>

              {/* Pie Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Pie */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Категории</CardTitle>
                    <CardDescription className="text-xs">Общо: {categoryChartData.reduce((a, b) => a + b.value, 0)} (кликни за детайли)</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={60}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}`, 'Брой']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      {categoryChartData.map((entry) => (
                        <button
                          key={entry.name}
                          className="flex items-center gap-1 text-xs hover:bg-muted px-2 py-1 rounded transition-colors cursor-pointer"
                          onClick={() => {
                            const categoryMap: Record<string, string> = {
                              Libido: "libido",
                              Muscle: "muscle",
                              Energy: "energy",
                            };
                            setDataSheetConfig({
                              title: `Категория: ${entry.name}`,
                              description: `Всички quiz completions за категория ${entry.name}`,
                              dataType: "by_category",
                              additionalFilters: { targetCategory: categoryMap[entry.name] || entry.name.toLowerCase() },
                            });
                            setDataSheetOpen(true);
                          }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span>{entry.name}: <strong>{entry.value}</strong></span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Level Pie */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Нива</CardTitle>
                    <CardDescription className="text-xs">Общо: {levelChartData.reduce((a, b) => a + b.value, 0)} (кликни за детайли)</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={levelChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={60}
                          dataKey="value"
                        >
                          {levelChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}`, 'Брой']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      {levelChartData.map((entry) => (
                        <button
                          key={entry.name}
                          className="flex items-center gap-1 text-xs hover:bg-muted px-2 py-1 rounded transition-colors cursor-pointer"
                          onClick={() => {
                            const levelMap: Record<string, string> = {
                              Low: "low",
                              Moderate: "moderate",
                              Good: "good",
                              Optimal: "optimal",
                            };
                            setDataSheetConfig({
                              title: `Ниво: ${entry.name}`,
                              description: `Всички quiz completions за ниво ${entry.name}`,
                              dataType: "by_level",
                              additionalFilters: { targetLevel: levelMap[entry.name] || entry.name.toLowerCase() },
                            });
                            setDataSheetOpen(true);
                          }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span>{entry.name}: <strong>{entry.value}</strong></span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Device Pie */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      Устройства
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Данни от Session Tracking</p>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <CardDescription className="text-xs">Tracked: {deviceChartData.reduce((a, b) => a + b.value, 0)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {deviceChartData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8 text-sm">Няма данни</p>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              data={deviceChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={60}
                              dataKey="value"
                            >
                              {deviceChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}`, 'Брой']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                          {deviceChartData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                              <span>{entry.name}: <strong>{entry.value}</strong></span>
                              <span className="text-muted-foreground">
                                ({((entry.value / deviceChartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Age Pie */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      Възраст
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">От quiz отговори (Step 2)</p>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <CardDescription className="text-xs">Tracked: {ageChartData.reduce((a, b) => a + b.value, 0)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {ageChartData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8 text-sm">Няма данни</p>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie
                              data={ageChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={60}
                              dataKey="value"
                            >
                              {ageChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}`, 'Брой']} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                          {ageChartData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                              <span>{entry.name}: <strong>{entry.value}</strong></span>
                              <span className="text-muted-foreground">
                                ({((entry.value / ageChartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Conversion Funnel Visual */}
              {userJourneyData?.conversionStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                    <CardDescription>Quiz → Платена поръчка → В App → Активни</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-3 py-6">
                      {/* Quiz (Step 1) */}
                      <div className="text-center">
                        <div className="w-28 h-28 rounded-full bg-blue-500 flex items-center justify-center text-white mx-auto">
                          <div>
                            <p className="text-2xl font-bold">{userJourneyData.conversionStats.totalQuizSubmissions}</p>
                            <p className="text-xs">Quiz</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">100%</p>
                      </div>

                      <ChevronRight className="w-6 h-6 text-muted-foreground" />

                      {/* Paid Orders (Step 2) */}
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white mx-auto">
                          <div>
                            <p className="text-xl font-bold">{userJourneyData.conversionStats.withPaidOrder || 0}</p>
                            <p className="text-xs">Платени</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-green-600 font-semibold">
                          {userJourneyData.conversionStats.purchaseRate || 0}%
                        </p>
                      </div>

                      <ChevronRight className="w-6 h-6 text-muted-foreground" />

                      {/* App Registration (Step 3) */}
                      <div className="text-center">
                        <div className="w-22 h-22 rounded-full bg-purple-500 flex items-center justify-center text-white mx-auto" style={{width: '5.5rem', height: '5.5rem'}}>
                          <div>
                            <p className="text-lg font-bold">{userJourneyData.conversionStats.registeredInApp}</p>
                            <p className="text-xs">В App</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-purple-600 font-semibold">{userJourneyData.conversionStats.registrationRate}%</p>
                      </div>

                      <ChevronRight className="w-6 h-6 text-muted-foreground" />

                      {/* Active Users (Step 4) */}
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white mx-auto">
                          <div>
                            <p className="text-lg font-bold">{userJourneyData.conversionStats.activeInApp || 0}</p>
                            <p className="text-xs">Активни</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-orange-600 font-semibold">{userJourneyData.conversionStats.activeRate || 0}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ============ ANALYTICS TAB (Funnel + Trends combined) ============ */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Summary Stats Row */}
              {funnelData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Общо сесии</p>
                      <p className="text-3xl font-bold text-violet-600">{funnelData.summary?.totalSessions || 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Завършени</p>
                      <p className="text-3xl font-bold text-green-600">{funnelData.summary?.completedSessions || 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Изоставени</p>
                      <p className="text-3xl font-bold text-amber-600">{funnelData.summary?.abandonedSessions || 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="text-3xl font-bold text-blue-600">{funnelData.summary?.completionRate?.toFixed(1) || 0}%</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Two column layout for charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funnel Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-violet-500" />
                      Quiz Funnel
                    </CardTitle>
                    <CardDescription>
                      Сесии на всяка стъпка ({selectedDays === -1 ? 'Всички' : `${selectedDays} дни`})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {funnelChartData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Няма tracking данни</p>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={funnelChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                              dataKey="step"
                              tick={{ fontSize: 11 }}
                              label={{ value: 'Стъпка', position: 'bottom', offset: 0, fontSize: 12 }}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  const firstStep = funnelChartData[0]?.sessions || 1;
                                  const retention = ((data.sessions / firstStep) * 100).toFixed(1);
                                  return (
                                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                                      <p className="font-semibold text-sm">Step {data.step}: {data.name}</p>
                                      <p className="text-violet-600 font-bold">{data.sessions} сесии</p>
                                      <p className="text-xs text-muted-foreground">Retention: {retention}%</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                              {funnelChartData.map((entry, index) => {
                                const firstStep = funnelChartData[0]?.sessions || 1;
                                const retention = entry.sessions / firstStep;
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={`rgba(139, 92, 246, ${0.3 + (retention * 0.7)})`}
                                  />
                                );
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Start: {funnelChartData[0]?.sessions || 0}</span>
                          <span className="text-green-600">End: {funnelChartData[funnelChartData.length - 1]?.sessions || 0}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Drop-offs */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Top Drop-off Points
                    </CardTitle>
                    <CardDescription>Къде отпадат потребителите (top 10)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dropOffChartData.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Няма drop-off данни</p>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={dropOffChartData} layout="vertical" margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis
                              dataKey="name"
                              type="category"
                              width={100}
                              fontSize={10}
                              tick={{ fill: '#666' }}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                                      <p className="font-semibold text-sm">Step {data.step}: {data.name}</p>
                                      <p className="text-red-600 font-bold">{data.count} отпаднали</p>
                                      <p className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}% от всички</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="count" name="Отпаднали" radius={[0, 4, 4, 0]}>
                              {dropOffChartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-red-500" /> {'>'}20%
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-amber-500" /> 10-20%
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded bg-green-500" /> {'<'}10%
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Daily Trend Chart - Full Width */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Дневен Trend
                      </CardTitle>
                      <CardDescription>
                        Завършени quiz-ове по дни ({selectedDays === -1 ? 'Всички' : `последните ${selectedDays} дни`})
                      </CardDescription>
                    </div>
                    {trendsData?.trendData && trendsData.trendData.length > 0 && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {trendsData.trendData.reduce((sum: number, d: any) => sum + (d.total || 0), 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">общо за периода</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {trendsData?.trendData && trendsData.trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={trendsData.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => {
                            const d = new Date(value);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                          }}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          labelFormatter={(value) => {
                            const d = new Date(value);
                            return d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line type="monotone" dataKey="total" stroke="#8b5cf6" name="Общо" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="libido" stroke={CATEGORY_COLORS.libido} name="Либидо" strokeWidth={2} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="muscle" stroke={CATEGORY_COLORS.muscle} name="Мускули" strokeWidth={2} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="energy" stroke={CATEGORY_COLORS.energy} name="Енергия" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Няма trend данни</p>
                  )}
                </CardContent>
              </Card>

              {/* Average Score Trend */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-500" />
                        Среден Score по дни
                      </CardTitle>
                      <CardDescription>Средният резултат на потребителите</CardDescription>
                    </div>
                    {trendsData?.trendData && trendsData.trendData.length > 0 && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">
                          {(trendsData.trendData.reduce((sum: number, d: any) => sum + (d.avgScore || 0), 0) / trendsData.trendData.filter((d: any) => d.avgScore > 0).length || 0).toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">среден score</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {trendsData?.trendData && trendsData.trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={trendsData.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => {
                            const d = new Date(value);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                          }}
                        />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          labelFormatter={(value) => {
                            const d = new Date(value);
                            return d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)}`, 'Среден Score']}
                        />
                        <Line
                          type="monotone"
                          dataKey="avgScore"
                          stroke="#10b981"
                          name="Среден Score"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#10b981' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Няма score данни</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ============ SESSIONS & CRM TAB ============ */}
          {activeTab === "sessions-crm" && (
            <div className="space-y-6">
              {/* Sub-navigation */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={sessionsSubTab === "users" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSessionsSubTab("users")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Потребители
                  {userJourneyData?.conversionStats && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {userJourneyData.conversionStats.totalQuizSubmissions}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={sessionsSubTab === "crm" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSessionsSubTab("crm")}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  CRM Сегменти
                  {crmData && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {crmData.segments.quizNoOrder.count}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={sessionsSubTab === "explorer" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSessionsSubTab("explorer")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Session Explorer
                  {sessionExplorerData && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {sessionExplorerData.summary.abandonedSessions} изоставени
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={sessionsSubTab === "cohort" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSessionsSubTab("cohort")}
                >
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Cohort Analysis
                  {cohortData && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {cohortData.summary.totalCohorts} групи
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={sessionsSubTab === "retention" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setSessionsSubTab("retention");
                    if (!retentionData) fetchRetentionData();
                  }}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Retention
                  {retentionData && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      DAU: {retentionData.metrics.dau}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={sessionsSubTab === "emails" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setSessionsSubTab("emails");
                    if (!emailCampaignData) fetchEmailCampaignData();
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Campaigns
                  {emailCampaignData && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {emailCampaignData.stats.sent} sent
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={sessionsSubTab === "heatmap" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setSessionsSubTab("heatmap");
                    if (heatmapData.length === 0) fetchHeatmapData();
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Step Heatmap
                  {heatmapSummary && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {heatmapSummary.totalQuestions} steps
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Users Sub-tab */}
              {sessionsSubTab === "users" && (
                <>
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Търси по email или име..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchUserJourneyPage(1, userSearchQuery, userStatusFilter);
                      }
                    }}
                    className="pl-10 pr-10"
                  />
                  {userSearchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => {
                        setUserSearchQuery('');
                        fetchUserJourneyPage(1, '', userStatusFilter);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Search Button + Filters */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => fetchUserJourneyPage(1, userSearchQuery, userStatusFilter)}
                    disabled={isSearching}
                  >
                    {isSearching ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
                    Търси
                  </Button>

                  <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
                    {[
                      { value: 'all', label: 'Всички', icon: Users },
                      { value: 'purchased', label: 'С поръчка', icon: ShoppingCart },
                      { value: 'not-purchased', label: 'Без поръчка', icon: AlertCircle },
                      { value: 'in-app', label: 'В App', icon: UserCheck },
                      { value: 'active', label: 'Активни', icon: Activity },
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={userStatusFilter === value ? "secondary" : "ghost"}
                        size="sm"
                        className="text-xs px-2"
                        onClick={() => {
                          setUserStatusFilter(value as any);
                          fetchUserJourneyPage(1, userSearchQuery, value);
                        }}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {label}
                      </Button>
                    ))}
                  </div>

                  {/* CSV Export Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportUsersToCSV}
                    disabled={isExporting}
                    className="bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
                  >
                    {isExporting ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    {isExporting ? "Експортиране..." : "CSV Export"}
                  </Button>
                </div>
              </div>

              {/* Conversion Stats Cards */}
              {userJourneyData?.conversionStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* 1. Quiz Submissions */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Quiz завършени</p>
                          <p className="text-2xl font-bold">{userJourneyData.conversionStats.totalQuizSubmissions}</p>
                        </div>
                        <Database className="h-8 w-8 text-blue-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 2. Paid Orders (step 2 in funnel) */}
                  <Card
                    className="border-l-4 border-l-green-500 cursor-pointer hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors"
                    onClick={() => {
                      setDataSheetConfig({
                        title: "Конверсии (Quiz + Поръчка)",
                        description: "Потребители с Quiz И Shopify поръчка",
                        dataType: "conversions",
                      });
                      setDataSheetOpen(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Платени поръчки</p>
                          <p className="text-2xl font-bold">
                            {userJourneyData.conversionStats.withPaidOrder || 0}
                            <span className="text-sm font-normal text-green-500 ml-2">
                              ({userJourneyData.conversionStats.purchaseRate || 0}%)
                            </span>
                          </p>
                        </div>
                        <CreditCard className="h-8 w-8 text-green-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3. App Registrations (step 3 in funnel) */}
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">В App</p>
                          <p className="text-2xl font-bold">
                            {userJourneyData.conversionStats.registeredInApp}
                            <span className="text-sm font-normal text-purple-500 ml-2">
                              ({userJourneyData.conversionStats.registrationRate}%)
                            </span>
                          </p>
                        </div>
                        <UserCheck className="h-8 w-8 text-purple-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 4. Active Users (step 4 in funnel) */}
                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Активни</p>
                          <p className="text-2xl font-bold">
                            {userJourneyData.conversionStats.activeInApp || 0}
                            <span className="text-sm font-normal text-orange-500 ml-2">
                              ({userJourneyData.conversionStats.activeRate || 0}%)
                            </span>
                          </p>
                        </div>
                        <Activity className="h-8 w-8 text-orange-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 5. Follow-up needed */}
                  <Card
                    className="border-l-4 border-l-red-500 cursor-pointer hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
                    onClick={() => {
                      setDataSheetConfig({
                        title: "Quiz без поръчка",
                        description: "Потребители завършили quiz, но без Shopify поръчка",
                        dataType: "quiz_no_order",
                      });
                      setDataSheetOpen(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Без поръчка</p>
                          <p className="text-2xl font-bold text-red-500">
                            {userJourneyData.conversionStats.totalQuizSubmissions - (userJourneyData.conversionStats.withPaidOrder || 0)}
                          </p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* User Journey Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Потребители
                        <Badge variant="secondary">{userJourneyData?.pagination?.total || 0}</Badge>
                        {isSearching && <RefreshCw className="h-4 w-4 animate-spin" />}
                      </CardTitle>
                      <CardDescription>Пълна информация: Quiz → Поръчка → App → AI Chat → Активност</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {userJourneyData?.results && userJourneyData.results.length > 0 ? (
                    <>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="min-w-[180px]">Потребител</TableHead>
                              <TableHead className="min-w-[140px]">Quiz Score</TableHead>
                              <TableHead className="min-w-[100px]">Journey</TableHead>
                              <TableHead className="min-w-[120px]">Поръчка</TableHead>
                              <TableHead className="min-w-[120px]">App & Chat</TableHead>
                              <TableHead className="min-w-[100px]">Активност</TableHead>
                              <TableHead className="min-w-[80px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userJourneyData.results.map((result: any) => {
                              // Calculate journey progress (0-4 steps)
                              const journeySteps = [
                                { done: true, label: 'Quiz', color: 'bg-blue-500' },
                                { done: result.userJourney.hasPurchased, label: 'Поръчка', color: 'bg-green-500' },
                                { done: result.userJourney.isRegistered, label: 'App', color: 'bg-purple-500' },
                                { done: result.userJourney.isActive, label: 'Активен', color: 'bg-orange-500' },
                              ];
                              const completedSteps = journeySteps.filter(s => s.done).length;

                              return (
                              <TableRow key={result.id} className="hover:bg-muted/30">
                                {/* User Info */}
                                <TableCell>
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{result.first_name || "-"}</span>
                                      {result.userJourney.isActive && (
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Активен" />
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono">{result.email}</span>
                                    <span className="text-xs text-muted-foreground">{formatRelativeTime(result.created_at)}</span>
                                  </div>
                                </TableCell>

                                {/* Quiz Score with Breakdown */}
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                      {getCategoryIcon(result.category)}
                                      <span className="text-lg font-bold">{result.total_score}</span>
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] ${
                                          result.determined_level === 'low' ? 'border-red-300 text-red-600' :
                                          result.determined_level === 'normal' ? 'border-amber-300 text-amber-600' :
                                          'border-green-300 text-green-600'
                                        }`}
                                      >
                                        {result.determined_level === 'low' ? 'Нисък' : result.determined_level === 'normal' ? 'Нормален' : 'Добър'}
                                      </Badge>
                                    </div>
                                    {/* Mini breakdown bars */}
                                    {result.breakdown && (
                                      <div className="flex gap-0.5 mt-1" title="Симптоми | Хранене | Тренировка | Сън | Контекст">
                                        {[
                                          { val: result.breakdown.symptoms, max: 40, color: 'bg-rose-400' },
                                          { val: result.breakdown.nutrition, max: 20, color: 'bg-emerald-400' },
                                          { val: result.breakdown.training, max: 20, color: 'bg-blue-400' },
                                          { val: result.breakdown.sleep_recovery, max: 15, color: 'bg-violet-400' },
                                          { val: result.breakdown.context, max: 5, color: 'bg-amber-400' },
                                        ].map((b, i) => (
                                          <div key={i} className="w-4 h-2 bg-muted rounded-sm overflow-hidden">
                                            <div
                                              className={`h-full ${b.color}`}
                                              style={{ width: `${Math.min(100, (b.val / b.max) * 100)}%` }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {result.workout_location && (
                                      <Badge variant="outline" className="w-fit text-[10px] mt-0.5">
                                        {result.workout_location === 'home' ? <Home className="w-2.5 h-2.5 mr-0.5" /> : <Building2 className="w-2.5 h-2.5 mr-0.5" />}
                                        {result.workout_location === 'home' ? 'Вкъщи' : 'Фитнес'}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>

                                {/* Journey Progress */}
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    {/* Progress bar */}
                                    <div className="flex gap-0.5">
                                      {journeySteps.map((step, i) => (
                                        <UITooltip key={i}>
                                          <TooltipTrigger>
                                            <div
                                              className={`w-5 h-2 rounded-sm ${step.done ? step.color : 'bg-muted'}`}
                                            />
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="text-xs">
                                            {step.label}: {step.done ? 'Да' : 'Не'}
                                          </TooltipContent>
                                        </UITooltip>
                                      ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{completedSteps}/4 стъпки</span>
                                    {result.has_tracking && (
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        {getDeviceIcon(result.device)}
                                        <span>{formatTime(result.total_time)}</span>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>

                                {/* Order Info - KEEP SAME */}
                                <TableCell>
                                  {result.userJourney.hasPurchased ? (
                                    <div className="flex flex-col gap-1">
                                      <Badge className={result.userJourney.orderStatus === 'paid' ? 'bg-green-500' : 'bg-amber-500'}>
                                        {result.userJourney.orderStatus === 'paid' ? 'Платена' : 'Pending'}
                                      </Badge>
                                      <span className="text-sm font-medium">{result.userJourney.totalSpent} лв</span>
                                      {result.userJourney.totalCapsules > 0 && (
                                        <span className="text-xs text-muted-foreground">{result.userJourney.totalCapsules} капс.</span>
                                      )}
                                      {result.userJourney.orderNumber && (
                                        <span className="text-xs text-muted-foreground">#{result.userJourney.orderNumber}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="text-red-500 border-red-300">Няма</Badge>
                                  )}
                                </TableCell>

                                {/* App & Chat Status */}
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    {result.userJourney.isRegistered ? (
                                      <>
                                        <Badge className="bg-purple-500 w-fit">В App</Badge>
                                        {result.userJourney.chatSessions > 0 && (
                                          <div className="flex items-center gap-1 text-xs text-blue-600">
                                            <MessageSquare className="w-3 h-3" />
                                            <span>{result.userJourney.chatSessions} чат{result.userJourney.chatSessions > 1 ? 'а' : ''}</span>
                                            {result.userJourney.totalMessages > 0 && (
                                              <span className="text-muted-foreground">({result.userJourney.totalMessages} msg)</span>
                                            )}
                                          </div>
                                        )}
                                        {result.userJourney.capsulesRemaining > 0 && (
                                          <span className="text-xs text-amber-600">
                                            {result.userJourney.capsulesRemaining} капс. ({result.userJourney.daysSupply}д)
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <Badge variant="outline" className="text-orange-500 border-orange-300 w-fit">
                                        <UserX className="w-3 h-3 mr-1" />
                                        Не е в App
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>

                                {/* Activity Stats */}
                                <TableCell>
                                  {result.userJourney.isActive && result.userJourney.activityStats ? (
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2 text-xs">
                                        <UITooltip>
                                          <TooltipTrigger>
                                            <span className="flex items-center gap-0.5">
                                              <Dumbbell className="w-3 h-3" />
                                              {result.userJourney.activityStats.workouts}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>Тренировки</TooltipContent>
                                        </UITooltip>
                                        <UITooltip>
                                          <TooltipTrigger>
                                            <span className="flex items-center gap-0.5">
                                              <Activity className="w-3 h-3" />
                                              {result.userJourney.activityStats.meals}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>Хранения</TooltipContent>
                                        </UITooltip>
                                        <UITooltip>
                                          <TooltipTrigger>
                                            <span className="flex items-center gap-0.5">
                                              <Clock className="w-3 h-3" />
                                              {result.userJourney.activityStats.sleep}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>Sleep tracking</TooltipContent>
                                        </UITooltip>
                                        <UITooltip>
                                          <TooltipTrigger>
                                            <span className="flex items-center gap-0.5">
                                              <Package className="w-3 h-3" />
                                              {result.userJourney.activityStats.testoup}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>TestoUP прием</TooltipContent>
                                        </UITooltip>
                                      </div>
                                      {result.userJourney.activityStats.progressDays > 0 && (
                                        <span className="text-xs text-green-600">
                                          {result.userJourney.activityStats.progressDays} дни | avg: {result.userJourney.activityStats.avgProgressScore}%
                                        </span>
                                      )}
                                      {result.userJourney.activityStats.lastActivity && (
                                        <span className="text-xs text-muted-foreground">
                                          Last: {formatRelativeTime(result.userJourney.activityStats.lastActivity)}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Без активност</span>
                                  )}
                                </TableCell>

                                {/* Actions */}
                                <TableCell>
                                  <div className="flex gap-1">
                                    {/* Profile link */}
                                    <UITooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={() => window.open(`/admin/users/${encodeURIComponent(result.email)}`, "_blank")}
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Пълен профил</TooltipContent>
                                    </UITooltip>
                                    {result.session_id && result.has_tracking && (
                                      <UITooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => fetchSessionDetail(result.session_id, {
                                              session_id: result.session_id,
                                              email: result.email,
                                              first_name: result.first_name,
                                              category: result.category,
                                              total_score: result.total_score,
                                              determined_level: result.determined_level,
                                              workout_location: result.workout_location,
                                              started_at: result.created_at,
                                              has_tracking: result.has_tracking,
                                              last_step: 0,
                                              total_time: result.total_time,
                                              completed: true,
                                              abandoned: false,
                                              device: result.device,
                                              utm_source: result.utm_source,
                                              back_clicks: 0,
                                              offer_selected: null,
                                              order: result.userJourney.hasPurchased ? {
                                                status: result.userJourney.orderStatus,
                                                total_price: result.userJourney.totalSpent,
                                                order_number: result.userJourney.orderNumber || ''
                                              } : null
                                            })}
                                          >
                                            <Eye className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Quiz сесия</TooltipContent>
                                      </UITooltip>
                                    )}
                                    <UITooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyEmail(result.email)}>
                                          <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Копирай email</TooltipContent>
                                    </UITooltip>
                                    <UITooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(`mailto:${result.email}`, "_blank")}>
                                          <Mail className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Изпрати email</TooltipContent>
                                    </UITooltip>
                                    {/* Quick Actions Dropdown */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                          <MoreVertical className="h-3.5 w-3.5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => openNotesDialog(result.email, result.first_name || result.email)}>
                                          <StickyNote className="h-4 w-4 mr-2" />
                                          Добави бележка
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.open(`mailto:${result.email}?subject=Testograph%20-%20`, "_blank")}>
                                          <Mail className="h-4 w-4 mr-2" />
                                          Изпрати email
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => window.open(`/admin/users/${encodeURIComponent(result.email)}`, "_blank")}>
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          Отвори профил
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => copyEmail(result.email)}>
                                          <Copy className="h-4 w-4 mr-2" />
                                          Копирай email
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {userJourneyData.pagination && userJourneyData.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <span className="text-sm text-muted-foreground">
                            Страница {userJourneyPage} от {userJourneyData.pagination.totalPages}
                            {userSearchQuery && <span className="ml-2 text-blue-600">(търсене: "{userSearchQuery}")</span>}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchUserJourneyPage(userJourneyPage - 1, userSearchQuery, userStatusFilter)}
                              disabled={userJourneyPage <= 1}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchUserJourneyPage(userJourneyPage + 1, userSearchQuery, userStatusFilter)}
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
              </>
              )}

              {/* CRM Sub-tab */}
              {sessionsSubTab === "crm" && crmData && (
                <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{crmData.summary.totalQuizUsers}</p>
                    <p className="text-sm text-muted-foreground">Quiz Users (unique emails)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{crmData.summary.totalOrderUsers}</p>
                    <p className="text-sm text-muted-foreground">Order Users (unique emails)</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-purple-600">{crmData.summary.overlap}</p>
                    <p className="text-sm text-muted-foreground">Quiz + Order (both)</p>
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDataSheetConfig({
                              title: "Quiz без поръчка",
                              description: "Потребители завършили quiz, но без Shopify поръчка",
                              dataType: "quiz_no_order",
                            });
                            setDataSheetOpen(true);
                          }}
                          disabled={crmData.segments.quizNoOrder.count === 0}
                        >
                          <Database className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const emails = crmData.segments.quizNoOrder.users.map(u => u.email).join('\n');
                            navigator.clipboard.writeText(emails);
                            toast({ title: "Emails копирани!", description: `${crmData.segments.quizNoOrder.count} emails в clipboard` });
                          }}
                          disabled={crmData.segments.quizNoOrder.count === 0}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => openEmailModal("quizNoOrder")} disabled={crmData.segments.quizNoOrder.count === 0}>
                          <Send className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{crmData.segments.quizNoOrder.action}</p>

                    {/* Expandable email list */}
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                        <span>Покажи всички {crmData.segments.quizNoOrder.count} emails</span>
                      </summary>
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-1 bg-muted/30 rounded-lg p-2">
                        {crmData.segments.quizNoOrder.users.map((user, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1 px-2 bg-background/50 rounded hover:bg-background">
                            <span className="truncate flex-1">{user.email}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => copyEmail(user.email)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </details>
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDataSheetConfig({
                              title: "Поръчка без Quiz",
                              description: "Shopify поръчки без завършен quiz",
                              dataType: "order_no_quiz",
                            });
                            setDataSheetOpen(true);
                          }}
                          disabled={crmData.segments.orderNoQuiz.count === 0}
                        >
                          <Database className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const emails = crmData.segments.orderNoQuiz.users.map(u => u.email).join('\n');
                            navigator.clipboard.writeText(emails);
                            toast({ title: "Emails копирани!", description: `${crmData.segments.orderNoQuiz.count} emails в clipboard` });
                          }}
                          disabled={crmData.segments.orderNoQuiz.count === 0}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => openEmailModal("orderNoQuiz")} disabled={crmData.segments.orderNoQuiz.count === 0}>
                          <Send className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{crmData.segments.orderNoQuiz.action}</p>

                    {/* Expandable email list */}
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                        <span>Покажи всички {crmData.segments.orderNoQuiz.count} emails</span>
                      </summary>
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-1 bg-muted/30 rounded-lg p-2">
                        {crmData.segments.orderNoQuiz.users.map((user, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1 px-2 bg-background/50 rounded hover:bg-background">
                            <div className="flex-1 truncate">
                              <span>{user.email}</span>
                              {user.status === 'paid' && (
                                <Badge variant="outline" className="ml-2 text-[10px] bg-green-500/10 text-green-600">PAID</Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => copyEmail(user.email)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </details>
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const emails = crmData.segments.paidNoQuiz.users.map(u => u.email).join('\n');
                            navigator.clipboard.writeText(emails);
                            toast({ title: "Emails копирани!", description: `${crmData.segments.paidNoQuiz.count} emails в clipboard` });
                          }}
                          disabled={crmData.segments.paidNoQuiz.count === 0}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => openEmailModal("paidNoQuiz")} disabled={crmData.segments.paidNoQuiz.count === 0}>
                          <Send className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{crmData.segments.paidNoQuiz.action}</p>

                    {/* Expandable email list */}
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                        <span>Покажи всички {crmData.segments.paidNoQuiz.count} emails</span>
                      </summary>
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-1 bg-muted/30 rounded-lg p-2">
                        {crmData.segments.paidNoQuiz.users.map((user, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1 px-2 bg-background/50 rounded hover:bg-background">
                            <div className="flex-1 truncate">
                              <span>{user.email}</span>
                              <span className="text-muted-foreground ml-2">{user.total_price} лв</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => copyEmail(user.email)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </details>
                  </CardContent>
                </Card>
              </div>
                </div>
              )}

              {/* Session Explorer Sub-tab */}
              {sessionsSubTab === "explorer" && sessionExplorerData && (
                <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium">Общо сесии</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{sessionExplorerData.summary.totalSessions}</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-green-600">Завършени</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{sessionExplorerData.summary.completedSessions}</div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-950 border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-red-600">Изоставени</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{sessionExplorerData.summary.abandonedSessions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{sessionExplorerData.summary.completionRate}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium">Avg Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(sessionExplorerData.summary.avgTotalTime / 60)}m {sessionExplorerData.summary.avgTotalTime % 60}s
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dropoff Funnel Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Dropoff Funnel
                  </CardTitle>
                  <CardDescription>
                    Колко потребители достигат всеки step и колко отпадат
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={sessionExplorerData.dropoffFunnel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="step" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">Step {data.step}: {STEP_LABELS[data.step] || `Step ${data.step}`}</p>
                                <p className="text-sm text-muted-foreground">Достигнали: {data.reached}</p>
                                <p className="text-sm text-red-500">Отпаднали тук: {data.dropoff} ({data.dropoffRate}%)</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="reached" name="Достигнали" fill="#3b82f6" />
                      <Bar dataKey="dropoff" name="Отпаднали" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Problem Questions */}
              {sessionExplorerData.problemQuestions.length > 0 && (
                <Card className="border-orange-200 dark:border-orange-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="w-5 h-5" />
                      Проблемни въпроси
                    </CardTitle>
                    <CardDescription>
                      Въпроси с висок dropoff (&gt;15%) или бавно време (&gt;60s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sessionExplorerData.problemQuestions.map((q, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">Step {q.step}: {STEP_LABELS[q.step] || q.question_id || `Step ${q.step}`}</p>
                            <p className="text-xs text-muted-foreground">{q.reason}</p>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <p className="text-sm font-medium text-red-500">{q.dropoffRate}% dropoff</p>
                              <p className="text-xs text-muted-foreground">{q.dropoffCount} отпаднали</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{q.avgTime}s avg</p>
                              <p className="text-xs text-muted-foreground">време</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Abandoned Sessions Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    Изоставени сесии ({sessionExplorerData.abandonedSessions.total})
                  </CardTitle>
                  <CardDescription>
                    Потребители които са започнали но не са завършили Quiz-а
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session ID</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Max Step</TableHead>
                        <TableHead>Време</TableHead>
                        <TableHead>Последен отговор</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionExplorerData.abandonedSessions.data.map((session) => (
                        <TableRow key={session.session_id} className="hover:bg-red-50/50 dark:hover:bg-red-950/20">
                          <TableCell className="font-mono text-xs">
                            {session.session_id.substring(0, 20)}...
                          </TableCell>
                          <TableCell>
                            {session.category && (
                              <Badge style={{ backgroundColor: CATEGORY_COLORS[session.category] + "20", color: CATEGORY_COLORS[session.category] }}>
                                {CATEGORY_LABELS[session.category] || session.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {session.device === "mobile" && <Smartphone className="w-4 h-4" />}
                            {session.device === "tablet" && <Tablet className="w-4 h-4" />}
                            {session.device === "desktop" && <Monitor className="w-4 h-4" />}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-red-600">
                              Step {session.max_step}: {STEP_LABELS[session.max_step]?.replace('[Transition] ', '') || `Step ${session.max_step}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {Math.floor(session.total_time / 60)}m {session.total_time % 60}s
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                            {session.last_answer || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(session.started_at).toLocaleDateString("bg-BG")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchSessionTimeline(session.session_id)}
                              disabled={loadingTimeline}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {sessionExplorerData.abandonedSessions.total > pageSize && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Показани {sessionExplorerData.abandonedSessions.offset + 1} - {Math.min(sessionExplorerData.abandonedSessions.offset + pageSize, sessionExplorerData.abandonedSessions.total)} от {sessionExplorerData.abandonedSessions.total}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchAbandonedSessionsPage(abandonedPage - 1)}
                          disabled={abandonedPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchAbandonedSessionsPage(abandonedPage + 1)}
                          disabled={sessionExplorerData.abandonedSessions.offset + pageSize >= sessionExplorerData.abandonedSessions.total}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Completed Sessions */}
              {sessionExplorerData.recentCompleted.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Последни завършени ({sessionExplorerData.summary.completedSessions})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Име</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Категория</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Време</TableHead>
                          <TableHead>Дата</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessionExplorerData.recentCompleted.map((session) => (
                          <TableRow key={session.session_id}>
                            <TableCell className="font-medium">{session.first_name || "—"}</TableCell>
                            <TableCell>{session.email || "—"}</TableCell>
                            <TableCell>
                              {session.category && (
                                <Badge style={{ backgroundColor: CATEGORY_COLORS[session.category] + "20", color: CATEGORY_COLORS[session.category] }}>
                                  {CATEGORY_LABELS[session.category] || session.category}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{session.total_score}</TableCell>
                            <TableCell>
                              {session.level && (
                                <Badge style={{ backgroundColor: LEVEL_COLORS[session.level] + "20", color: LEVEL_COLORS[session.level] }}>
                                  {LEVEL_LABELS[session.level] || session.level}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {Math.floor(session.total_time / 60)}m {session.total_time % 60}s
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {session.completed_at ? new Date(session.completed_at).toLocaleDateString("bg-BG") : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
                </div>
              )}

              {/* Cohort Analysis Sub-tab */}
              {sessionsSubTab === "cohort" && cohortData && (
                <div className="space-y-6">
                  {/* Group By Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Cohort Analysis</h3>
                      <Badge variant="outline">{cohortData.summary.totalCohorts} групи</Badge>
                    </div>
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <Button
                        variant={cohortGroupBy === "week" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => fetchCohortData("week")}
                        disabled={isLoadingCohort}
                      >
                        По седмица
                      </Button>
                      <Button
                        variant={cohortGroupBy === "month" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => fetchCohortData("month")}
                        disabled={isLoadingCohort}
                      >
                        По месец
                      </Button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium">Quiz Completions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{cohortData.summary.totalQuizCompletions}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-amber-600">Avg Order Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{cohortData.summary.avgOrderRate}%</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-green-600">Avg Paid Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{cohortData.summary.avgPaidRate}%</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-purple-600">Avg App Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{cohortData.summary.avgAppRate}%</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-blue-600">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{cohortData.summary.totalRevenue.toLocaleString()} лв</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cohort Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Conversion по период</CardTitle>
                      <CardDescription>Сравнение на conversion rates по {cohortGroupBy === 'week' ? 'седмици' : 'месеци'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cohortData.cohorts.slice(-12)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(value: number, name: string) => {
                              const labels: Record<string, string> = {
                                orderRate: "Order Rate",
                                paidRate: "Paid Rate",
                                appRate: "App Rate",
                              };
                              return [`${value}%`, labels[name] || name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="orderRate" fill="#f59e0b" name="Order Rate" />
                          <Bar dataKey="paidRate" fill="#22c55e" name="Paid Rate" />
                          <Bar dataKey="appRate" fill="#8b5cf6" name="App Rate" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Cohort Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Детайли по Cohort</CardTitle>
                      <CardDescription>Всички периоди с пълна статистика</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Период</TableHead>
                              <TableHead className="text-right">Quiz</TableHead>
                              <TableHead className="text-right">Orders</TableHead>
                              <TableHead className="text-right">Paid</TableHead>
                              <TableHead className="text-right">App</TableHead>
                              <TableHead className="text-right">Revenue</TableHead>
                              <TableHead className="text-right">Categories</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cohortData.cohorts.slice(-20).reverse().map((cohort) => (
                              <TableRow key={cohort.period}>
                                <TableCell className="font-medium">{cohort.period}</TableCell>
                                <TableCell className="text-right">{cohort.quizCompletions}</TableCell>
                                <TableCell className="text-right">
                                  <span className="text-amber-600">{cohort.withOrder}</span>
                                  <span className="text-muted-foreground text-xs ml-1">({cohort.orderRate}%)</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="text-green-600 font-medium">{cohort.withPaidOrder}</span>
                                  <span className="text-muted-foreground text-xs ml-1">({cohort.paidRate}%)</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="text-purple-600">{cohort.withAppRegistration}</span>
                                  <span className="text-muted-foreground text-xs ml-1">({cohort.appRate}%)</span>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {cohort.totalRevenue > 0 ? `${cohort.totalRevenue.toLocaleString()} лв` : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    <UITooltip>
                                      <TooltipTrigger>
                                        <Badge variant="outline" className="text-rose-500 border-rose-300 text-xs">
                                          {cohort.categoryBreakdown.libido}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>Libido</TooltipContent>
                                    </UITooltip>
                                    <UITooltip>
                                      <TooltipTrigger>
                                        <Badge variant="outline" className="text-blue-500 border-blue-300 text-xs">
                                          {cohort.categoryBreakdown.muscle}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>Muscle</TooltipContent>
                                    </UITooltip>
                                    <UITooltip>
                                      <TooltipTrigger>
                                        <Badge variant="outline" className="text-amber-500 border-amber-300 text-xs">
                                          {cohort.categoryBreakdown.energy}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>Energy</TooltipContent>
                                    </UITooltip>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Retention Metrics Sub-tab */}
              {sessionsSubTab === "retention" && (
                <div className="space-y-6">
                  {isLoadingRetention ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Зареждане на retention данни...</span>
                    </div>
                  ) : retentionData ? (
                    <>
                      {/* Key Metrics Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              DAU (Daily)
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">{retentionData.metrics.dau}</div>
                            <p className="text-xs text-muted-foreground">активни днес</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              WAU (Weekly)
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">{retentionData.metrics.wau}</div>
                            <div className="flex items-center text-xs">
                              {retentionData.metrics.wauGrowth >= 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                              )}
                              <span className={retentionData.metrics.wauGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                                {retentionData.metrics.wauGrowth > 0 ? "+" : ""}{retentionData.metrics.wauGrowth}%
                              </span>
                              <span className="text-muted-foreground ml-1">vs предходна седмица</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              MAU (Monthly)
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">{retentionData.metrics.mau}</div>
                            <div className="flex items-center text-xs">
                              {retentionData.metrics.mauGrowth >= 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                              )}
                              <span className={retentionData.metrics.mauGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                                {retentionData.metrics.mauGrowth > 0 ? "+" : ""}{retentionData.metrics.mauGrowth}%
                              </span>
                              <span className="text-muted-foreground ml-1">vs предходен месец</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Total Users
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">{retentionData.metrics.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">всички уникални потребители</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Churn Rate Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className={retentionData.metrics.weeklyChurn > 20 ? "border-red-300" : ""}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Weekly Churn Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-3xl font-bold ${
                              retentionData.metrics.weeklyChurn > 30 ? "text-red-600" :
                              retentionData.metrics.weeklyChurn > 15 ? "text-amber-600" : "text-green-600"
                            }`}>
                              {retentionData.metrics.weeklyChurn}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {retentionData.metrics.weeklyChurn < 10 ? "Отличен" :
                               retentionData.metrics.weeklyChurn < 20 ? "Добър" :
                               retentionData.metrics.weeklyChurn < 30 ? "Среден" : "Висок - изисква внимание!"}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className={retentionData.metrics.monthlyChurn > 30 ? "border-red-300" : ""}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Monthly Churn Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-3xl font-bold ${
                              retentionData.metrics.monthlyChurn > 40 ? "text-red-600" :
                              retentionData.metrics.monthlyChurn > 25 ? "text-amber-600" : "text-green-600"
                            }`}>
                              {retentionData.metrics.monthlyChurn}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {retentionData.metrics.monthlyChurn < 15 ? "Отличен" :
                               retentionData.metrics.monthlyChurn < 25 ? "Добър" :
                               retentionData.metrics.monthlyChurn < 40 ? "Среден" : "Висок - изисква внимание!"}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Engagement by Type */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Engagement по тип активност</CardTitle>
                          <CardDescription>Общ брой действия по вид</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">{retentionData.engagementByType.quiz}</div>
                              <div className="text-xs text-muted-foreground">Quiz-ове</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-amber-600">{retentionData.engagementByType.orders}</div>
                              <div className="text-xs text-muted-foreground">Поръчки</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">{retentionData.engagementByType.workouts}</div>
                              <div className="text-xs text-muted-foreground">Тренировки</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">{retentionData.engagementByType.meals}</div>
                              <div className="text-xs text-muted-foreground">Хранения</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-rose-600">{retentionData.engagementByType.supplements}</div>
                              <div className="text-xs text-muted-foreground">Добавки</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Weekly Retention Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Weekly Retention Trend</CardTitle>
                          <CardDescription>Retention rate по седмици (последни 12 седмици)</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={retentionData.weeklyTrend}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="week"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                              />
                              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} />
                              <Tooltip
                                labelFormatter={(value) => {
                                  const date = new Date(value);
                                  return `Седмица от ${date.toLocaleDateString('bg-BG')}`;
                                }}
                              />
                              <Legend />
                              <Bar yAxisId="left" dataKey="activeUsers" name="Активни" fill="#8884d8" />
                              <Bar yAxisId="left" dataKey="newUsers" name="Нови" fill="#82ca9d" />
                              <Line yAxisId="right" type="monotone" dataKey="retention" name="Retention %" stroke="#ff7300" strokeWidth={2} dot />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Daily Activity Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Daily Activity (последни 30 дни)</CardTitle>
                          <CardDescription>Активни и нови потребители по дни</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={retentionData.dailyTrend}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                              />
                              <YAxis />
                              <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString('bg-BG')}
                              />
                              <Legend />
                              <Line type="monotone" dataKey="activeUsers" name="Активни" stroke="#8884d8" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="newUsers" name="Нови" stroke="#82ca9d" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Refresh button */}
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={fetchRetentionData} disabled={isLoadingRetention}>
                          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingRetention ? 'animate-spin' : ''}`} />
                          Опресни данните
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Кликни на бутона за зареждане на retention данни</p>
                      <Button variant="outline" className="mt-4" onClick={fetchRetentionData}>
                        Зареди данни
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* ============ EMAIL CAMPAIGNS SUB-TAB ============ */}
              {sessionsSubTab === "emails" && (
                <div className="space-y-6">
                  {isLoadingEmailCampaigns ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : emailCampaignData ? (
                    <>
                      {/* Email Stats Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <Send className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                              <div className="text-2xl font-bold">{emailCampaignData.stats.sent || emailCampaignData.stats.total || 0}</div>
                              <p className="text-sm text-muted-foreground">Изпратени</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                              <div className="text-2xl font-bold">{emailCampaignData.stats.delivered || emailCampaignData.stats.opened || 0}</div>
                              <p className="text-sm text-muted-foreground">Доставени</p>
                              <Badge variant="outline" className="mt-1">{emailCampaignData.stats.deliveryRate || 0}%</Badge>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <MailOpen className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                              <div className="text-2xl font-bold">{emailCampaignData.stats.opened || 0}</div>
                              <p className="text-sm text-muted-foreground">Отворени</p>
                              <Badge variant="outline" className="mt-1">{emailCampaignData.stats.openRate || 0}%</Badge>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                              <div className="text-2xl font-bold">{(emailCampaignData.stats.bounced || 0) + (emailCampaignData.stats.complained || 0)}</div>
                              <p className="text-sm text-muted-foreground">Bounce/Spam</p>
                              <Badge variant="outline" className="mt-1">{emailCampaignData.stats.bounceRate || 0}%</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Source indicator */}
                      {emailCampaignData.source === 'resend' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="bg-blue-50">Resend API</Badge>
                          <span>Данните са директно от Resend</span>
                        </div>
                      )}

                      {/* Rates Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-blue-50 dark:bg-blue-900/20">
                          <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                              <div className="text-xl font-bold text-blue-600">{emailCampaignData.stats.deliveryRate || 0}%</div>
                              <p className="text-xs text-muted-foreground">Delivery Rate</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-green-50 dark:bg-green-900/20">
                          <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                              <div className="text-xl font-bold text-green-600">{emailCampaignData.stats.openRate || 0}%</div>
                              <p className="text-xs text-muted-foreground">Open Rate</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-purple-50 dark:bg-purple-900/20">
                          <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                              <div className="text-xl font-bold text-purple-600">{emailCampaignData.stats.clickRate || 0}%</div>
                              <p className="text-xs text-muted-foreground">Click Rate</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-red-50 dark:bg-red-900/20">
                          <CardContent className="pt-4 pb-4">
                            <div className="text-center">
                              <div className="text-xl font-bold text-red-600">{emailCampaignData.stats.bounceRate || 0}%</div>
                              <p className="text-xs text-muted-foreground">Bounce Rate</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Daily Trend Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Email Activity Trend (последни 30 дни)</CardTitle>
                          <CardDescription>Изпратени и доставени имейли по дни</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={emailCampaignData.dailyTrend || []}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                              />
                              <YAxis />
                              <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString('bg-BG')}
                              />
                              <Legend />
                              <Line type="monotone" dataKey="sent" name="Изпратени" stroke="#3b82f6" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="delivered" name="Доставени" stroke="#22c55e" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="bounced" name="Bounced" stroke="#ef4444" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Subject/Template Stats */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Performance по Subject</CardTitle>
                          <CardDescription>Статистика по email subject lines (от Resend)</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Subject</TableHead>
                                  <TableHead className="text-right">Изпратени</TableHead>
                                  <TableHead className="text-right">Доставени</TableHead>
                                  <TableHead className="text-right">Bounced</TableHead>
                                  <TableHead className="text-right">Delivery Rate</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(emailCampaignData.subjectStats || emailCampaignData.templateStats || []).map((item: any, idx: number) => (
                                  <TableRow key={item.subject || item.name || idx}>
                                    <TableCell className="font-medium max-w-[300px] truncate">{item.subject || item.name || 'Без subject'}</TableCell>
                                    <TableCell className="text-right">{item.sent || 0}</TableCell>
                                    <TableCell className="text-right">{item.delivered || item.opened || 0}</TableCell>
                                    <TableCell className="text-right">{item.bounced || 0}</TableCell>
                                    <TableCell className="text-right">
                                      <Badge variant={(item.sent > 0 && ((item.delivered || item.opened || 0) / item.sent * 100) > 80) ? "default" : "secondary"}>
                                        {item.sent > 0 ? Math.round((item.delivered || item.opened || 0) / item.sent * 100) : 0}%
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {(emailCampaignData.subjectStats || emailCampaignData.templateStats || []).length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                      Няма данни
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Top Recipients & Recent Emails Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Recipients */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Top Recipients</CardTitle>
                            <CardDescription>Потребители с най-много получени имейли</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {(emailCampaignData.topRecipients || []).slice(0, 5).map((recipient: any, index: number) => (
                                <div key={recipient.email} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm truncate max-w-[150px]">{recipient.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Badge variant="outline">{recipient.count} sent</Badge>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">{recipient.delivered || recipient.opened || 0} delivered</Badge>
                                  </div>
                                </div>
                              ))}
                              {(emailCampaignData.topRecipients || []).length === 0 && (
                                <p className="text-center text-muted-foreground py-4">Няма данни</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Recent Emails */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Последни имейли</CardTitle>
                            <CardDescription>Най-скорошни изпратени имейли (от Resend)</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                              {(emailCampaignData.recentEmails || []).slice(0, 10).map((email: any) => (
                                <div key={email.id} className="flex items-start justify-between p-2 bg-muted/50 rounded-lg">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{email.recipient || email.recipient_email || 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{email.subject || email.template_name || 'No subject'}</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 ml-2">
                                    <Badge
                                      variant={
                                        email.status === 'delivered' ? 'default' :
                                        email.status === 'bounced' ? 'destructive' :
                                        email.status === 'sent' ? 'default' :
                                        email.status === 'complained' ? 'destructive' :
                                        email.status === 'opened' || email.status === 'clicked' ? 'default' : 'secondary'
                                      }
                                      className="text-xs"
                                    >
                                      {email.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {email.createdAt || email.created_at ? new Date(email.createdAt || email.created_at).toLocaleDateString('bg-BG') : ''}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {(emailCampaignData.recentEmails || []).length === 0 && (
                                <p className="text-center text-muted-foreground py-4">Няма изпратени имейли</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Refresh button */}
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={fetchEmailCampaignData} disabled={isLoadingEmailCampaigns}>
                          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingEmailCampaigns ? 'animate-spin' : ''}`} />
                          Опресни данните
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Кликни на бутона за зареждане на email данни</p>
                      <Button variant="outline" className="mt-4" onClick={fetchEmailCampaignData}>
                        Зареди данни
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step Heatmap Sub-tab */}
              {sessionsSubTab === "heatmap" && (
                <div className="space-y-6">
                  {isLoadingHeatmap ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : heatmapData.length > 0 ? (
                    <>
                      {/* Summary Cards */}
                      {heatmapSummary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                                <div className="text-2xl font-bold">{heatmapSummary.avgTimePerStep}s</div>
                                <p className="text-sm text-muted-foreground">Средно време/стъпка</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                <div className="text-2xl font-bold">{heatmapSummary.totalSamples}</div>
                                <p className="text-sm text-muted-foreground">Общо измервания</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                                <div className="text-2xl font-bold">{heatmapSummary.totalQuestions}</div>
                                <p className="text-sm text-muted-foreground">Въпроси</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                                <div className="text-2xl font-bold">{heatmapSummary.slowestQuestions[0]?.avgTime || 0}s</div>
                                <p className="text-sm text-muted-foreground">Макс време</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Time Distribution Buckets */}
                      {heatmapSummary?.timeBuckets && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Разпределение на времето</CardTitle>
                            <CardDescription>Колко потребители прекарват определено време на въпрос</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                              {Object.entries(heatmapSummary.timeBuckets).map(([bucket, count]) => {
                                const total = Object.values(heatmapSummary.timeBuckets).reduce((sum, c) => sum + c, 0);
                                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                                return (
                                  <div key={bucket} className="text-center p-3 bg-muted/50 rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">{bucket}</div>
                                    <div className="text-xl font-bold">{count}</div>
                                    <div className="text-xs text-muted-foreground">{percent}%</div>
                                    <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                      <div
                                        className="bg-blue-500 h-1 rounded-full"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Heatmap Visualization */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Време по въпроси (Heatmap)</CardTitle>
                          <CardDescription>По-тъмен цвят = по-дълго време за отговор</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                            {heatmapData.map((step) => {
                              // Calculate heat color based on avgTime relative to max
                              const maxTime = heatmapSummary?.slowestQuestions[0]?.avgTime || 30;
                              const intensity = Math.min(step.avgTime / maxTime, 1);
                              const hue = 120 - (intensity * 120); // 120 = green, 0 = red
                              const saturation = 70 + (intensity * 20);
                              const lightness = 85 - (intensity * 35);

                              return (
                                <TooltipProvider key={step.questionId}>
                                  <UITooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className="p-3 rounded-lg text-center cursor-pointer transition-transform hover:scale-105 border"
                                        style={{
                                          backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                                        }}
                                      >
                                        <div className="text-xs font-medium text-gray-700">Q{step.stepNumber}</div>
                                        <div className="text-lg font-bold text-gray-900">{step.avgTime}s</div>
                                        <div className="text-xs text-gray-600">{step.sampleCount} resp</div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <div className="space-y-1">
                                        <p className="font-medium">Question {step.stepNumber}</p>
                                        <p className="text-xs">ID: {step.questionId}</p>
                                        <div className="grid grid-cols-2 gap-x-4 text-xs">
                                          <span>Средно:</span><span className="font-medium">{step.avgTime}s</span>
                                          <span>Медиана:</span><span className="font-medium">{step.medianTime}s</span>
                                          <span>Min:</span><span className="font-medium">{step.minTime}s</span>
                                          <span>Max:</span><span className="font-medium">{step.maxTime}s</span>
                                          <span>P90:</span><span className="font-medium">{step.p90Time}s</span>
                                          <span>Samples:</span><span className="font-medium">{step.sampleCount}</span>
                                        </div>
                                        {step.categoryBreakdown.length > 1 && (
                                          <div className="border-t pt-1 mt-1">
                                            <p className="text-xs font-medium">По категория:</p>
                                            {step.categoryBreakdown.map(cat => (
                                              <p key={cat.category} className="text-xs">
                                                {cat.category}: {Math.round(cat.avgTime * 10) / 10}s ({cat.count})
                                              </p>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </UITooltip>
                                </TooltipProvider>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Slowest and Fastest Questions */}
                      {heatmapSummary && (
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Slowest Questions */}
                          <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/20">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                                <Clock className="w-5 h-5" />
                                Най-бавни въпроси
                              </CardTitle>
                              <CardDescription>Въпроси с най-дълго средно време</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {heatmapSummary.slowestQuestions.map((q, idx) => (
                                  <div key={q.questionId} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="destructive">{idx + 1}</Badge>
                                      <div>
                                        <p className="font-medium">Q{q.stepNumber}</p>
                                        <p className="text-xs text-muted-foreground">{q.sampleCount} отговора</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-red-600">{q.avgTime}s</p>
                                      <p className="text-xs text-muted-foreground">p90: {q.p90Time}s</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Fastest Questions */}
                          <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/20">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                                <TrendingUp className="w-5 h-5" />
                                Най-бързи въпроси
                              </CardTitle>
                              <CardDescription>Въпроси с най-кратко средно време</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {heatmapSummary.fastestQuestions.map((q, idx) => (
                                  <div key={q.questionId} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="default" className="bg-green-500">{idx + 1}</Badge>
                                      <div>
                                        <p className="font-medium">Q{q.stepNumber}</p>
                                        <p className="text-xs text-muted-foreground">{q.sampleCount} отговора</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-green-600">{q.avgTime}s</p>
                                      <p className="text-xs text-muted-foreground">p90: {q.p90Time}s</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Refresh button */}
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={fetchHeatmapData} disabled={isLoadingHeatmap}>
                          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingHeatmap ? 'animate-spin' : ''}`} />
                          Опресни данните
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Кликни на бутона за зареждане на heatmap данни</p>
                      <Button variant="outline" className="mt-4" onClick={fetchHeatmapData}>
                        Зареди данни
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============ METRIC DETAIL MODAL ============ */}
        <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedMetric === 'total' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    Общо Quiz Completions (All-time)
                  </>
                )}
                {selectedMetric === 'tracked' && (
                  <>
                    <Activity className="w-5 h-5 text-amber-500" />
                    Tracked Sessions ({selectedDays === -1 ? 'Всички' : `${selectedDays} дни`})
                  </>
                )}
                {selectedMetric === 'completed' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Завършени Quiz-ове ({selectedDays === -1 ? 'Всички' : `${selectedDays} дни`})
                  </>
                )}
                {selectedMetric === 'abandoned' && (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    Изоставени Quiz-ове ({selectedDays === -1 ? 'Всички' : `${selectedDays} дни`})
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedMetric === 'total' && (
                <>
                  <div className="text-4xl font-bold text-center text-blue-600">
                    {overviewData?.completions.total || 0}
                  </div>
                  <p className="text-center text-muted-foreground">
                    Общ брой завършени quiz-ове от началото
                  </p>
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold">Какво означава:</h4>
                    <p className="text-sm text-muted-foreground">
                      Това е общият брой потребители, които са <strong>завършили целия quiz</strong> и са
                      записани в таблица <code className="bg-muted px-1 rounded">quiz_results_v2</code>.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Източник:</strong> API /api/admin/quiz-flow?view=overview
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Период:</strong> All-time (от началото на проекта)
                      </p>
                    </div>
                  </div>
                  {overviewData?.completions && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">По категории:</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-center">
                          <div className="text-lg font-bold text-red-600">{overviewData.completions.libido}</div>
                          <div className="text-xs text-muted-foreground">Libido</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
                          <div className="text-lg font-bold text-blue-600">{overviewData.completions.muscle}</div>
                          <div className="text-xs text-muted-foreground">Muscle</div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-center">
                          <div className="text-lg font-bold text-yellow-600">{overviewData.completions.energy}</div>
                          <div className="text-xs text-muted-foreground">Energy</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedMetric === 'tracked' && (
                <>
                  <div className="text-4xl font-bold text-center text-amber-600">
                    {statsData?.overview.totalSessions || 0}
                  </div>
                  <p className="text-center text-muted-foreground">
                    Quiz сесии с проследяване на стъпките
                  </p>
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold">Какво означава:</h4>
                    <p className="text-sm text-muted-foreground">
                      Това са сесии записани в <code className="bg-muted px-1 rounded">quiz_step_events</code> -
                      включва <strong>всяка стъпка</strong> от quiz-а (започнати, продължени, изоставени).
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Източник:</strong> API /api/admin/quiz-flow?view=stats&days={selectedDays}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Период:</strong> {selectedDays === -1 ? 'Всички' : `Последните ${selectedDays} дни`}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Breakdown:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
                        <div className="text-lg font-bold text-green-600">{statsData?.overview.completedSessions || 0}</div>
                        <div className="text-xs text-muted-foreground">Завършени</div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-center">
                        <div className="text-lg font-bold text-red-600">{statsData?.overview.abandonedSessions || 0}</div>
                        <div className="text-xs text-muted-foreground">Изоставени</div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-sm text-muted-foreground">Completion Rate: </span>
                      <span className="font-bold">{statsData?.overview.completionRate || 0}%</span>
                    </div>
                  </div>
                </>
              )}

              {selectedMetric === 'completed' && (
                <>
                  <div className="text-4xl font-bold text-center text-green-600">
                    {statsData?.overview.completedSessions || 0}
                  </div>
                  <p className="text-center text-muted-foreground">
                    Успешно завършени quiz-ове (от tracked)
                  </p>
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold">Какво означава:</h4>
                    <p className="text-sm text-muted-foreground">
                      Tracked сесии, които са стигнали до <strong>последната стъпка</strong> и имат
                      свързан запис в <code className="bg-muted px-1 rounded">quiz_results_v2</code>.
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Източник:</strong> API /api/admin/quiz-flow?view=stats&days={selectedDays}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Период:</strong> {selectedDays === -1 ? 'Всички' : `Последните ${selectedDays} дни`}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Completion Rate:</strong> {statsData?.overview.completionRate || 0}% от tracked сесиите
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-center text-muted-foreground">
                      {statsData?.overview.completedSessions || 0} от {statsData?.overview.totalSessions || 0} tracked сесии
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${statsData?.overview.completionRate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}

              {selectedMetric === 'abandoned' && (
                <>
                  <div className="text-4xl font-bold text-center text-red-600">
                    {statsData?.overview.abandonedSessions || 0}
                  </div>
                  <p className="text-center text-muted-foreground">
                    Изоставени quiz сесии (не са завършени)
                  </p>
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold">Какво означава:</h4>
                    <p className="text-sm text-muted-foreground">
                      Tracked сесии, които <strong>НЕ са достигнали</strong> последната стъпка или
                      нямат свързан запис в <code className="bg-muted px-1 rounded">quiz_results_v2</code>.
                    </p>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Източник:</strong> API /api/admin/quiz-flow?view=stats&days={selectedDays}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Период:</strong> {selectedDays === -1 ? 'Всички' : `Последните ${selectedDays} дни`}
                      </p>
                      <p className="text-sm mt-1">
                        <strong>Drop Rate:</strong> {100 - (statsData?.overview.completionRate || 0)}% от tracked сесиите
                      </p>
                    </div>
                  </div>
                  {dropoffsData?.byStep && dropoffsData.byStep.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Къде изоставят:</h4>
                      <div className="space-y-1">
                        {dropoffsData.byStep.slice(0, 5).map((step: any) => (
                          <div key={step.step} className="flex justify-between text-sm">
                            <span>Step {step.step}</span>
                            <span className="font-medium">{step.dropoffs} ({step.dropRate}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* View All Button */}
            <DialogFooter className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  const configs: Record<string, { title: string; description: string; dataType: string; additionalFilters?: Record<string, string> }> = {
                    total: {
                      title: "Всички Quiz Completions",
                      description: "Пълен списък на завършените quiz-ове (all-time)",
                      dataType: "quiz_completions",
                    },
                    tracked: {
                      title: "Tracked Sessions",
                      description: selectedDays === -1 ? `Всички tracked сесии` : `Всички tracked сесии за последните ${selectedDays} дни`,
                      dataType: "quiz_sessions",
                    },
                    completed: {
                      title: "Завършени Quiz-ове",
                      description: selectedDays === -1 ? `Успешно завършени quiz-ове` : `Успешно завършени quiz-ове за последните ${selectedDays} дни`,
                      dataType: "quiz_sessions",
                      additionalFilters: { completed: "true" },
                    },
                    abandoned: {
                      title: "Изоставени Сесии",
                      description: selectedDays === -1 ? `Изоставени quiz сесии` : `Изоставени quiz сесии за последните ${selectedDays} дни`,
                      dataType: "abandoned_sessions",
                    },
                  };
                  if (selectedMetric && configs[selectedMetric]) {
                    setDataSheetConfig(configs[selectedMetric]);
                    setMetricDialogOpen(false);
                    setDataSheetOpen(true);
                  }
                }}
                className="w-full"
              >
                <Database className="w-4 h-4 mr-2" />
                Виж всички записи
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============ DATA SHEET FOR FULL DATA ACCESS ============ */}
        {dataSheetConfig && (
          <DataSheet
            open={dataSheetOpen}
            onOpenChange={setDataSheetOpen}
            title={dataSheetConfig.title}
            description={dataSheetConfig.description}
            dataType={dataSheetConfig.dataType}
            columns={
              dataSheetConfig.dataType === "quiz_completions" || dataSheetConfig.dataType === "by_category" || dataSheetConfig.dataType === "by_level"
                ? quizSessionColumns
                : dataSheetConfig.dataType === "quiz_no_order"
                ? quizNoOrderColumns
                : dataSheetConfig.dataType === "order_no_quiz"
                ? orderNoQuizColumns
                : dataSheetConfig.dataType === "orders" || dataSheetConfig.dataType === "shopify_orders"
                ? orderColumns
                : dataSheetConfig.dataType === "conversions" || dataSheetConfig.dataType === "quiz_to_order"
                ? conversionColumns
                : sessionEventColumns
            }
            fetchUrl="/api/admin/card-details"
            additionalFilters={dataSheetConfig.additionalFilters}
            enableSearch={true}
            enableCategoryFilter={["quiz_completions", "by_category", "by_level", "quiz_no_order", "conversions", "quiz_to_order"].includes(dataSheetConfig.dataType)}
            enableLevelFilter={["quiz_completions", "by_category", "by_level", "quiz_no_order", "conversions", "quiz_to_order"].includes(dataSheetConfig.dataType)}
            enableDateFilter={true}
            enableExport={true}
            navigateToProfile={true}
          />
        )}

        {/* ============ SESSION TIMELINE MODAL ============ */}
        <Dialog open={sessionTimelineModalOpen} onOpenChange={setSessionTimelineModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="flex items-center gap-3">
                <Clock className="w-6 h-6" />
                Session Timeline
              </DialogTitle>
              {sessionTimelineData && (
                <DialogDescription>
                  {sessionTimelineData.is_completed ? (
                    <Badge className="bg-green-500">Завършен</Badge>
                  ) : (
                    <Badge variant="destructive">Изоставен на Step {sessionTimelineData.max_step}</Badge>
                  )}
                  <span className="ml-2">
                    {sessionTimelineData.device && (
                      <span className="text-xs">
                        {sessionTimelineData.device === "mobile" && "Mobile"}
                        {sessionTimelineData.device === "tablet" && "Tablet"}
                        {sessionTimelineData.device === "desktop" && "Desktop"}
                      </span>
                    )}
                  </span>
                </DialogDescription>
              )}
            </DialogHeader>

            {sessionTimelineData && (
              <div className="flex-1 overflow-y-auto py-4">
                {/* Session Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Категория</p>
                    <p className="font-bold">{CATEGORY_LABELS[sessionTimelineData.category || ''] || sessionTimelineData.category || '—'}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Max Step</p>
                    <p className="font-bold">{sessionTimelineData.max_step}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Общо време</p>
                    <p className="font-bold">{Math.floor(sessionTimelineData.total_time / 60)}m {sessionTimelineData.total_time % 60}s</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Events</p>
                    <p className="font-bold">{sessionTimelineData.event_count}</p>
                  </div>
                </div>

                {/* Completion Data */}
                {sessionTimelineData.completion_data && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                    <p className="font-medium text-green-600 mb-2">Завършил Quiz</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Име:</span> {sessionTimelineData.completion_data.first_name || '—'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span> {sessionTimelineData.completion_data.email}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Score:</span> {sessionTimelineData.completion_data.total_score}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Level:</span> {LEVEL_LABELS[sessionTimelineData.completion_data.level] || sessionTimelineData.completion_data.level}
                      </div>
                    </div>
                  </div>
                )}

                {/* Answers Summary */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Отговори ({sessionTimelineData.answers.length})
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {sessionTimelineData.answers.map((ans, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                        <div>
                          <span className="text-xs text-muted-foreground mr-2">Step {ans.step}:</span>
                          <span className="font-medium">{STEP_LABELS[ans.step]?.replace('[Transition] ', '') || ans.question_id || `Step ${ans.step}`}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{ans.answer}</Badge>
                          {ans.time_spent && (
                            <span className="text-xs text-muted-foreground">{ans.time_spent}s</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
                {/* Status Banner - Completed or Abandoned */}
                {(() => {
                  const isCompleted = selectedSession.stats.completed;
                  const isAbandoned = selectedSession.stats.abandoned || (!isCompleted && selectedSession.stats.maxStep < 24);

                  // Find when they left (last event or quiz_abandoned event)
                  const lastEvent = selectedSession.timeline[selectedSession.timeline.length - 1];
                  const abandonedEvent = selectedSession.timeline.find(e => e.event_type === 'quiz_abandoned');
                  const pageHiddenEvents = selectedSession.timeline.filter(e => e.event_type === 'page_hidden');
                  const lastPageHidden = pageHiddenEvents[pageHiddenEvents.length - 1];

                  const exitTime = abandonedEvent?.timestamp || lastPageHidden?.timestamp || lastEvent?.timestamp;
                  const exitStep = selectedSession.stats.maxStep;
                  const exitStepLabel = STEP_LABELS[exitStep] || `Step ${exitStep}`;

                  if (isCompleted) {
                    return (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-green-600">Завършен Quiz</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(lastEvent?.timestamp).toLocaleString("bg-BG")}
                          </span>
                        </div>
                      </div>
                    );
                  } else if (isAbandoned) {
                    return (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="font-medium text-red-600">Напуснал Quiz</span>
                          <Badge variant="outline" className="ml-2 text-red-600 border-red-300">
                            на Step {exitStep + 1}: {exitStepLabel.replace('[Transition] ', '')}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Последна активност: {exitTime ? new Date(exitTime).toLocaleString("bg-BG") : "Неизвестно"}
                          </span>
                          {pageHiddenEvents.length > 0 && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <AlertTriangle className="w-3 h-3" />
                              {pageHiddenEvents.length}x скрил страницата
                            </span>
                          )}
                          {selectedSession.stats.backClicks > 0 && (
                            <span className="flex items-center gap-1">
                              <ChevronLeft className="w-3 h-3" />
                              {selectedSession.stats.backClicks}x назад
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* User Info & Audit Section */}
                {(selectedSessionInfo || selectedUserJourney) && (
                  <div className="bg-muted/30 rounded-lg p-3 mb-3">
                    <div className="flex items-start justify-between gap-4">
                      {/* User Identity */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedSessionInfo?.first_name || selectedUserJourney?.quiz?.firstName || "—"}</p>
                          <p className="text-sm text-muted-foreground">{selectedSessionInfo?.email || selectedUserJourney?.email || "—"}</p>
                        </div>
                      </div>

                      {/* Quick Status Badges */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {/* Order Status */}
                        {selectedSessionInfo?.order ? (
                          <Badge className={selectedSessionInfo.order.status === "paid" ? "bg-green-500" : "bg-amber-500"}>
                            {selectedSessionInfo.order.status === "paid" ? "✓ Платено" : "⏳ Pending"} {selectedSessionInfo.order.total_price} лв
                          </Badge>
                        ) : selectedUserJourney?.orders?.total > 0 ? (
                          <Badge className={selectedUserJourney.orders.paid > 0 ? "bg-green-500" : "bg-amber-500"}>
                            {selectedUserJourney.orders.paid > 0 ? "✓ Платено" : "⏳ Pending"} {selectedUserJourney.orders.totalSpent} лв
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-500 border-red-300">Няма поръчка</Badge>
                        )}

                        {/* App Registration */}
                        {selectedUserJourney?.appAccess?.isRegistered ? (
                          <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                            📱 В приложението
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">Не е в App</Badge>
                        )}

                        {/* Paid Order Status */}
                        {selectedUserJourney?.orders?.paid > 0 && (
                          <Badge className="bg-green-500">Платена поръчка</Badge>
                        )}

                        {/* Capsules */}
                        {selectedUserJourney?.inventory?.capsulesRemaining > 0 && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            💊 {selectedUserJourney.inventory.capsulesRemaining} капсули
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Detailed User Journey (if loaded) */}
                    {selectedUserJourney && (
                      <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        {/* Quiz Score */}
                        <div className="bg-background/50 rounded p-2">
                          <p className="text-muted-foreground">Quiz Score</p>
                          <p className="font-bold text-lg">{selectedUserJourney.quiz?.totalScore || "—"}</p>
                          <p className="text-muted-foreground capitalize">{selectedUserJourney.quiz?.level || "—"}</p>
                        </div>

                        {/* Orders */}
                        <div className="bg-background/50 rounded p-2">
                          <p className="text-muted-foreground">Поръчки</p>
                          <p className="font-bold text-lg">{selectedUserJourney.orders?.paid || 0} платени</p>
                          <p className="text-muted-foreground">{selectedUserJourney.orders?.totalCapsules || 0} капсули общо</p>
                        </div>

                        {/* App Usage */}
                        <div className="bg-background/50 rounded p-2">
                          <p className="text-muted-foreground">App Активност</p>
                          <p className="font-bold text-lg">{selectedUserJourney.appUsage?.daysWithActivity || 0} дни</p>
                          <p className="text-muted-foreground">{selectedUserJourney.appUsage?.avgComplianceRate || 0}% compliance</p>
                        </div>

                        {/* Journey Stage */}
                        <div className="bg-background/50 rounded p-2">
                          <p className="text-muted-foreground">Статус</p>
                          <p className="font-bold text-sm">
                            {selectedUserJourney.status?.stage === 'active_user' && 'Активен'}
                            {selectedUserJourney.status?.stage === 'app_no_activity' && 'В App без активност'}
                            {selectedUserJourney.status?.stage === 'paid_no_app' && 'Платил, не е в App'}
                            {selectedUserJourney.status?.stage === 'order_pending' && 'Чака плащане'}
                            {selectedUserJourney.status?.stage === 'quiz_no_order' && 'Quiz без поръчка'}
                            {selectedUserJourney.status?.stage === 'no_quiz' && 'Без Quiz'}
                          </p>
                          {selectedUserJourney.appAccess?.quizLevel && (
                            <p className="text-muted-foreground">Ниво: {selectedUserJourney.appAccess.quizLevel}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                    <p className="text-2xl font-bold">
                      {selectedSession.stats.maxStep + 1}
                      <span className="text-base font-normal text-muted-foreground"> / {Object.keys(STEP_LABELS).length}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Стъпка достигната</p>
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

        {/* ============ SAVE FILTER DIALOG ============ */}
        <Dialog open={saveFilterDialogOpen} onOpenChange={setSaveFilterDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Запази текущия филтър
              </DialogTitle>
              <DialogDescription>
                Запази текущите настройки за бърз достъп в бъдеще
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="filter-name">Име на филтъра *</Label>
                <Input
                  id="filter-name"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  placeholder="напр. Libido 30 дни"
                />
              </div>
              <div>
                <Label htmlFor="filter-description">Описание (по избор)</Label>
                <Textarea
                  id="filter-description"
                  value={newFilterDescription}
                  onChange={(e) => setNewFilterDescription(e.target.value)}
                  placeholder="Кратко описание на филтъра..."
                  rows={2}
                />
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="font-medium mb-2">Текущи настройки:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Период: {selectedDays === -1 ? 'Всички' : `${selectedDays} дни`}</li>
                  <li>Категория: {categoryFilter === 'all' ? 'Всички' : categoryFilter}</li>
                  <li>Sub-tab: {sessionsSubTab}</li>
                  {sessionsSubTab === 'cohort' && <li>Cohort групиране: {cohortGroupBy}</li>}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveFilterDialogOpen(false)}>
                Откажи
              </Button>
              <Button onClick={saveCurrentFilter} disabled={isSavingFilter || !newFilterName.trim()}>
                {isSavingFilter ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Запазване...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Запази филтър
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============ ALERTS MANAGEMENT DIALOG ============ */}
        <Dialog open={alertsDialogOpen} onOpenChange={setAlertsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Управление на известия
              </DialogTitle>
              <DialogDescription>
                Настройте условия за получаване на известия при промяна на метрики
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setCreateAlertDialogOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ново известие
                </Button>
              </div>

              {isLoadingAlerts ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Няма настроени известия</p>
                  <p className="text-sm mt-1">Създайте ново известие за да получавате уведомления</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${alert.is_active ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800 opacity-60'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{alert.name}</h4>
                            <Badge variant={alert.is_active ? 'default' : 'secondary'}>
                              {alert.is_active ? 'Активно' : 'Неактивно'}
                            </Badge>
                          </div>
                          {alert.description && (
                            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2 text-xs">
                            <Badge variant="outline">
                              {alert.metric_type === 'completion_rate' ? 'Completion Rate' :
                               alert.metric_type === 'daily_sessions' ? 'Daily Sessions' :
                               alert.metric_type === 'conversion_rate' ? 'Conversion Rate' :
                               alert.metric_type === 'abandoned_rate' ? 'Abandoned Rate' : alert.metric_type}
                            </Badge>
                            <Badge variant="outline">
                              {alert.condition === 'below' ? 'под' : alert.condition === 'above' ? 'над' : 'промяна с'} {alert.threshold}
                              {['completion_rate', 'conversion_rate', 'abandoned_rate'].includes(alert.metric_type) ? '%' : ''}
                            </Badge>
                            {alert.category !== 'all' && (
                              <Badge variant="outline">{alert.category}</Badge>
                            )}
                          </div>
                          {alert.trigger_count > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Задействано {alert.trigger_count} пъти
                              {alert.last_triggered_at && ` (последно: ${new Date(alert.last_triggered_at).toLocaleString('bg-BG')})`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAlert(alert.id, !alert.is_active)}
                            className={alert.is_active ? 'hover:bg-yellow-100 hover:text-yellow-700' : 'hover:bg-green-100 hover:text-green-700'}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAlert(alert.id)}
                            className="hover:bg-red-100 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAlertsDialogOpen(false)}>
                Затвори
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============ CREATE ALERT DIALOG ============ */}
        <Dialog open={createAlertDialogOpen} onOpenChange={setCreateAlertDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Ново известие
              </DialogTitle>
              <DialogDescription>
                Настройте условие за получаване на известие
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="alert-name">Име на известието *</Label>
                <Input
                  id="alert-name"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                  placeholder="напр. Нисък Completion Rate"
                />
              </div>
              <div>
                <Label htmlFor="alert-description">Описание (по избор)</Label>
                <Textarea
                  id="alert-description"
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  placeholder="Кратко описание..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Метрика *</Label>
                  <Select
                    value={newAlert.metric_type}
                    onValueChange={(value) => setNewAlert({ ...newAlert, metric_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completion_rate">Completion Rate (%)</SelectItem>
                      <SelectItem value="daily_sessions">Daily Sessions</SelectItem>
                      <SelectItem value="conversion_rate">Conversion Rate (%)</SelectItem>
                      <SelectItem value="abandoned_rate">Abandoned Rate (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Условие *</Label>
                  <Select
                    value={newAlert.condition}
                    onValueChange={(value) => setNewAlert({ ...newAlert, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="below">Под</SelectItem>
                      <SelectItem value="above">Над</SelectItem>
                      <SelectItem value="change_percent">Промяна с</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alert-threshold">
                    Праг *
                    {['completion_rate', 'conversion_rate', 'abandoned_rate'].includes(newAlert.metric_type) && ' (%)'}
                  </Label>
                  <Input
                    id="alert-threshold"
                    type="number"
                    value={newAlert.threshold}
                    onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) || 0 })}
                    min={0}
                    max={newAlert.metric_type === 'daily_sessions' ? 10000 : 100}
                  />
                </div>
                <div>
                  <Label>Категория</Label>
                  <Select
                    value={newAlert.category}
                    onValueChange={(value) => setNewAlert({ ...newAlert, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всички</SelectItem>
                      <SelectItem value="libido">Libido</SelectItem>
                      <SelectItem value="muscle">Muscle</SelectItem>
                      <SelectItem value="energy">Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Преглед:</p>
                <p className="text-muted-foreground">
                  Ще получите известие когато{' '}
                  <span className="font-medium">
                    {newAlert.metric_type === 'completion_rate' ? 'Completion Rate' :
                     newAlert.metric_type === 'daily_sessions' ? 'Daily Sessions' :
                     newAlert.metric_type === 'conversion_rate' ? 'Conversion Rate' :
                     newAlert.metric_type === 'abandoned_rate' ? 'Abandoned Rate' : newAlert.metric_type}
                  </span>
                  {' '}
                  {newAlert.condition === 'below' ? 'падне под' : newAlert.condition === 'above' ? 'надхвърли' : 'се промени с'}
                  {' '}
                  <span className="font-medium">
                    {newAlert.threshold}
                    {['completion_rate', 'conversion_rate', 'abandoned_rate'].includes(newAlert.metric_type) ? '%' : ''}
                  </span>
                  {newAlert.category !== 'all' && ` за категория ${newAlert.category}`}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateAlertDialogOpen(false)}>
                Откажи
              </Button>
              <Button onClick={createAlert} disabled={!newAlert.name.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Създай известие
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Notes Dialog */}
        <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Бележки за {selectedUserForNote?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedUserForNote?.email}
              </DialogDescription>
            </DialogHeader>

            {/* Add new note */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Нова бележка</Label>
                <Textarea
                  placeholder="Напишете бележка за този потребител..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button
                onClick={addNoteToUser}
                disabled={!newNote.trim() || isAddingNote}
                className="w-full"
              >
                {isAddingNote ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Добави бележка
              </Button>
            </div>

            {/* Existing notes */}
            {userNotes.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label className="text-muted-foreground">Предишни бележки ({userNotes.length})</Label>
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {userNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-muted/50 rounded-lg p-3 space-y-1 group relative"
                    >
                      <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(note.created_at).toLocaleDateString("bg-BG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteNote(note.id)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userNotes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Няма бележки за този потребител
              </p>
            )}
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </AdminLayout>
  );
}
