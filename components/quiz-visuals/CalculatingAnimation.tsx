import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CalculatingAnimationProps {
  className?: string;
}

export const CalculatingAnimation: React.FC<CalculatingAnimationProps> = ({
  className = '',
}) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  const stages = [
    'Анализиране на отговорите...',
    'Изчисляване на индекса...',
    'Генериране на препоръки...',
    'Готово!'
  ];

  useEffect(() => {
    // Progress bar animation (0 to 100 over 3 seconds)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // Increment by 2% every 60ms = 3 seconds total
      });
    }, 60);

    // Stage text animation (change every 750ms)
    const stageInterval = setInterval(() => {
      setStage((prev) => {
        if (prev >= stages.length - 1) {
          clearInterval(stageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 750);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
    };
  }, []);

  return (
    <div className={`w-full max-w-md mx-auto text-gray-900 ${className}`}>
      {/* Spinner Icon */}
      <div className="flex justify-center mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600">{progress}%</p>
          <p className="text-xs text-gray-500">Приблизително време: {Math.max(0, Math.ceil((100 - progress) / 33))}s</p>
        </div>
      </div>

      {/* Stage Text */}
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <p className="text-base font-semibold text-blue-600">
          {stages[stage]}
        </p>
      </motion.div>

      {/* Completion Message */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 p-4 bg-[#f0f7f4] border border-[#d0e8dc] rounded-lg text-center"
        >
          <svg
            className="w-8 h-8 mx-auto mb-2 text-[#499167]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          <p className="text-sm font-semibold text-[#3a7450]">
            Вашият анализ е готов!
          </p>
        </motion.div>
      )}
    </div>
  );
};
