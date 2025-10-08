'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  users: number;
  label: string;
}

interface UsersGrowthChartProps {
  data: DataPoint[];
  isLoading?: boolean;
}

export function UsersGrowthChart({ data, isLoading }: UsersGrowthChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Растеж на Потребители
          </CardTitle>
          <CardDescription>Кумулативни потребители във времето</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Зареждане...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Растеж на Потребители
          </CardTitle>
          <CardDescription>Кумулативни потребители във времето</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Няма данни за показване
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate growth percentage
  const firstValue = data[0]?.users || 0;
  const lastValue = data[data.length - 1]?.users || 0;
  const growthPercentage = firstValue > 0
    ? Math.round(((lastValue - firstValue) / firstValue) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Растеж на Потребители
            </CardTitle>
            <CardDescription>Кумулативни потребители във времето</CardDescription>
          </div>
          {growthPercentage !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              growthPercentage > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${growthPercentage < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(growthPercentage)}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
                name="Потребители"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Общо: {lastValue} потребители</span>
          <span>Период: {data.length} дни</span>
        </div>
      </CardContent>
    </Card>
  );
}
