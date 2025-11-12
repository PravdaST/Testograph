import React from 'react';

type HabitsLevel = 'unhealthy' | 'average' | 'healthy';

interface HabitsIndicatorProps {
  level: HabitsLevel;
  className?: string;
}

export const HabitsIndicator: React.FC<HabitsIndicatorProps> = ({
  level,
  className = '',
}) => {
  const renderIndicator = () => {
    switch (level) {
      case 'unhealthy':
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#EF4444"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40 * 0.78} ${2 * Math.PI * 40}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-black text-red-600">
                  78%
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xs">
              от българските мъже са в същата ситуация
            </p>
          </div>
        );

      case 'average':
        return (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="w-full max-w-md">
              <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-1000 ease-out"
                  style={{ width: '60%' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      60%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-gray-600 mt-2">
                Оптимално ниво
              </p>
            </div>
          </div>
        );

      case 'healthy':
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="absolute -inset-2 bg-[#499167]/20 rounded-full blur-xl"></div>
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-[#f0f7f4] rounded-full flex items-center justify-center border-2 border-[#d0e8dc]">
                <svg
                  className="w-20 h-20 sm:w-24 sm:h-24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#499167"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-[#499167]">
                85/100
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Отличен резултат
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      {renderIndicator()}
    </div>
  );
};
