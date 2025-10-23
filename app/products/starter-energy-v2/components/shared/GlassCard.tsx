import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
}

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  glowColor = 'from-blue-500/20'
}: GlassCardProps) {
  return (
    <div
      className={`
        relative bg-card/50 backdrop-blur-sm
        border-2 border-border/50 rounded-2xl
        ${hover ? 'hover:border-primary/50 hover:bg-card/80 hover:scale-[1.03] transition-all duration-300' : ''}
        ${className}
      `}
    >
      {glow && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10`}
        />
      )}
      {children}
    </div>
  );
}
