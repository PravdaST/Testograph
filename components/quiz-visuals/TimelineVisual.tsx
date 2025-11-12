import React from 'react';

interface TimelineVisualProps {
  className?: string;
}

export const TimelineVisual: React.FC<TimelineVisualProps> = ({
  className = '',
}) => {
  const stages = [
    {
      weeks: 'Week 1-2',
      title: 'Първи Резултати',
      description: 'Повече енергия, по-добър сън',
      arrowCount: 1,
      color: '#93C5FD', // Light Blue
    },
    {
      weeks: 'Week 3-4',
      title: 'Забележима Промяна',
      description: 'Видимо подобрение в либидото',
      arrowCount: 2,
      color: '#3B82F6', // Blue
    },
    {
      weeks: 'Week 6-8',
      title: 'Пълна Трансформация',
      description: 'Увереност и стабилни резултати',
      arrowCount: 3,
      color: '#1D4ED8', // Dark Blue
    },
  ];

  return (
    <div className={`w-full max-w-3xl mx-auto text-gray-900 ${className}`}>
      <h3 className="text-lg sm:text-xl font-bold text-center mb-6">
        Твоят Път към Възстановяване
      </h3>

      <div className="relative">
        {/* Connecting Line for desktop */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 hidden sm:block w-full"></div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stages.map((stage, index) => (
            <div key={index} className="relative text-center sm:text-left">
              {/* Progress Dot for desktop */}
              <div className="hidden sm:block absolute top-3.5 left-1/2 transform -translate-x-1/2">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" style={{ backgroundColor: stage.color }}></div>
              </div>

              {/* Stage Card */}
              <div className="bg-[#e6e6e6] rounded-xl p-6 border border-gray-200 h-full">
                <div className="mb-3">
                  <p className="text-xs font-semibold" style={{ color: stage.color }}>{stage.weeks}</p>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mt-1">{stage.title}</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {stage.description}
                </p>
              </div>

              {/* Mobile connector arrow */}
              {index < stages.length - 1 && (
                <div className="sm:hidden flex justify-center my-4">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 13.17L16.59 8.59 18 10l-6 6-6-6 1.41-1.41L12 13.17z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm sm:text-base text-gray-600 italic">
          По-лесно отколкото мислиш. По-бързо отколкото очакваш.
        </p>
      </div>
    </div>
  );
};
