'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Activity,
  Loader2,
  DollarSign,
  ShoppingCart,
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
}

interface RecentPurchase {
  id: string;
  email: string;
  productName: string;
  amount: number;
  purchasedAt: string;
  profiles: {
    name: string;
  };
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
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

      if (usersRes.ok && funnelRes.ok && chatRes.ok && purchasesRes.ok) {
        // Calculate stats
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const recentChats = chatData.sessions.filter(
          (s: any) => new Date(s.created_at) > oneDayAgo
        ).length;

        const recentFunnels = funnelData.stats.totalSessions || 0;

        setStats({
          totalChatSessions: chatData.total,
          totalFunnelSessions: funnelData.stats.totalSessions,
          totalUsers: usersData.total,
          conversionRate: funnelData.stats.overallConversionRate,
          recentChatSessions: recentChats,
          recentFunnelSessions: recentFunnels,
          totalRevenue: purchasesData.stats.totalRevenue,
          totalPurchases: purchasesData.stats.totalPurchases,
          averageOrderValue: purchasesData.stats.averageOrderValue,
        });

        setRecentPurchases(purchasesData.purchases || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Преглед на всички системни metrics и последна активност
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Общо Потребители
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Уникални emails в системата
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat Сесии
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalChatSessions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.recentChatSessions || 0} последните 24ч
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Funnel Сесии
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalFunnelSessions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Последните 30 дни
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Общо Приходи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.totalRevenue || 0} лв
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.totalPurchases || 0} покупки
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Средна Стойност
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.averageOrderValue || 0} лв
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.conversionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Последните 30 дни
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:bg-accent cursor-pointer transition-colors" onClick={() => router.push('/admin/chat-sessions')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Sessions
                </span>
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Виж всички chat разговори</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:bg-accent cursor-pointer transition-colors" onClick={() => router.push('/admin/users')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users
                </span>
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Преглед на потребители</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:bg-accent cursor-pointer transition-colors" onClick={() => router.push('/admin/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Funnel Analytics
                </span>
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Детайлна analytics за funnel</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Последни Покупки
                </CardTitle>
                <CardDescription>Най-скорошните 10 поръчки</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentPurchases.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Няма покупки все още
              </p>
            ) : (
              <div className="space-y-3">
                {recentPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => {
                      // Extract email - handle both direct email and nested profiles structure
                      const email = purchase.profiles ?
                        (typeof purchase.profiles === 'object' && 'email' in purchase.profiles ?
                          (purchase.profiles as any).email : purchase.email)
                        : purchase.email;
                      if (email) {
                        router.push(`/admin/users/${encodeURIComponent(email)}`);
                      }
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {purchase.profiles?.name || purchase.email || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {purchase.productName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        {purchase.amount} лв
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(purchase.purchasedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Последните действия в системата</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                Виж всички
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Няма последна активност
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        activity.type === 'chat_session'
                          ? 'bg-blue-100 text-blue-600'
                          : activity.type === 'funnel_session'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {formatDate(activity.timestamp)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
