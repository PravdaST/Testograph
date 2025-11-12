import React from 'react';

interface TestosteroneGraphProps {
  currentLevel?: number; // 0-100, default 40
  className?: string;
}

export const TestosteroneGraph: React.FC<TestosteroneGraphProps> = ({
  currentLevel = 40,
  className = '',
}) => {
  const generateCurvePath = () => {
    const startY = 100 - currentLevel;
    const endY = 10; // 90% = 10% from top

    return `
      M 10 ${startY}
      Q 40 ${startY - 15}, 70 ${startY - 30}
      Q 100 ${startY - 45}, 130 ${endY + 10}
      Q 160 ${endY + 5}, 190 ${endY}
    `;
  };

  const curvePath = generateCurvePath();

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <h3 className="text-sm sm:text-base md:text-lg font-bold text-center mb-4 text-gray-900">
        Очакван Прогрес на Тестостеронова Възстановка
      </h3>

      <div className="bg-[#e6e6e6] rounded-lg p-4 sm:p-6 border border-gray-200">
        <svg
          viewBox="0 0 200 120"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          <line x1="10" y1="25" x2="190" y2="25" stroke="#E5E7EB" strokeWidth="0.5" />
          <line x1="10" y1="50" x2="190" y2="50" stroke="#E5E7EB" strokeWidth="0.5" />
          <line x1="10" y1="75" x2="190" y2="75" stroke="#E5E7EB" strokeWidth="0.5" />

          {/* Y-axis labels */}
          <text x="3" y="12" fontSize="5" fill="#6B7280" textAnchor="end">
            100%
          </text>
          <text x="3" y="52" fontSize="5" fill="#6B7280" textAnchor="end">
            50%
          </text>
          <text x="3" y="102" fontSize="5" fill="#6B7280" textAnchor="end">
            0%
          </text>

          {/* X-axis */}
          <line x1="10" y1="100" x2="190" y2="100" stroke="#9CA3AF" strokeWidth="1" />

          {/* X-axis labels */}
          <text x="10" y="110" fontSize="6" fill="#6B7280" textAnchor="middle">
            0
          </text>
          <text x="70" y="110" fontSize="6" fill="#6B7280" textAnchor="middle">
            30
          </text>
          <text x="130" y="110" fontSize="6" fill="#6B7280" textAnchor="middle">
            60
          </text>
          <text x="190" y="110" fontSize="6" fill="#6B7280" textAnchor="middle">
            90
          </text>

          {/* Days label */}
          <text x="100" y="118" fontSize="5" fill="#6B7280" textAnchor="middle" fontStyle="italic">
            дни
          </text>

          {/* Gradient fill under curve */}
          <defs>
            <linearGradient id="testosteroneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5773d6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#5773d6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Fill area under curve */}
          <path
            d={`${curvePath} L 190 100 L 10 100 Z`}
            fill="url(#testosteroneGradient)"
          />

          {/* Curve line */}
          <path
            d={curvePath}
            stroke="#5773d6"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Current position marker (red dot) */}
          <circle cx="10" cy={100 - currentLevel} r="4" fill="#EF4444">
            <animate
              attributeName="r"
              values="4;5;4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>

          {/* "СЕГА" label */}
          <text x="10" y={100 - currentLevel - 8} fontSize="5" fill="#EF4444" fontWeight="bold" textAnchor="middle">
            СЕГА
          </text>

          {/* Target marker (end point) */}
          <circle cx="190" cy="10" r="3" fill="#10B981" />
          <text x="190" y="5" fontSize="5" fill="#10B981" fontWeight="bold" textAnchor="middle">
            ЦЕЛ
          </text>
        </svg>

        <p className="text-xs text-gray-500 text-center mt-2">
          Индекс на Тестостерон (Относителна Скала)
        </p>
      </div>
    </div>
  );
};
