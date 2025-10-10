'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'recharts';
import { RefreshCw, Download, TrendingUp, Users, Target, Clock } from 'lucide-react';
import { HeatmapChart } from '@/components/analytics/HeatmapChart';
import { TrendComparisonChart } from '@/components/analytics/TrendComparisonChart';
import { UTMBreakdown } from '@/components/analytics/UTMBreakdown';
import { SessionsTable } from '@/components/analytics/SessionsTable';
import { SessionJourneyModal } from '@/components/analytics/SessionJourneyModal';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

interface SessionData {
  sessionId: string;
  email: string | null;
  name: string | null;
  currentStep: number;
  maxStep: number;
  completed: boolean;
  entryTime: string;
  lastActivity: string;
  offerTier: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  exitStep: number | null;
}

interface FunnelStats {
  stats: {
    totalSessions: number;
    completedSessions: number;
    overallConversionRate: number;
    avgTimeInFunnel: number;
    mostCommonExitStep: number | null;
    totalCTAClicks: number;
  };
  conversionFunnel: Array<{
    step: number;
    visitors: number;
    conversionRate: number;
  }>;
  offerPerformance: {
    premium: number;
    regular: number;
    digital: number;
  };
  dropOffData: Array<{
    step: number;
    exits: number;
    percentage: number;
  }>;
  utmBreakdown: {
    sources: Record<string, number>;
    mediums: Record<string, number>;
    campaigns: Record<string, number>;
  };
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
    unknown: number;
  };
  sessionsList: SessionData[];
  dateRange: {
    from: string;
    to: string;
    days: number;
  };
}

interface TimeSpentData {
  timeSpentData: Array<{
    step: number;
    avgSeconds: number;
    minSeconds: number;
    maxSeconds: number;
    sampleSize: number;
  }>;
}

