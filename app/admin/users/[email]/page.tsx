'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  User,
  MessageSquare,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  MousePointer,
  Eye,
  ShoppingCart,
  DollarSign,
  Package,
  Utensils,
  Moon,
  FlaskConical,
  Dumbbell,
  Activity,
  Target,
  Flame,
  Trophy,
  Scale,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'chat_session' | 'funnel_session' | 'funnel_event' | 'purchase';
  timestamp: string;
  data: any;
}

interface UserStats {
  totalChatSessions: number;
  totalFunnelAttempts: number;
  completedFunnels: number;
  totalEvents: number;
  firstName: string | null;
  totalPurchases: number;
  totalSpent: number;
  activeApps: string[];
}

interface Purchase {
  id: string;
  productName: string;
  productType: string;
  amount: number;
  currency: string;
  status: string;
  appsIncluded: string[];
  purchasedAt: string;
}

interface AppDataStats {
  mealPlan: {
    hasActivePlan: boolean;
    planData: any;
    createdAt: string | null;
  };
  sleepLogs: {
    totalLogs: number;
    latestLogs: any[];
    averageQuality: number | null;
    lastLogDate: string | null;
  };
  labResults: {
    totalResults: number;
    latestResults: any[];
    lastTestDate: string | null;
  };
  exerciseLogs: {
    totalLogs: number;
    latestLogs: any[];
    lastWorkoutDate: string | null;
  };
  analyticsEvents: {
    totalEvents: number;
    recentEvents: any[];
    mostUsedFeatures: string[];
  };
}

interface ProDataStats {
  protocolActive: boolean;
  protocolStartDate: string | null;
  daysOnProtocol: number;
  dailyEntries: {
    totalEntries: number;
    latestEntries: any[];
    complianceRate: number;
    averageFeeling: number | null;
    averageEnergy: number | null;
    averageCompliance: number | null;
    currentStreak: number;
    longestStreak: number;
    missedDays: number;
  };
  weeklyMeasurements: {
    totalMeasurements: number;
    latestMeasurements: any[];
    weightChange: number | null;
    startWeight: number | null;
    currentWeight: number | null;
  };
}

