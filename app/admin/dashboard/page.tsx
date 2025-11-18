'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { SkeletonCard, SkeletonTable } from '@/components/admin/SkeletonCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { SearchBar } from '@/components/admin/SearchBar';
import { UsersGrowthChart } from '@/components/admin/UsersGrowthChart';
import { RevenueTrendChart } from '@/components/admin/RevenueTrendChart';
import { getCurrentAdminUser } from '@/lib/admin/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle,
  Activity,
  Loader2,
  DollarSign,
  ShoppingCart,
  Utensils,
  Moon,
  FlaskConical,
  Dumbbell,
  Target,
  Flame,
  RefreshCw,
  Mail,
  Shield,
  ClipboardList,
  ClipboardCheck,
  Zap,
  Database,
  Server,
  Clock,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface DashboardStats {
  quiz: {
    totalCompletions: number;
    categoryBreakdown: {
      energy: number;
      libido: number;
      muscle: number;
    };
    categoryPercentages: {
      energy: number;
      libido: number;
      muscle: number;
    };
    averageScore: number;
    workoutLocationBreakdown: {
      gym: number;
      home: number;
    };
    dietaryPreferences: {
      omnivor: number;
      vegetarian: number;
      vegan: number;
      pescatarian: number;
    };
  };
  users: {
    total: number;
    active: number;
    activePercentage: number;
    proUsers: number;
  };
  engagement: {
    period: string;
    mealLogs: number;
    workoutSessions: number;
    sleepEntries: number;
    testoUpCompliance: number;
    proDailyEntries: number;
    proCompliance: number;
  };
  purchases: {
    totalRevenue: number;
    totalPurchases: number;
    averageOrderValue: number;
    productBreakdown: Record<string, number>;
  };
  program: {
    completionRate: number;
    completedPrograms: number;
    activePrograms: number;
  };
  trends?: {
    revenue: { value: number; label: string };
    users: { value: number; label: string };
    conversion: { value: number; label: string };
  };
}

interface RecentPurchase {
  id: string;
  userEmail: string;
  userName: string | null;
  productName: string;
  amount: number;
  purchasedAt: string;
}

