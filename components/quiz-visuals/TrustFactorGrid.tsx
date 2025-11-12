import React from 'react';
import { Beaker, Globe, Leaf } from 'lucide-react';

interface TrustFactorGridProps {
  className?: string;
}

export const TrustFactorGrid: React.FC<TrustFactorGridProps> = ({
  className = '',
}) => {
  const users = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    initials: String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  }));

  const trustBadges = [
    { icon: Beaker, label: 'Клинично Тествано' },
    { icon: Globe, label: 'Направено в ЕС' },
    { icon: Leaf, label: '100% Натурално' },
  ];

  return (
    <div className={`w-full max-w-2xl mx-auto text-gray-900 ${className}`}>
      <h3 className="text-base sm:text-lg font-bold text-center mb-6">
        Присъедини се към хиляди български мъже
      </h3>

      {/* User Grid - Placeholder Avatars */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 justify-items-center">
        {users.map((user) => (
          <div key={user.id} className="relative group">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center border-2 border-gray-200 bg-[#e6e6e6] shadow-lg transition-transform group-hover:scale-110"
            >
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                {user.initials}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 bg-[#499167] rounded-full p-1 shadow-md">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Rating */}
      <div className="flex items-center justify-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 sm:w-6 sm:h-6 ${i < 5 ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        <span className="ml-2 text-base sm:text-lg font-bold text-gray-900">
          4.8/5.0
        </span>
      </div>

      {/* Count */}
      <p className="text-center text-sm sm:text-base text-gray-600 mb-6">
        Над <span className="font-bold text-blue-600">1,200</span> български мъже
        <br />
        вече възстановиха увереността си
      </p>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {trustBadges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className="bg-[#e6e6e6] rounded-lg p-3 sm:p-4 text-center border border-gray-200 hover:border-gray-300 transition-all"
            >
              <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" strokeWidth={1.5} />
              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                {badge.label}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center text-gray-500 italic mt-4">
        *Реални клиенти, реални резултати
      </p>
    </div>
  );
};