interface TrendsData {
  heatmapData: Array<{
    step: number;
    intensity: number;
    enters: number;
    exits: number;
    clicks: number;
    total: number;
  }>;
  trendData: Array<{
    date: string;
    sessions: number;
    completed: number;
    dropped: number;
    conversionRate: number;
  }>;
  avgTimePerStep: Array<{
    step: number;
    avgSeconds: number;
    sampleSize: number;
  }>;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsDashboard() {
  const [funnelStats, setFunnelStats] = useState<FunnelStats | null>(null);
  const [timeSpentData, setTimeSpentData] = useState<TimeSpentData | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsJourneyModalOpen(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use absolute URLs to prevent any URL resolution issues
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const statsUrl = `${baseUrl}/api/analytics/funnel-stats?days=${selectedDays}${statusParam}`;
      const timeUrl = `${baseUrl}/api/analytics/time-spent?days=${selectedDays}`;
      const trendsUrl = `${baseUrl}/api/analytics/trends?days=${selectedDays}`;

      console.log('🔍 Fetching analytics data from:', { statsUrl, timeUrl, trendsUrl });

      const [statsRes, timeRes, trendsRes] = await Promise.all([
        fetch(statsUrl),
        fetch(timeUrl),
        fetch(trendsUrl),
      ]);

      console.log('📊 Response status:', {
        stats: statsRes.status,
        time: timeRes.status,
        trends: trendsRes.status,
      });

      if (!statsRes.ok || !timeRes.ok || !trendsRes.ok) {
        const errors = [];
        if (!statsRes.ok) errors.push(`Stats API: ${statsRes.status} ${statsRes.statusText}`);
        if (!timeRes.ok) errors.push(`Time API: ${timeRes.status} ${timeRes.statusText}`);
        if (!trendsRes.ok) errors.push(`Trends API: ${trendsRes.status} ${trendsRes.statusText}`);
        throw new Error(`API errors: ${errors.join(', ')}`);
      }

      const stats = await statsRes.json();
      const time = await timeRes.json();
      const trends = await trendsRes.json();

      console.log('✅ Analytics data loaded successfully');

      setFunnelStats(stats);
      setTimeSpentData(time);
      setTrendsData(trends);
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      // Show user-friendly error
      alert(
        'Failed to load analytics data. Please try:\n' +
          '1. Hard refresh the page (Ctrl+Shift+R)\n' +
          '2. Clear browser cache\n' +
          '3. Check browser console for details\n\n' +
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDays, statusFilter]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const exportToCSV = () => {
    if (!funnelStats) return;

    let csv = 'Funnel Analytics Report\\n\\n';
    csv += `Date Range: Last ${selectedDays} days\\n\\n`;
    csv += 'Overall Stats\\n';
    csv += `Total Sessions,${funnelStats.stats.totalSessions}\\n`;
    csv += `Completed Sessions,${funnelStats.stats.completedSessions}\\n`;
    csv += `Conversion Rate,${funnelStats.stats.overallConversionRate}%\\n`;
    csv += `Avg Time in Funnel,${formatTime(funnelStats.stats.avgTimeInFunnel)}\\n\\n`;

    csv += 'Conversion Funnel\\n';
    csv += 'Step,Visitors,Conversion Rate\\n';
    funnelStats.conversionFunnel.forEach((item) => {
      csv += `${item.step},${item.visitors},${item.conversionRate}%\\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funnel-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const offerChartData = funnelStats
    ? [
        { name: 'Premium', value: funnelStats.offerPerformance.premium, color: '#f97316' },
        { name: 'Regular', value: funnelStats.offerPerformance.regular, color: '#3b82f6' },
        { name: 'Digital', value: funnelStats.offerPerformance.digital, color: '#8b5cf6' },
      ]
    : [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Зареждане на analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!funnelStats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">Няма данни</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Funnel Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Последните {selectedDays} дни • {funnelStats.stats.totalSessions} сесии
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Date Range Selector */}
            <div className="flex gap-1">
              {[7, 30, 90].map((days) => (
                <Button
                  key={days}
                  variant={selectedDays === days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDays(days)}
                >
                  {days}д
                </Button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex gap-1 border-l pl-2">
              {(['all', 'completed', 'incomplete'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'All' : status === 'completed' ? 'Completed' : 'In Progress'}
                </Button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Общо Сесии
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{funnelStats.stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {funnelStats.stats.completedSessions} завършени
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{funnelStats.stats.overallConversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Завършили funnel-а
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Среден Време
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatTime(funnelStats.stats.avgTimeInFunnel)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Време във funnel-а
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                CTA Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{funnelStats.stats.totalCTAClicks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Общо кликвания на оферти
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Device Stats Card */}
        {funnelStats.deviceStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Device Breakdown
              </CardTitle>
              <CardDescription>Where visitors are browsing from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <Monitor className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{funnelStats.deviceStats.desktop}</p>
                    <p className="text-xs text-muted-foreground">Desktop</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{funnelStats.deviceStats.mobile}</p>
                    <p className="text-xs text-muted-foreground">Mobile</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tablet className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{funnelStats.deviceStats.tablet}</p>
                    <p className="text-xs text-muted-foreground">Tablet</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{funnelStats.deviceStats.unknown}</p>
                    <p className="text-xs text-muted-foreground">Unknown</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions Table */}
        <SessionsTable
          sessions={funnelStats.sessionsList || []}
          onSessionClick={handleSessionClick}
        />

        {/* UTM Breakdown */}
        <UTMBreakdown utmBreakdown={funnelStats.utmBreakdown} />

        {/* Conversion Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel по Стъпки</CardTitle>
            <CardDescription>
              Процент потребители достигащи всяка стъпка
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={funnelStats.conversionFunnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" label={{ value: 'Стъпка', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Потребители', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">Стъпка {payload[0].payload.step}</p>
                          <p className="text-sm">Посетители: {payload[0].payload.visitors}</p>
                          <p className="text-sm">Rate: {payload[0].payload.conversionRate}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="visitors" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Drop-off Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Drop-off по Стъпки</CardTitle>
              <CardDescription>Къде напускат най-много потребители</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelStats.dropOffData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold">Стъпка {payload[0].payload.step}</p>
                            <p className="text-sm">Exits: {payload[0].payload.exits}</p>
                            <p className="text-sm">{payload[0].payload.percentage}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="exits" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Offer Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Offer Performance</CardTitle>
              <CardDescription>Разпределение на tier-овете</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={offerChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {offerChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap Chart */}
        {trendsData && trendsData.heatmapData.length > 0 && (
          <HeatmapChart data={trendsData.heatmapData} />
        )}

        {/* Trend Comparison Chart */}
        {trendsData && trendsData.trendData.length > 0 && (
          <TrendComparisonChart data={trendsData.trendData} />
        )}

        {/* Time Spent Chart */}
        {timeSpentData && timeSpentData.timeSpentData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Среден Time-on-Page</CardTitle>
              <CardDescription>Колко време потребителите прекарват на всяка стъпка</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSpentData.timeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" label={{ value: 'Стъпка', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Секунди', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold">Стъпка {payload[0].payload.step}</p>
                            <p className="text-sm">Среден: {formatTime(payload[0].payload.avgSeconds)}</p>
                            <p className="text-sm">Min: {formatTime(payload[0].payload.minSeconds)}</p>
                            <p className="text-sm">Max: {formatTime(payload[0].payload.maxSeconds)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {payload[0].payload.sampleSize} samples
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="avgSeconds" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {funnelStats.stats.mostCommonExitStep && (
              <p className="text-sm">
                🚪 <strong>Най-често напускане:</strong> Стъпка {funnelStats.stats.mostCommonExitStep}
              </p>
            )}
            {funnelStats.conversionFunnel.length > 1 && (
              <p className="text-sm">
                📉 <strong>Най-голям drop-off:</strong> От Step{' '}
                {funnelStats.conversionFunnel.reduce((prev, curr) =>
                  (prev.conversionRate - (funnelStats.conversionFunnel[funnelStats.conversionFunnel.indexOf(prev) + 1]?.conversionRate || 0)) >
                  (curr.conversionRate - (funnelStats.conversionFunnel[funnelStats.conversionFunnel.indexOf(curr) + 1]?.conversionRate || 0))
                    ? prev
                    : curr
                ).step}
              </p>
            )}
            <p className="text-sm">
              💎 <strong>Най-популярна оферта:</strong>{' '}
              {Object.entries(funnelStats.offerPerformance).reduce((a, b) => (a[1] > b[1] ? a : b))[0]}
            </p>
          </CardContent>
        </Card>

        {/* Session Journey Modal */}
        <SessionJourneyModal
          sessionId={selectedSessionId}
          isOpen={isJourneyModalOpen}
          onClose={() => {
            setIsJourneyModalOpen(false);
            setSelectedSessionId(null);
          }}
        />
      </div>
    </AdminLayout>
  );
}
