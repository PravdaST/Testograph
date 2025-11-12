import Image from 'next/image';
import React from 'react';

// Define the mapping from age group to image source
const ageGroupImageMap: Record<string, string> = {
  '25-35': '/quiz-visuals/age-25-35.png',
  '36-45': '/quiz-visuals/age-36-45.png',
  '46-55': '/quiz-visuals/age-46-55.png',
  '56+': '/quiz-visuals/age-56-plus.png',
};

interface AgeGroupVisualProps {
  ageGroup: '25-35' | '36-45' | '46-55' | '56+';
  className?: string;
}

// Main component to display the visual for a given age group
export const AgeGroupVisual: React.FC<AgeGroupVisualProps> = ({ ageGroup, className = '' }) => {
  const src = ageGroupImageMap[ageGroup];

  if (!src) {
    return null; // Or a default placeholder
  }

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={`Visual for age group ${ageGroup}`}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
};

// Export a dictionary of components for easier use, similar to the previous structure
export const AgeGroupVisuals = {
  '25-35': (props: { className?: string }) => (
    <AgeGroupVisual ageGroup="25-35" {...props} />
  ),
  '36-45': (props: { className?: string }) => (
    <AgeGroupVisual ageGroup="36-45" {...props} />
  ),
  '46-55': (props: { className?: string }) => (
    <AgeGroupVisual ageGroup="46-55" {...props} />
  ),
  '56+': (props: { className?: string }) => (
    <AgeGroupVisual ageGroup="56+" {...props} />
  ),
};