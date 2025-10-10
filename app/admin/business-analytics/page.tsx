'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  UserMinus,
  ShoppingCart,
  RefreshCw,
  Download,
  Mail,
  Target,
} from 'lucide-react';

interface BusinessAnalytics {
  revenue: {
    total: number;
    periodRevenue: number;
    mrr: number;
    averageOrderValue: number;
    totalPurchases: number;
    periodPurchases: number;
    revenueByProduct: Record<string, number>;
    revenueTrend: Array<{
      month: string;
      revenue: number;
      purchases: number;
    }>;
    refunds: {
      total: number;
      count: number;
    };
  };
  retention: {
    churnRate: number;
    activeUsers: number;
    totalUsers: number;
    inactiveUsers: number;
    cohortAnalysis: Array<{
      month: string;
      totalUsers: number;
      retentionRates: Record<number, number>;
    }>;
  };
  email: {
    totalCampaigns: number;
    totalEmailsSent: number;
    averageOpenRate: number;
    averageClickRate: number;
    note: string;
  };
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function BusinessAnalyticsPage() {
  const [data, setData] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [selectedDays]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/business-analytics?days=${selectedDays}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const analytics = await res.json();
      setData(analytics);
    } catch (error) {
      console.error('Error fetching business analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    const csv = [
      'Business Analytics Report',
      '',
      'Revenue Metrics',
      `Total Revenue,${data.revenue.total} BGN`,
      `MRR,${data.revenue.mrr} BGN`,
      `Average Order Value,${data.revenue.averageOrderValue} BGN`,
      `Total Purchases,${data.revenue.totalPurchases}`,
      `Refunds,${data.revenue.refunds.total} BGN (${data.revenue.refunds.count} refunds)`,
      '',
      'Retention Metrics',
      `Active Users,${data.retention.activeUsers}`,
      `Inactive Users,${data.retention.inactiveUsers}`,
      `Churn Rate,${data.retention.churnRate}%`,
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-12 h-12 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Няма данни</p>
        </div>
      </AdminLayout>
    );
  }

  // Prepare revenue by product chart data
  const revenueByProductData = Object.entries(data.revenue.revenueByProduct).map(
    ([name, value]) => ({ name, value: Math.round(value * 100) / 100 })
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Business Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Revenue, Retention & Growth Metrics
            </p>
          </div>

          <div className="flex gap-2">
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

        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.revenue.total} BGN</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.revenue.periodRevenue} BGN в последните {selectedDays} дни
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                MRR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.revenue.mrr} BGN</div>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly Recurring Revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                AOV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.revenue.averageOrderValue} BGN</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average Order Value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{data.revenue.refunds.total} BGN</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.revenue.refunds.count} refunds
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
            <CardDescription>Monthly revenue and purchase count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.revenue.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" label={{ value: 'Revenue (BGN)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Purchases', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="purchases" stroke="#10b981" strokeWidth={2} name="Purchases" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Product & Retention Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue by Product */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Product</CardTitle>
              <CardDescription>Distribution across product types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByProductData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value} BGN`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueByProductData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Retention Stats */}
          <Card>
            <CardHeader>
              <CardTitle>User Retention Overview</CardTitle>
              <CardDescription>Activity-based retention metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Active Users (30d)</span>
                  </div>
                  <span className="text-2xl font-bold text-green-500">{data.retention.activeUsers}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserMinus className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium">Inactive Users</span>
                  </div>
                  <span className="text-2xl font-bold text-red-500">{data.retention.inactiveUsers}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Users</span>
                  </div>
                  <span className="text-2xl font-bold">{data.retention.totalUsers}</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Churn Rate</span>
                    <span className={`text-3xl font-bold ${
                      data.retention.churnRate > 20 ? 'text-red-500' :
                      data.retention.churnRate > 10 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {data.retention.churnRate}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Users inactive for 30+ days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cohort Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cohort Analysis (Last 6 Months)</CardTitle>
            <CardDescription>Retention rate by signup month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Cohort Month</th>
                    <th className="text-center p-2">Users</th>
                    <th className="text-center p-2">M0</th>
                    <th className="text-center p-2">M1</th>
                    <th className="text-center p-2">M2</th>
                    <th className="text-center p-2">M3</th>
                    <th className="text-center p-2">M4</th>
                    <th className="text-center p-2">M5</th>
                    <th className="text-center p-2">M6</th>
                  </tr>
                </thead>
                <tbody>
                  {data.retention.cohortAnalysis.map((cohort) => (
                    <tr key={cohort.month} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{cohort.month}</td>
                      <td className="text-center p-2">{cohort.totalUsers}</td>
                      {[0, 1, 2, 3, 4, 5, 6].map((month) => {
                        const rate = cohort.retentionRates[month] || 0;
                        return (
                          <td
                            key={month}
                            className="text-center p-2"
                            style={{
                              backgroundColor: `rgba(139, 92, 246, ${rate / 100})`,
                              color: rate > 50 ? 'white' : 'inherit',
                            }}
                          >
                            {rate}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              M0 = signup month, M1 = 1 month later, etc. Darker = higher retention rate.
            </p>
          </CardContent>
        </Card>

        {/* Email Campaign Analytics (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Campaign Analytics
            </CardTitle>
            <CardDescription>Email performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{data.email.note}</p>
              <p className="text-sm text-muted-foreground mt-2">
                To enable email tracking, integrate webhooks from your email provider (SendGrid, Mailgun, etc.)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