interface ActivityEvent {
  id: string;
  type: string;
  timestamp: string;
  user: string;
  description: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin user authentication
  const [adminId, setAdminId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // New states for enhancements
  const [timeRange, setTimeRange] = useState<string>('30');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [usersGrowthData, setUsersGrowthData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState({
    dbStatus: 'healthy',
    apiResponseTime: 0,
    activeSessions: 0,
  });
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Clear test data states
  const [clearDataModal, setClearDataModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  // Fetch admin user on mount
  // NOTE: AdminLayout already handles auth check and redirect,
  // so we only need to get user data here (no redirect needed)
  useEffect(() => {
    const fetchAdminUser = async () => {
      console.log('[DEBUG Dashboard] Fetching admin user data...');
      const { adminUser, userId, email } = await getCurrentAdminUser();
      console.log('[DEBUG Dashboard] getCurrentAdminUser returned:', { hasAdminUser: !!adminUser, userId, email });
      if (adminUser) {
        console.log('[DEBUG Dashboard] Admin user found, setting state');
        setAdminId(userId);
        setAdminEmail(email);
      }
      // No redirect here - AdminLayout handles that
    };
    fetchAdminUser();
  }, [router]);

  useEffect(() => {
    if (adminId && adminEmail) {
      fetchDashboardData();
      fetchChartsData();
    }
  }, [adminId, adminEmail]);

  useEffect(() => {
    if (adminId && adminEmail) {
      fetchChartsData();
    }
  }, [timeRange, adminId, adminEmail]);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      // Fetch activity feed
      const activityRes = await fetch('/api/admin/activity?limit=10');
      const activityData = await activityRes.json();
      if (activityRes.ok) {
        setActivities(activityData.activities);
      }

      // Fetch comprehensive app stats from testograph-v2
      const appStatsRes = await fetch('/api/admin/app-stats');
      const appStatsData = await appStatsRes.json();

      // Fetch purchases
      const purchasesRes = await fetch('/api/admin/purchases?limit=10');
      const purchasesData = await purchasesRes.json();

      // Fetch trends data
      const trendsRes = await fetch('/api/admin/stats/trends');
      const trendsData = await trendsRes.json();

      if (appStatsRes.ok && purchasesRes.ok) {
        setStats({
          quiz: appStatsData.quiz || {
            totalCompletions: 0,
            categoryBreakdown: { energy: 0, libido: 0, muscle: 0 },
            categoryPercentages: { energy: 0, libido: 0, muscle: 0 },
            averageScore: 0,
            workoutLocationBreakdown: { gym: 0, home: 0 },
            dietaryPreferences: { omnivor: 0, vegetarian: 0, vegan: 0, pescatarian: 0 },
          },
          users: appStatsData.users || {
            total: 0,
            active: 0,
            activePercentage: 0,
            proUsers: 0,
          },
          engagement: appStatsData.engagement || {
            period: '30 days',
            mealLogs: 0,
            workoutSessions: 0,
            sleepEntries: 0,
            testoUpCompliance: 0,
            proDailyEntries: 0,
            proCompliance: 0,
          },
          purchases: appStatsData.purchases || {
            totalRevenue: 0,
            totalPurchases: 0,
            averageOrderValue: 0,
            productBreakdown: {},
          },
          program: appStatsData.program || {
            completionRate: 0,
            completedPrograms: 0,
            activePrograms: 0,
          },
          trends: (trendsRes.ok && trendsData?.trends) ? trendsData.trends : undefined,
        });

        setRecentPurchases(purchasesData.purchases || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }
  };

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh) {
      // Refresh every 60 seconds
      autoRefreshInterval.current = setInterval(() => {
        fetchDashboardData(true);
        fetchChartsData();
      }, 60000);
    } else {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
        autoRefreshInterval.current = null;
      }
    }

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [autoRefresh]);

