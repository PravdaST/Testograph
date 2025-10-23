import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingBadgeProps {
  icon?: LucideIcon;
  emoji?: string;
  value: string;
  label: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  color?: 'blue' | 'green' | 'purple' | 'amber';
}

const positionStyles = {
  'top-right': '-top-3 -right-3',
  'top-left': '-top-3 -left-3',
  'bottom-right': '-bottom-3 -right-3',
  'bottom-left': '-bottom-3 -left-3'
};

const colorStyles = {
  blue: 'border-blue-500/30 from-blue-500/20',
  green: 'border-green-500/30 from-green-500/20',
  purple: 'border-purple-500/30 from-purple-500/20',
  amber: 'border-amber-500/30 from-amber-500/20'
};

export default function FloatingBadge({
  icon: Icon,
  emoji,
  value,
  label,
  position = 'top-right',
  color = 'blue'
}: FloatingBadgeProps) {
  return (
    <div
      className={`
        absolute ${positionStyles[position]}
        bg-card/95 backdrop-blur-xl rounded-xl p-3
        shadow-2xl border-2 ${colorStyles[color]}
        hover:scale-110 transition-all duration-300 group
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorStyles[color].split(' ')[1]} opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10`} />

      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        {emoji && <span className="text-xl">{emoji}</span>}
        <div>
          <div className="text-lg font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">{label}</div>
        </div>
      </div>
    </div>
  );
}
