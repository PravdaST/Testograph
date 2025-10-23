'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendDataPoint {
  date: string;
  sessions: number;
  completed: number;
  dropped: number;
  conversionRate: number;
}

interface TrendComparisonChartProps {
  data: TrendDataPoint[];
}

export function TrendComparisonChart({ data }: TrendComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Trends Over Time</CardTitle>
          <CardDescription>No trend data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Format dates for display
  const formattedData = data.map((point) => ({
    ...point,
    displayDate: new Date(point.date).toLocaleDateString('bg-BG', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  // Calculate summary stats
  const avgConversionRate =
    data.reduce((sum, d) => sum + d.conversionRate, 0) / data.length;
  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);

  // Calculate trend direction
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstHalfAvg =
    firstHalf.reduce((sum, d) => sum + d.conversionRate, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, d) => sum + d.conversionRate, 0) / secondHalf.length;

  const trend = secondHalfAvg > firstHalfAvg ? 'up' : 'down';
  const trendPercentage = Math.abs(
    ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
  ).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Conversion Trends Over Time
        </CardTitle>
        <CardDescription>
          Daily session activity and conversion rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
            <p className="text-2xl font-bold">{totalSessions}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Avg Conversion</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</p>
              <span
                className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend === 'up' ? '↑' : '↓'} {trendPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{
                value: 'Sessions',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{
                value: 'Conversion Rate (%)',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: any, name: string) => {
                if (name === 'Conversion Rate') return `${value}%`;
                return value;
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sessions"
              stroke="#5c415d"
              strokeWidth={2}
              name="Total Sessions"
              dot={{ fill: '#5c415d', r: 4 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="completed"
              stroke="#499167"
              strokeWidth={2}
              name="Completed"
              dot={{ fill: '#499167', r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversionRate"
              stroke="#5dbd83"
              strokeWidth={3}
              name="Conversion Rate"
              dot={{ fill: '#5dbd83', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Insight */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Trend Analysis:</strong> Conversion rate is trending{' '}
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
              {trend}
            </span>{' '}
            by {trendPercentage}% compared to the first half of the period.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
