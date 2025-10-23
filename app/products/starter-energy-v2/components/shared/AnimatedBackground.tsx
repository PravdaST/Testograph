import React from 'react';

interface AnimatedBackgroundProps {
  variant?: 'waves' | 'circles' | 'mixed';
  opacity?: number;
  colors?: {
    primary: string;
    secondary: string;
    tertiary?: string;
  };
}

export default function AnimatedBackground({
  variant = 'mixed',
  opacity = 0.15,
  colors = {
    primary: 'rgb(14, 165, 233)', // blue
    secondary: 'rgb(34, 197, 94)', // green
    tertiary: 'rgb(168, 85, 247)' // purple
  }
}: AnimatedBackgroundProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drift-1 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(40px) translateY(-30px); }
        }
        @keyframes drift-2 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-30px) translateY(40px); }
        }
        @keyframes drift-3 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(50px) translateY(20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}} />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.5" />
            <stop offset="100%" stopColor={colors.tertiary || colors.primary} stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.tertiary || colors.primary} stopOpacity="0.4" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {(variant === 'waves' || variant === 'mixed') && (
          <>
            <path
              d="M -100 250 Q 300 180, 700 280 T 1500 220"
              stroke="url(#gradient1)"
              strokeWidth="3"
              fill="none"
              style={{ animation: 'drift-1 30s ease-in-out infinite' }}
            />
            <path
              d="M -100 400 Q 400 320, 800 420 T 1600 360"
              stroke="url(#gradient2)"
              strokeWidth="3"
              fill="none"
              style={{ animation: 'drift-2 35s ease-in-out infinite' }}
            />
          </>
        )}

        {(variant === 'circles' || variant === 'mixed') && (
          <>
            <circle
              cx="20%"
              cy="30%"
              r="120"
              fill="url(#gradient1)"
              opacity="0.15"
              style={{ animation: 'float-slow 25s ease-in-out infinite' }}
            />
            <circle
              cx="80%"
              cy="60%"
              r="150"
              fill="url(#gradient2)"
              opacity="0.1"
              style={{ animation: 'float-slow 30s ease-in-out infinite, pulse-glow 20s ease-in-out infinite' }}
            />
            <circle
              cx="50%"
              cy="80%"
              r="100"
              fill="url(#gradient3)"
              opacity="0.12"
              style={{ animation: 'drift-3 40s ease-in-out infinite' }}
            />
          </>
        )}
      </svg>
    </>
  );
}
