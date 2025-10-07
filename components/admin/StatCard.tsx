import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  description?: string;
  valueColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  valueColor,
}: StatCardProps) {
  const isPositiveTrend = trend && trend.value >= 0;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Icon className="h-4 w-4" />
              <span className="font-medium">{title}</span>
            </div>
            <div className={cn('text-3xl font-bold tracking-tight', valueColor)}>
              {value}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md',
                isPositiveTrend
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              )}
            >
              {isPositiveTrend ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {trend?.label && (
          <p className="text-xs text-muted-foreground mt-2">{trend.label}</p>
        )}
      </CardContent>
    </Card>
  );
}
