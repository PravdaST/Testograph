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

interface UserProfileData {
  email: string;
  stats: UserStats;
  timeline: TimelineEvent[];
  purchases: Purchase[];
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
      const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}`);
      const data: UserProfileData = await response.json();

      if (response.ok) {
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