  // Fetch charts data
  const fetchChartsData = async () => {
    setChartsLoading(true);
    try {
      const startTime = Date.now();
      const response = await fetch(`/api/admin/stats/growth?days=${timeRange}`);
      const apiResponseTime = Date.now() - startTime;

      const data = await response.json();

      if (response.ok) {
        setUsersGrowthData(data.usersGrowth || []);
        setRevenueData(data.revenueData || []);
        // Database is healthy if API returned data successfully
        const dbIsHealthy = data.usersGrowth || data.revenueData;
        setSystemHealth({
          dbStatus: dbIsHealthy ? 'healthy' : 'degraded',
          apiResponseTime,
          activeSessions: data.usersGrowth?.[data.usersGrowth.length - 1]?.users || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching charts data:', error);
      setSystemHealth({
        dbStatus: 'error',
        apiResponseTime: 0,
        activeSessions: 0,
      });
    } finally {
      setChartsLoading(false);
    }
  };

  // Clear test data handler
  const handleClearData = async () => {
    if (confirmText !== 'DELETE ALL' || !confirmChecked) {
      toast({
        title: 'Грешка',
        description: 'Моля, потвърдете действието',
        variant: 'destructive',
      });
      return;
    }

    setIsClearingData(true);
    try {
      const response = await fetch('/api/admin/clear-test-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          adminEmail,
          confirmText,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех',
          description: `Изтрити ${data.stats.deletedUsers} потребители и всички техни данни`,
        });
        setClearDataModal(false);
        setConfirmText('');
        setConfirmChecked(false);
        // Refresh dashboard data
        fetchDashboardData();
        fetchChartsData();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно изтриване на данни',
        variant: 'destructive',
      });
    } finally {
      setIsClearingData(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Току-що';
    if (diffMins < 60) return `Преди ${diffMins} мин`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Преди ${diffHours} ч`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Преди ${diffDays} дни`;

    return date.toLocaleDateString('bg-BG');
  };

  const getActivityIcon = (type: string) => {
    if (type === 'chat_session') return <MessageSquare className="h-4 w-4" />;
    if (type === 'funnel_session') return <TrendingUp className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'току-що';
    if (diffMins < 60) return `преди ${diffMins} мин`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `преди ${diffHours} ч`;

    return date.toLocaleDateString('bg-BG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Filter purchases and activities based on search
  const filteredPurchases = recentPurchases.filter(p =>
    searchQuery === '' ||
    p.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activities.filter(a =>
    searchQuery === '' ||
    a.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Зареждане на данни...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Product Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <SkeletonTable rows={5} />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <SkeletonTable rows={5} />
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Search and Refresh */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Табло за Управление</h1>
              <p className="text-muted-foreground mt-1">
                {lastUpdated && `Последна актуализация: ${formatTimestamp(lastUpdated)}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Търси потребители, покупки..."
                className="w-full md:w-64"
              />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 дни</SelectItem>
                  <SelectItem value="30">30 дни</SelectItem>
                  <SelectItem value="90">90 дни</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchDashboardData(true);
                  fetchChartsData();
                }}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Обнови
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={autoRefresh}
              onCheckedChange={(checked) => setAutoRefresh(checked as boolean)}
              id="auto-refresh"
            />
            <label htmlFor="auto-refresh" className="cursor-pointer text-muted-foreground">
              Автоматично обновяване (на всеки 60 сек)
            </label>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Quiz Завършени"
            value={stats?.quiz.totalCompletions || 0}
            icon={ClipboardCheck}
            description={`Средeн Score: ${stats?.quiz.averageScore || 0}`}
          />
          <StatCard
            title="Активни Потребители"
            value={stats?.users.active || 0}
            icon={Users}
            description={`${stats?.users.activePercentage || 0}% от ${stats?.users.total || 0} общо`}
          />
          <StatCard
            title="Общ Приход"
            value={`${stats?.purchases.totalRevenue || 0} лв`}
            icon={DollarSign}
            valueColor="text-green-600"
            description={`${stats?.purchases.totalPurchases || 0} покупки`}
            trend={stats?.trends?.revenue}
          />
          <StatCard
            title="Програми Завършени"
            value={`${stats?.program.completionRate || 0}%`}
            icon={Target}
            valueColor="text-green-600"
            description={`${stats?.program.completedPrograms || 0} от ${stats?.quiz.totalCompletions || 0}`}
          />
        </div>

        {/* Quick Actions & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Бързи Действия
              </CardTitle>
              <CardDescription>Shortcuts към често използвани функции</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/admin/communication')}
                >
                  <Mail className="h-6 w-6 text-primary" />
                  <span className="text-sm">Изпрати Email</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/admin/settings')}
                >
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-sm">Добави Админ</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/admin/audit-logs')}
                >
                  <ClipboardList className="h-6 w-6 text-primary" />
                  <span className="text-sm">Audit Logs</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/admin/access')}
                >
                  <Target className="h-6 w-6 text-primary" />
                  <span className="text-sm">PRO Достъп</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Състояние на Системата
              </CardTitle>
              <CardDescription>Real-time system health indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Database Status</span>
                </div>
                <Badge
                  variant={systemHealth.dbStatus === 'healthy' ? 'default' : 'destructive'}
                  className={systemHealth.dbStatus === 'healthy' ? 'bg-green-600' : ''}
                >
                  {systemHealth.dbStatus === 'healthy' ? 'Healthy' : 'Error'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">API Response Time</span>
                </div>
                <Badge variant="outline">{systemHealth.apiResponseTime}ms</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Users</span>
                </div>
                <Badge variant="outline">{stats?.users.total || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Last Update</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {lastUpdated ? formatTimestamp(lastUpdated) : '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Необратими действия - използвайте с повишено внимание</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <Trash2 className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">Clear Test Data</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Изтрива ВСИЧКИ потребители и техни данни от базата (quiz results, profiles, purchases, tracking data, PRO entries).
                      Admin user-ът ({adminEmail || 'текущия админ'}) ще бъде запазен.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setClearDataModal(true)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Test Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsersGrowthChart data={usersGrowthData} isLoading={chartsLoading} />
          <RevenueTrendChart data={revenueData} isLoading={chartsLoading} />
        </div>

        {/* Quiz Categories & Engagement */}
        {stats && (
          <>
            <div>
              <h2 className="text-xl font-semibold">Анализ на Quiz Резултати</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Разпределение по категории и предпочитания на потребителите
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-orange-500 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Energy (Енергия)</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{stats.quiz.categoryBreakdown.energy}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.quiz.categoryPercentages.energy}% от всички</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-pink-500 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="h-4 w-4 text-pink-600" />
                    <span className="font-medium">Libido (Либидо)</span>
                  </div>
                  <div className="text-2xl font-bold text-pink-600">{stats.quiz.categoryBreakdown.libido}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.quiz.categoryPercentages.libido}% от всички</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Dumbbell className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Muscle (Мускули)</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.quiz.categoryBreakdown.muscle}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.quiz.categoryPercentages.muscle}% от всички</p>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Metrics */}
            <div>
              <h2 className="text-xl font-semibold">Engagement Метрики (30 дни)</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Активност на потребителите в последните {stats.engagement.period}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Utensils className="h-4 w-4" />
                    <span className="font-medium">Хранителни Записи</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.engagement.mealLogs}</div>
                  <p className="text-xs text-muted-foreground mt-1">Последни 30д</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Dumbbell className="h-4 w-4" />
                    <span className="font-medium">Тренировки</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.engagement.workoutSessions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Последни 30д</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Moon className="h-4 w-4" />
                    <span className="font-medium">Записи за Сън</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.engagement.sleepEntries}</div>
                  <p className="text-xs text-muted-foreground mt-1">Последни 30д</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <FlaskConical className="h-4 w-4" />
                    <span className="font-medium">TestoUP Compliance</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.engagement.testoUpCompliance}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Средно спазване</p>
                </CardContent>
              </Card>
            </div>

            {/* PRO Stats & User Preferences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PRO Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Testograph PRO
                  </CardTitle>
                  <CardDescription>Метрики за PRO потребители</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">PRO Потребители</span>
                    </div>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">{stats.users.proUsers}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Дневни Записи (30д)</span>
                    </div>
                    <Badge variant="outline">{stats.engagement.proDailyEntries}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Средна Дисциплина</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">{stats.engagement.proCompliance}/10</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* User Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Предпочитания на Потребителите
                  </CardTitle>
                  <CardDescription>Тренировъчна локация и диета</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Тренировъчна Локация</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🏋️ Gym</span>
                        <Badge variant="outline">{stats.quiz.workoutLocationBreakdown.gym}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🏠 Home</span>
                        <Badge variant="outline">{stats.quiz.workoutLocationBreakdown.home}</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Хранителни Предпочитания</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🍖 Omnivor</span>
                        <Badge variant="outline">{stats.quiz.dietaryPreferences.omnivor}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🥬 Vegetarian</span>
                        <Badge variant="outline">{stats.quiz.dietaryPreferences.vegetarian}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🌱 Vegan</span>
                        <Badge variant="outline">{stats.quiz.dietaryPreferences.vegan}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🐟 Pescatarian</span>
                        <Badge variant="outline">{stats.quiz.dietaryPreferences.pescatarian}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Revenue & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Purchases */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Последни Покупки
              </CardTitle>
              {searchQuery && (
                <p className="text-xs text-muted-foreground">
                  Показвам {filteredPurchases.length} от {recentPurchases.length} покупки
                </p>
              )}
            </CardHeader>
            <CardContent>
              {filteredPurchases.length === 0 ? (
                searchQuery ? (
                  <EmptyState
                    icon={ShoppingCart}
                    title="No matching purchases"
                    description={`No purchases found for "${searchQuery}"`}
                  />
                ) : (
                  <EmptyState
                    icon={ShoppingCart}
                    title="No purchases yet"
                    description="Purchases will appear here once users make their first order"
                  />
                )
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="h-10">User</TableHead>
                        <TableHead className="h-10">Product</TableHead>
                        <TableHead className="h-10 text-right">Amount</TableHead>
                        <TableHead className="h-10 text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchases.map((purchase, index) => (
                        <TableRow
                          key={purchase.id}
                          className={`h-10 cursor-pointer transition-colors ${
                            index % 2 === 0 ? '' : 'bg-muted/30'
                          }`}
                          onClick={() => router.push(`/admin/users/${encodeURIComponent(purchase.userEmail)}`)}
                        >
                          <TableCell className="font-medium text-sm py-2">
                            {purchase.userName || purchase.userEmail}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-2">
                            {purchase.productName}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600 text-sm py-2">
                            {purchase.amount} лв
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground py-2">
                            {formatDate(purchase.purchasedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Последна Активност
              </CardTitle>
              {searchQuery && (
                <p className="text-xs text-muted-foreground">
                  Показвам {filteredActivities.length} от {activities.length} активности
                </p>
              )}
            </CardHeader>
            <CardContent>
              {filteredActivities.length === 0 ? (
                searchQuery ? (
                  <EmptyState
                    icon={Activity}
                    title="No matching activity"
                    description={`No activity found for "${searchQuery}"`}
                  />
                ) : (
                  <EmptyState
                    icon={Activity}
                    title="No recent activity"
                    description="User activity will appear here"
                  />
                )
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-12 h-10"></TableHead>
                        <TableHead className="h-10">User</TableHead>
                        <TableHead className="h-10">Action</TableHead>
                        <TableHead className="h-10 text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActivities.map((activity, index) => (
                        <TableRow
                          key={activity.id}
                          className={`h-10 transition-colors ${
                            index % 2 === 0 ? '' : 'bg-muted/30'
                          }`}
                        >
                          <TableCell className="py-2">
                            <div
                              className={`flex items-center justify-center w-7 h-7 rounded-full ${
                                activity.type === 'chat_session'
                                  ? 'bg-blue-100 text-blue-600'
                                  : activity.type === 'funnel_session'
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {getActivityIcon(activity.type)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-sm py-2">{activity.user}</TableCell>
                          <TableCell className="text-xs text-muted-foreground py-2">
                            {activity.description}
                          </TableCell>
                          <TableCell className="text-right py-2">
                            <Badge variant="outline" className="text-xs">
                              {formatDate(activity.timestamp)}
                            </Badge>
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

        {/* Clear Test Data Dialog */}
        <Dialog open={clearDataModal} onOpenChange={setClearDataModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Внимание! Необратимо действие
              </DialogTitle>
              <DialogDescription>
                Това действие ще изтрие ВСИЧКИ потребители и техните данни от базата данни. Това включва:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Warning list */}
              <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Всички auth users (освен {adminEmail || 'текущия админ'})</li>
                  <li>• Profiles</li>
                  <li>• Quiz Results (quiz_results_v2)</li>
                  <li>• Purchases</li>
                  <li>• Meal completions, workout sessions, sleep tracking</li>
                  <li>• TestoUP tracking</li>
                  <li>• PRO daily entries</li>
                  <li>• User settings</li>
                </ul>
              </div>

              {/* Confirmation checkbox */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="confirm-clear"
                  checked={confirmChecked}
                  onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
                />
                <label
                  htmlFor="confirm-clear"
                  className="text-sm text-muted-foreground cursor-pointer leading-tight"
                >
                  Разбирам че това ще изтрие ВСИЧКИ данни необратимо
                </label>
              </div>

              {/* Confirmation text input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Напиши <code className="bg-muted px-1 py-0.5 rounded text-destructive">DELETE ALL</code> за потвърждение:
                </label>
                <Input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE ALL"
                  className="font-mono"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setClearDataModal(false);
                  setConfirmText('');
                  setConfirmChecked(false);
                }}
                disabled={isClearingData}
              >
                Откажи
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearData}
                disabled={!confirmChecked || confirmText !== 'DELETE ALL' || isClearingData}
              >
                {isClearingData ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Изтриване...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Изтрий всички данни
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
