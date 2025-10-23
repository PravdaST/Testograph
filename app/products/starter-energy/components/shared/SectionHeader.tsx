import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  tag?: string;
  headline: string;
  description?: string;
  icon?: LucideIcon;
  align?: 'left' | 'center';
}

export default function SectionHeader({
  tag,
  headline,
  description,
  icon: Icon,
  align = 'center'
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  const containerClass = align === 'center' ? 'mx-auto' : '';

  return (
    <div className={`max-w-3xl ${containerClass} ${alignClass} mb-12 md:mb-16`}>
      {tag && (
        <div className="inline-flex items-center gap-2 mb-4 text-sm font-semibold text-primary uppercase tracking-wide">
          {Icon && <Icon className="w-4 h-4" />}
          {tag}
        </div>
      )}

      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-4">
        {headline}
      </h2>

      {description && (
        <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
