import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardContent className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-8 w-20 bg-muted rounded"></div>
          <div className="h-3 w-32 bg-muted rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        <div className="h-4 w-32 bg-muted rounded"></div>
        <div className="h-4 w-40 bg-muted rounded"></div>
        <div className="h-4 w-24 bg-muted rounded ml-auto"></div>
        <div className="h-4 w-20 bg-muted rounded"></div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b">
          <div className="h-4 w-32 bg-muted rounded"></div>
          <div className="h-4 w-40 bg-muted rounded"></div>
          <div className="h-4 w-24 bg-muted rounded ml-auto"></div>
          <div className="h-4 w-20 bg-muted rounded"></div>
        </div>
      ))}
    </div>
  );
}
