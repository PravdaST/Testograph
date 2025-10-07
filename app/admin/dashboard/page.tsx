'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { SkeletonCard, SkeletonTable } from '@/components/admin/SkeletonCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { SearchBar } from '@/components/admin/SearchBar';
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
} from 'lucide-react';

interface DashboardStats {
  totalChatSessions: number;
  totalFunnelSessions: number;
  totalUsers: number;
  conversionRate: number;
  recentChatSessions: number;
  recentFunnelSessions: number;
  totalRevenue: number;
  totalPurchases: number;
  averageOrderValue: number;
  appStats?: {
    totalUsers: number;
    activeMealPlans: number;
    sleepLogsLast30Days: number;
    exerciseLogsLast30Days: number;
    totalLabResults: number;
  };
  proStats?: {
    totalUsers: number;
    activeProtocols: number;
    dailyEntriesLast30Days: number;
    averageCompliance: number | null;
    totalWeightTracking: number;
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

      // Fetch users for stats
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();

      // Fetch funnel stats
      const funnelRes = await fetch('/api/analytics/funnel-stats?days=30');
      const funnelData = await funnelRes.json();

      // Fetch chat sessions
      const chatRes = await fetch('/api/admin/chat-sessions?limit=1000');
      const chatData = await chatRes.json();

      // Fetch purchases
      const purchasesRes = await fetch('/api/admin/purchases?limit=10');
      const purchasesData = await purchasesRes.json();

      // Fetch app/pro stats
      const appProRes = await fetch('/api/admin/app-pro-stats');
      const appProData = await appProRes.json();

      if (usersRes.ok && funnelRes.ok && chatRes.ok && purchasesRes.ok) {
        // Calculate stats
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const recentChats = (chatData?.sessions || []).filter(
          (s: any) => new Date(s.created_at) > oneDayAgo
        ).length;

        const recentFunnels = funnelData?.stats?.totalSessions ?? 0;

        setStats({
          totalChatSessions: chatData?.total ?? 0,
          totalFunnelSessions: funnelData?.stats?.totalSessions ?? 0,
          totalUsers: usersData?.total ?? 0,
          conversionRate: funnelData?.stats?.overallConversionRate ?? 0,
          recentChatSessions: recentChats,
          recentFunnelSessions: recentFunnels,
          totalRevenue: purchasesData?.stats?.totalRevenue ?? 0,
          totalPurchases: purchasesData?.stats?.totalPurchases ?? 0,
          averageOrderValue: purchasesData?.stats?.averageOrderValue ?? 0,
          appStats: (appProRes.ok && appProData?.app) ? appProData.app : undefined,
          proStats: (appProRes.ok && appProData?.pro) ? appProData.pro : undefined,
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {lastUpdated && `Last updated: ${formatTimestamp(lastUpdated)}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users, purchases..."
              className="w-full md:w-64"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            description="Уникални emails в системата"
          />
          <StatCard
            title="Total Revenue"
            value={`${stats?.totalRevenue || 0} лв`}
            icon={DollarSign}
            valueColor="text-green-600"
            description={`${stats?.totalPurchases || 0} purchases`}
            trend={{ value: 12, label: 'vs last month' }}
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats?.conversionRate || 0}%`}
            icon={CheckCircle}
            valueColor="text-green-600"
            trend={{ value: 5, label: 'vs last month' }}
          />
          <StatCard
            title="Active Sessions"
            value={(stats?.totalChatSessions || 0) + (stats?.totalFunnelSessions || 0)}
            icon={Activity}
            description={`${stats?.recentChatSessions || 0} chats, ${stats?.recentFunnelSessions || 0} funnels`}
          />
        </div>

        {/* Product Usage */}
        {(stats?.appStats || stats?.proStats) && (
          <>
            <div>
              <h2 className="text-xl font-semibold">Product Usage</h2>
              <p className="text-sm text-muted-foreground mt-1">
                App and PRO features usage metrics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Highlighted user counts */}
              {stats?.appStats && (
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">App Users</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{stats.appStats.totalUsers}</div>
                  </CardContent>
                </Card>
              )}
              {stats?.proStats && (
                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">PRO Users</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{stats.proStats.totalUsers}</div>
                  </CardContent>
                </Card>
              )}

              {/* App metrics */}
              {stats?.appStats && (
                <>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Utensils className="h-4 w-4" />
                        <span className="font-medium">Meal Plans</span>
                      </div>
                      <div className="text-2xl font-bold">{stats.appStats.activeMealPlans}</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Moon className="h-4 w-4" />
                        <span className="font-medium">Sleep Logs</span>
                      </div>
                      <div className="text-2xl font-bold">{stats.appStats.sleepLogsLast30Days}</div>
                      <p className="text-xs text-muted-foreground mt-1">Last 30d</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Dumbbell className="h-4 w-4" />
                        <span className="font-medium">Exercise Logs</span>
                      </div>
                      <div className="text-2xl font-bold">{stats.appStats.exerciseLogsLast30Days}</div>
                      <p className="text-xs text-muted-foreground mt-1">Last 30d</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Second row - PRO metrics and Lab Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats?.appStats && (
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <FlaskConical className="h-4 w-4" />
                      <span className="font-medium">Lab Results</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.appStats.totalLabResults}</div>
                  </CardContent>
                </Card>
              )}
              {stats?.proStats && (
                <>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">Active Protocols</span>
                      </div>
                      <div className="text-2xl font-bold">{stats.proStats.activeProtocols}</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Flame className="h-4 w-4" />
                        <span className="font-medium">Daily Entries</span>
                      </div>
                      <div className="text-2xl font-bold">{stats.proStats.dailyEntriesLast30Days}</div>
                      <p className="text-xs text-muted-foreground mt-1">Last 30d</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Avg Compliance</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.proStats.averageCompliance?.toFixed(1) || 'N/A'}/10
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
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
                Recent Purchases
              </CardTitle>
              {searchQuery && (
                <p className="text-xs text-muted-foreground">
                  Showing {filteredPurchases.length} of {recentPurchases.length} purchases
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
                Recent Activity
              </CardTitle>
              {searchQuery && (
                <p className="text-xs text-muted-foreground">
                  Showing {filteredActivities.length} of {activities.length} activities
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
      </div>
    </AdminLayout>
  );
}
