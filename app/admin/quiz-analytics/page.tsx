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
  User,
  Radio,
  Search,
  MessageSquare,
  Filter,
  BarChart2,
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

  // Sub-tab for sessions-crm
  const [sessionsSubTab, setSessionsSubTab] = useState<'users' | 'crm' | 'explorer'>('users');

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

      const [statsRes, funnelRes, dropOffRes, sessionsRes, trendsRes, userJourneyRes, overviewRes, crmRes, sessionExplorerRes] = await Promise.all([
        fetch(`${baseUrl}/api/admin/quiz-flow?view=stats&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=funnel&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=dropoffs&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=sessions&days=0${categoryParam}&limit=${pageSize}&offset=0`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=trends&days=${selectedDays}${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=user-journey&days=0${categoryParam}&limit=${pageSize}&offset=0`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=overview${categoryParam}`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=crm`),
        fetch(`${baseUrl}/api/admin/quiz-flow?view=session-explorer&days=0${categoryParam}`),
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

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
                  <CreditCard className="w-4 h-4 text-green-500" />
                  Платени поръчки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {userJourneyData?.conversionStats.purchaseRate || 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-500" />
                  В App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {userJourneyData?.conversionStats.registrationRate || 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  Активни
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {userJourneyData?.conversionStats.activeRate || 0}%
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
              {/* Circular Progress Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Quiz Completions (All-time) */}
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
                    <p className="mt-2 text-sm text-muted-foreground">Общо Quiz</p>
                    <p className="text-xs text-muted-foreground">(all-time)</p>
                  </div>
                </Card>

                {/* Tracked Sessions */}
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
                    <p className="mt-2 text-sm text-muted-foreground">Tracked</p>
                    <p className="text-xs text-muted-foreground">({selectedDays} дни)</p>
                  </div>
                </Card>

                {/* Completed from Tracked */}
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
                    <p className="mt-2 text-sm text-muted-foreground">Завършени</p>
                    <p className="text-xs text-muted-foreground">({selectedDays} дни)</p>
                  </div>
                </Card>

                {/* Abandoned from Tracked */}
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
                    <p className="mt-2 text-sm text-muted-foreground">Изоставени</p>
                    <p className="text-xs text-muted-foreground">({selectedDays} дни)</p>
                  </div>
                </Card>
              </div>

              {/* Pie Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Pie */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Категории</CardTitle>
                    <CardDescription className="text-xs">Общо: {categoryChartData.reduce((a, b) => a + b.value, 0)}</CardDescription>
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
                        <div key={entry.name} className="flex items-center gap-1 text-xs">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span>{entry.name}: <strong>{entry.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Level Pie */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Нива</CardTitle>
                    <CardDescription className="text-xs">Общо: {levelChartData.reduce((a, b) => a + b.value, 0)}</CardDescription>
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
                        <div key={entry.name} className="flex items-center gap-1 text-xs">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span>{entry.name}: <strong>{entry.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Device Pie */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Устройства</CardTitle>
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
                            <div key={entry.name} className="flex items-center gap-1 text-xs">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                              <span>{entry.name}: <strong>{entry.value}</strong></span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Age Pie */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Възраст</CardTitle>
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
                            <div key={entry.name} className="flex items-center gap-1 text-xs">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                              <span>{entry.name}: <strong>{entry.value}</strong></span>
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
                  <Card className="border-l-4 border-l-green-500">
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
                  <Card className="border-l-4 border-l-red-500">
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
                    Tracked Sessions ({selectedDays} дни)
                  </>
                )}
                {selectedMetric === 'completed' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Завършени Quiz-ове ({selectedDays} дни)
                  </>
                )}
                {selectedMetric === 'abandoned' && (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    Изоставени Quiz-ове ({selectedDays} дни)
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
                        <strong>Период:</strong> Последните {selectedDays} дни
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
                        <strong>Период:</strong> Последните {selectedDays} дни
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
                        <strong>Период:</strong> Последните {selectedDays} дни
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
          </DialogContent>
        </Dialog>

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
      </TooltipProvider>
    </AdminLayout>
  );
}
