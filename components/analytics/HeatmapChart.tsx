'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface HeatmapDataPoint {
  step: number;
  intensity: number;
  enters: number;
  exits: number;
  clicks: number;
  total: number;
}

interface HeatmapChartProps {
  data: HeatmapDataPoint[];
}

const getColorForIntensity = (intensity: number): string => {
  if (intensity >= 80) return 'bg-red-600';
  if (intensity >= 60) return 'bg-orange-500';
  if (intensity >= 40) return 'bg-yellow-500';
  if (intensity >= 20) return 'bg-green-500';
  return 'bg-blue-400';
};

const getColorForIntensityBorder = (intensity: number): string => {
  if (intensity >= 80) return 'border-red-700';
  if (intensity >= 60) return 'border-orange-600';
  if (intensity >= 40) return 'border-yellow-600';
  if (intensity >= 20) return 'border-green-600';
  return 'border-blue-500';
};

const getIntensityLabel = (intensity: number): string => {
  if (intensity >= 80) return 'Very High';
  if (intensity >= 60) return 'High';
  if (intensity >= 40) return 'Medium';
  if (intensity >= 20) return 'Low';
  return 'Very Low';
};

export function HeatmapChart({ data }: HeatmapChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funnel Activity Heatmap</CardTitle>
          <CardDescription>No activity data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Funnel Activity Heatmap
        </CardTitle>
        <CardDescription>
          Визуализация на активността по стъпки (колкото по-червено, толкова повече активност)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
          <span className="text-muted-foreground font-medium">Intensity:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-400 border border-blue-500" />
            <span>Very Low (0-20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 border border-green-600" />
            <span>Low (20-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500 border border-yellow-600" />
            <span>Medium (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500 border border-orange-600" />
            <span>High (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600 border border-red-700" />
            <span>Very High (80-100%)</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.map((point) => (
            <div
              key={point.step}
              className={`
                relative p-6 rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer
                ${getColorForIntensity(point.intensity)}
                ${getColorForIntensityBorder(point.intensity)}
              `}
            >
              {/* Step Number */}
              <div className="text-white font-bold text-3xl mb-2">
                Step {point.step}
              </div>

              {/* Intensity Badge */}
              <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded mb-3 inline-block">
                {getIntensityLabel(point.intensity)} ({point.intensity}%)
              </div>

              {/* Stats */}
              <div className="space-y-1 text-white text-sm">
                <div className="flex justify-between">
                  <span className="opacity-90">Total Events:</span>
                  <span className="font-semibold">{point.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Enters:</span>
                  <span className="font-semibold">{point.enters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Clicks:</span>
                  <span className="font-semibold">{point.clicks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Exits:</span>
                  <span className="font-semibold">{point.exits}</span>
                </div>
              </div>

              {/* Activity Bar */}
              <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-500"
                  style={{ width: `${(point.total / maxTotal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> The heatmap shows relative activity intensity across all funnel steps.
            Brighter colors indicate higher user engagement and interaction.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