interface UserProfileData {
  email: string;
  stats: UserStats;
  timeline: TimelineEvent[];
  purchases: Purchase[];
  appData?: AppDataStats;
  proData?: ProDataStats;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const email = decodeURIComponent(params?.email as string);

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (email) {
      fetchUserProfile();
    }
  }, [email]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      // Fetch base profile data
      const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}`);
      const data: UserProfileData = await response.json();

      if (response.ok) {
        // Fetch app data
        try {
          const appResponse = await fetch(`/api/admin/app-data/${encodeURIComponent(email)}`);
          if (appResponse.ok) {
            const appData = await appResponse.json();
            data.appData = appData.stats;
          }
        } catch (err) {
          console.error('Error fetching app data:', err);
        }

        // Fetch PRO data
        try {
          const proResponse = await fetch(`/api/admin/pro-data/${encodeURIComponent(email)}`);
          if (proResponse.ok) {
            const proData = await proResponse.json();
            data.proData = proData.stats;
          }
        } catch (err) {
          console.error('Error fetching PRO data:', err);
        }

        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('bg-BG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (type: string, eventType?: string) => {
    if (type === 'chat_session') return <MessageSquare className="h-4 w-4" />;
    if (type === 'funnel_session') return <TrendingUp className="h-4 w-4" />;
    if (type === 'purchase') return <ShoppingCart className="h-4 w-4" />;
    if (eventType === 'offer_viewed') return <Eye className="h-4 w-4" />;
    if (eventType === 'button_clicked') return <MousePointer className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getEventTitle = (event: TimelineEvent) => {
    if (event.type === 'chat_session') {
      return 'Нова Chat Сесия';
    }
    if (event.type === 'funnel_session') {
      return event.data.completed ? 'Завършен Funnel' : 'Започнат Funnel';
    }
    if (event.type === 'purchase') {
      return `🎉 Покупка: ${event.data.product_name}`;
    }
    if (event.type === 'funnel_event') {
      const eventType = event.data.event_type;
      if (eventType === 'offer_viewed') {
        return `Видял ${event.data.metadata?.offerTier || ''} оферта`;
      }
      if (eventType === 'button_clicked') {
        return `Кликнал: ${event.data.metadata?.buttonText || 'бутон'}`;
      }
      if (eventType === 'exit_intent') {
        return 'Exit Intent Detection';
      }
    }
    return 'Събитие';
  };

  const getEventDescription = (event: TimelineEvent) => {
    if (event.type === 'chat_session') {
      return event.data.pdf_filename
        ? `PDF: ${event.data.pdf_filename}`
        : 'Без PDF файл';
    }
    if (event.type === 'funnel_session') {
      return `Offer: ${event.data.offer_tier || 'Няма'} | Step ${event.data.exit_step || 'N/A'}`;
    }
    if (event.type === 'purchase') {
      const apps = event.data.apps_included || [];
      return `${event.data.amount} ${event.data.currency} | ${apps.length} apps`;
    }
    if (event.type === 'funnel_event') {
      return `Step ${event.data.step_number}`;
    }
    return '';
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

  if (!profileData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Потребителят не е намерен</p>
          <Button className="mt-4" onClick={() => router.push('/admin/users')}>
            Обратно към потребителите
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/users')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">User Profile</h1>
            <p className="text-muted-foreground mt-1">{email}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat Сесии
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profileData.stats.totalChatSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Funnel Опити
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profileData.stats.totalFunnelAttempts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Завършени
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {profileData.stats.completedFunnels}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Покупки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {profileData.stats.totalPurchases}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Общо Платено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {profileData.stats.totalSpent} лв
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Apps */}
        {profileData.stats.activeApps && profileData.stats.activeApps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Активни Услуги
              </CardTitle>
              <CardDescription>
                Apps до които потребителят има достъп
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.stats.activeApps.map((app) => (
                  <Badge key={app} variant="default" className="text-sm">
                    {app}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchases History */}
        {profileData.purchases && profileData.purchases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                История на Покупките
              </CardTitle>
              <CardDescription>
                Всички покупки направени от потребителя
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileData.purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{purchase.productName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {purchase.productType}
                        </Badge>
                        <Badge
                          variant={purchase.status === 'completed' ? 'default' : 'secondary'}
                          className={purchase.status === 'completed' ? 'bg-green-600' : ''}
                        >
                          {purchase.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(purchase.purchasedAt)}
                      </p>
                      {purchase.appsIncluded && purchase.appsIncluded.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {purchase.appsIncluded.map((app) => (
                            <Badge key={app} variant="secondary" className="text-xs">
                              {app}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-green-600">
                        {purchase.amount} {purchase.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Testograph-app Data */}
        {profileData.appData && profileData.appData.mealPlan && (
          <>
            {/* Meal Planning */}
            {profileData.appData.mealPlan.hasActivePlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Meal Planning
                  </CardTitle>
                  <CardDescription>
                    Активен meal plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Създаден на:</span>
                      <Badge variant="outline">
                        {profileData.appData.mealPlan.createdAt
                          ? new Date(profileData.appData.mealPlan.createdAt).toLocaleDateString('bg-BG')
                          : 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Статус:</span>
                      <Badge className="bg-green-600">Активен План</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sleep Logs */}
            {profileData.appData.sleepLogs && profileData.appData.sleepLogs.totalLogs > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Sleep Protocol
                  </CardTitle>
                  <CardDescription>
                    Sleep tracking история
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Общо записи</p>
                      <p className="text-2xl font-bold">{profileData.appData.sleepLogs.totalLogs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Среден Quality</p>
                      <p className="text-2xl font-bold">
                        {profileData.appData.sleepLogs.averageQuality?.toFixed(1) || 'N/A'}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Последен запис</p>
                      <p className="text-sm font-medium">
                        {profileData.appData.sleepLogs.lastLogDate
                          ? new Date(profileData.appData.sleepLogs.lastLogDate).toLocaleDateString('bg-BG')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {profileData.appData.sleepLogs.latestLogs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Последни 5 записа:</p>
                      {profileData.appData.sleepLogs.latestLogs.slice(0, 5).map((log: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 bg-accent rounded">
                          <span>{new Date(log.log_date).toLocaleDateString('bg-BG')}</span>
                          <span>{log.bedtime} - {log.waketime}</span>
                          <Badge variant="outline">Quality: {log.quality}/10</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lab Results */}
            {profileData.appData.labResults && profileData.appData.labResults.totalResults > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    Lab Results
                  </CardTitle>
                  <CardDescription>
                    Лабораторни резултати история
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Общо тестове</p>
                      <p className="text-2xl font-bold">{profileData.appData.labResults.totalResults}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Последен тест</p>
                      <p className="text-sm font-medium">
                        {profileData.appData.labResults.lastTestDate
                          ? new Date(profileData.appData.labResults.lastTestDate).toLocaleDateString('bg-BG')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {profileData.appData.labResults.latestResults.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Последни резултати:</p>
                      {profileData.appData.labResults.latestResults.slice(0, 3).map((result: any, i: number) => (
                        <div key={i} className="p-3 bg-accent rounded space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{new Date(result.test_date).toLocaleDateString('bg-BG')}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Total T: {result.total_testosterone || 'N/A'}</div>
                            <div>Free T: {result.free_testosterone || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Exercise Logs */}
            {profileData.appData.exerciseLogs && profileData.appData.exerciseLogs.totalLogs > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Exercise Activity
                  </CardTitle>
                  <CardDescription>
                    Workout история
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Общо тренировки</p>
                      <p className="text-2xl font-bold">{profileData.appData.exerciseLogs.totalLogs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Последна тренировка</p>
                      <p className="text-sm font-medium">
                        {profileData.appData.exerciseLogs.lastWorkoutDate
                          ? new Date(profileData.appData.exerciseLogs.lastWorkoutDate).toLocaleDateString('bg-BG')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Events */}
            {profileData.appData.analyticsEvents && profileData.appData.analyticsEvents.totalEvents > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    App Activity
                  </CardTitle>
                  <CardDescription>
                    Най-използвани features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Общо събития: {profileData.appData.analyticsEvents.totalEvents}</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.appData.analyticsEvents.mostUsedFeatures.map((feature) => (
                        <Badge key={feature} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Testograph-PRO Data */}
        {profileData.proData && profileData.proData.protocolActive && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Testograph PRO Protocol
              </CardTitle>
              <CardDescription>
                Progress към подобряване на testosterone нивата
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Protocol Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">{profileData.proData.daysOnProtocol}</p>
                  <p className="text-xs text-muted-foreground">Дни на протокол</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                  <p className="text-2xl font-bold text-orange-500">{profileData.proData.dailyEntries.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Текущ streak</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-2xl font-bold text-yellow-500">{profileData.proData.dailyEntries.longestStreak}</p>
                  <p className="text-xs text-muted-foreground">Най-дълъг streak</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{profileData.proData.dailyEntries.complianceRate}%</p>
                  <p className="text-xs text-muted-foreground">Compliance</p>
                </div>
              </div>

              {/* Daily Stats */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Средни показатели
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-sm text-muted-foreground">Общо усещане</p>
                    <p className="text-xl font-bold">
                      {profileData.proData.dailyEntries.averageFeeling?.toFixed(1) || 'N/A'}/10
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-sm text-muted-foreground">Енергия</p>
                    <p className="text-xl font-bold">
                      {profileData.proData.dailyEntries.averageEnergy?.toFixed(1) || 'N/A'}/10
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-sm text-muted-foreground">Compliance</p>
                    <p className="text-xl font-bold">
                      {profileData.proData.dailyEntries.averageCompliance?.toFixed(1) || 'N/A'}/10
                    </p>
                  </div>
                </div>
              </div>

              {/* Weight Tracking */}
              {profileData.proData.weeklyMeasurements && profileData.proData.weeklyMeasurements.totalMeasurements > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Weight Tracking
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-muted-foreground">Начално тегло</p>
                      <p className="text-xl font-bold">
                        {profileData.proData.weeklyMeasurements.startWeight?.toFixed(1) || 'N/A'} kg
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-muted-foreground">Текущо тегло</p>
                      <p className="text-xl font-bold">
                        {profileData.proData.weeklyMeasurements.currentWeight?.toFixed(1) || 'N/A'} kg
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-muted-foreground">Промяна</p>
                      <p className={`text-xl font-bold ${
                        (profileData.proData.weeklyMeasurements.weightChange || 0) > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {profileData.proData.weeklyMeasurements.weightChange?.toFixed(1) || 'N/A'} kg
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Missed Days Warning */}
              {profileData.proData.dailyEntries && profileData.proData.dailyEntries.missedDays > 0 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <XCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm">
                    <span className="font-medium">{profileData.proData.dailyEntries.missedDays}</span> пропуснати дни tracking
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
            <CardDescription>
              Хронология на всички действия на потребителя
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileData.timeline.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Няма записани активности
              </p>
            ) : (
              <div className="space-y-4">
                {profileData.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          event.type === 'chat_session'
                            ? 'bg-blue-100 text-blue-600'
                            : event.type === 'funnel_session'
                            ? 'bg-purple-100 text-purple-600'
                            : event.type === 'purchase'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {getEventIcon(event.type, event.data.event_type)}
                      </div>
                      {index < profileData.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{getEventTitle(event)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {getEventDescription(event)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatTime(event.timestamp)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
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
