import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  className?: string;
}

export default function Container({
  children,
  maxWidth = 'xl',
  className = ''
}: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    '3xl': 'max-w-[1600px]',
    '4xl': 'max-w-[1800px]',
    full: 'max-w-full'
  };

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 md:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
