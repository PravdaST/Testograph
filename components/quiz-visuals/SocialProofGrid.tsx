import React from 'react';

interface SocialProofGridProps {
  className?: string;
}

export const SocialProofGrid: React.FC<SocialProofGridProps> = ({
  className = '',
}) => {
  return (
    <div className={`w-full max-w-2xl mx-auto text-gray-900 ${className}`}>
      {/* Main statistic */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-4xl sm:text-5xl md:text-6xl font-black text-blue-600">
            67%
          </span>
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          от мъжете 35-55 изпитват подобни проблеми
        </p>
      </div>

      {/* Silhouettes visualization */}
      <div className="bg-[#e6e6e6] rounded-xl p-6 border border-gray-200 mb-6">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex justify-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10"
                viewBox="0 0 24 24"
                fill={index < 7 ? '#9CA3AF' : '#3B82F6'} // Grey for problem, Blue for no-problem
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="6" r="4" />
                <path d="M12 11c-3 0-5 2-5 4v7h10v-7c0-2-2-4-5-4z" />
              </svg>
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-gray-500 mt-4">
          <span className="font-semibold text-gray-600">●</span> Изпитват
          проблеми{' '}
          <span className="ml-3 font-semibold text-blue-600">●</span> Без
          проблеми
        </p>
      </div>

      {/* Secondary statistic - Action takers */}
      <div className="bg-[#e6e6e6] rounded-lg p-4 border border-gray-200">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">
            Но ти вече си в челните
          </p>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 mb-1">
            17%
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            които търсят решение вместо да чакат
          </p>
        </div>
      </div>

      {/* Results statistic */}
      <div className="mt-4 bg-[#e6e6e6] rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-center gap-3">
          <svg
            className="w-8 h-8 text-[#499167]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          <div>
            <p className="text-lg sm:text-xl font-black text-[#499167]">
              89% виждат подобрение
            </p>
            <p className="text-xs text-gray-600">до 21 дни</p>
          </div>
        </div>
      </div>
    </div>
  );
};
