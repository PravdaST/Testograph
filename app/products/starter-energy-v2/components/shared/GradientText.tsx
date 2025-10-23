import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  from?: string;
  via?: string;
  to?: string;
  className?: string;
}

export default function GradientText({
  children,
  from = 'from-blue-500',
  via = 'via-green-500',
  to = 'to-purple-600',
  className = ''
}: GradientTextProps) {
  return (
    <span
      className={`text-transparent bg-clip-text bg-gradient-to-r ${from} ${via} ${to} ${className}`}
    >
      {children}
    </span>
  );
}
