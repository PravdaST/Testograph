/**
 * Testosterone Assessment Scoring System
 *
 * Calculates a risk score (0-100) based on user inputs
 * Higher score = Higher risk / Lower testosterone likelihood
 */

export interface QuizData {
  age: number;
  weight: number;
  height: number;
  trainingFrequency: string;
  trainingType: string[];
  supplements: string;
  averageSleep: number;
  diet: string;
  alcohol: number;
  nicotine: string;
  libido: string;
  morningErection: string;
  morningEnergy: string;
  recovery: string;
  mood: string;
}

export interface ScoringResult {
  totalScore: number; // 0-100
  level: 'good' | 'moderate' | 'critical'; // good: 0-30, moderate: 31-60, critical: 61-100
  riskFactors: string[];
  topIssues: string[];
  recommendedTier: 'premium' | 'regular' | 'digital';
  estimatedTestosterone: {
    value: number; // nmol/L
    level: 'low' | 'normal' | 'high';
    unit: 'nmol/L';
  };
}

/**
 * Calculate testosterone risk score
 */
export function calculateTestosteroneScore(data: QuizData): ScoringResult {
  let score = 0;
  const riskFactors: string[] = [];
  const topIssues: string[] = [];

  // === HEALTH INDICATORS (50 points max) ===

  // Libido (0-25 points)
  if (data.libido === 'very-low') {
    score += 25;
    riskFactors.push('Много ниско либидо');
    topIssues.push('Критично ниско либидо');
  } else if (data.libido === 'low') {
    score += 15;
    riskFactors.push('Ниско либидо');
    topIssues.push('Намалено либидо');
  }

  // Morning Erection (0-20 points)
  if (data.morningErection === 'never') {
    score += 20;
    riskFactors.push('Липса на сутрешна ерекция');
    topIssues.push('Няма сутрешна ерекция');
  } else if (data.morningErection === 'rarely') {
    score += 10;
    riskFactors.push('Рядка сутрешна ерекция');
  }

  // Morning Energy (0-15 points)
  if (data.morningEnergy === 'very-low') {
    score += 15;
    riskFactors.push('Много ниска сутрешна енергия');
    topIssues.push('Хронична умора');
  } else if (data.morningEnergy === 'low') {
    score += 10;
    riskFactors.push('Ниска сутрешна енергия');
  }

  // === LIFESTYLE FACTORS (30 points max) ===

  // Sleep (0-15 points)
  if (data.averageSleep < 5) {
    score += 15;
    riskFactors.push('Критично малко сън (под 5 часа)');
    topIssues.push('Недостатъчен сън');
  } else if (data.averageSleep < 6.5) {
    score += 10;
    riskFactors.push('Недостатъчен сън (под 6.5 часа)');
  }

  // Alcohol (0-10 points)
  if (data.alcohol > 14) {
    score += 10;
    riskFactors.push('Висока консумация на алкохол (14+ питиета/седмица)');
  } else if (data.alcohol > 7) {
    score += 5;
    riskFactors.push('Умерена консумация на алкохол (7+ питиета/седмица)');
  }

  // Nicotine (0-5 points)
  if (data.nicotine !== 'none') {
    score += 5;
    riskFactors.push(`Употреба на ${data.nicotine === 'cigarettes' ? 'цигари' : data.nicotine === 'iqos' ? 'IQOS' : 'вейп'}`);
  }

  // === PHYSICAL INDICATORS (20 points max) ===

  // Mood (0-10 points)
  if (data.mood === 'negative') {
    score += 10;
    riskFactors.push('Негативно настроение');
    topIssues.push('Психологически дистрес');
  } else if (data.mood === 'variable') {
    score += 5;
    riskFactors.push('Променливо настроение');
  }

  // Training frequency (0-10 points)
  if (data.trainingFrequency === 'none') {
    score += 10;
    riskFactors.push('Липса на физическа активност');
  } else if (data.trainingFrequency === '1-2') {
    score += 5;
    riskFactors.push('Ниска физическа активност (1-2 пъти/седмица)');
  }

  // Recovery (0-5 points)
  if (data.recovery === 'very-slow') {
    score += 5;
    riskFactors.push('Много бавно възстановяване');
  } else if (data.recovery === 'slow') {
    score += 3;
    riskFactors.push('Бавно възстановяване');
  }

  // Determine level
  let level: 'good' | 'moderate' | 'critical';
  if (score >= 61) {
    level = 'critical';
  } else if (score >= 31) {
    level = 'moderate';
  } else {
    level = 'good';
  }

  // Determine recommended tier based on score
  let recommendedTier: 'premium' | 'regular' | 'digital';
  if (score >= 61) {
    recommendedTier = 'premium'; // Critical needs full support
  } else if (score >= 31) {
    recommendedTier = 'regular'; // Moderate needs supplement + plan
  } else {
    recommendedTier = 'digital'; // Good just needs maintenance plan
  }

  // Calculate estimated testosterone in nmol/L
  // Inverse relationship: higher risk score = lower testosterone
  // Formula: 28 - (score * 0.2)
  // Score 0 → ~28 nmol/L (high)
  // Score 30 → ~22 nmol/L (normal)
  // Score 60 → ~16 nmol/L (normal)
  // Score 80 → ~12 nmol/L (borderline)
  // Score 100 → ~8 nmol/L (low)
  const cappedScore = Math.min(score, 100);
  const estimatedValue = Math.round((28 - (cappedScore * 0.2)) * 10) / 10; // Round to 1 decimal

  let testosteroneLevel: 'low' | 'normal' | 'high';
  if (estimatedValue < 12) {
    testosteroneLevel = 'low';
  } else if (estimatedValue > 26) {
    testosteroneLevel = 'high';
  } else {
    testosteroneLevel = 'normal';
  }

  return {
    totalScore: Math.min(score, 100), // Cap at 100
    level,
    riskFactors,
    topIssues: topIssues.slice(0, 3), // Top 3 only
    recommendedTier,
    estimatedTestosterone: {
      value: estimatedValue,
      level: testosteroneLevel,
      unit: 'nmol/L'
    }
  };
}

/**
 * Get level description
 */
export function getLevelDescription(level: 'good' | 'moderate' | 'critical'): {
  title: string;
  description: string;
  color: string;
  emoji: string;
} {
  switch (level) {
    case 'critical':
      return {
        title: 'Критично ниво',
        description: 'Твоите симптоми са сериозни и изискват незабавно действие. Нивата на тестостерон вероятно са значително под нормата.',
        color: 'text-red-500',
        emoji: '🔴'
      };
    case 'moderate':
      return {
        title: 'Умерено ниво',
        description: 'Има признаци на намалени нива на тестостерон. Препоръчително е да предприемеш действия сега, преди симптомите да се влошат.',
        color: 'text-yellow-500',
        emoji: '🟡'
      };
    case 'good':
      return {
        title: 'Добро ниво',
        description: 'Нивата ти изглеждат стабилни, но има място за подобрение. Превантивен план ще те поддържа в оптимална форма.',
        color: 'text-green-500',
        emoji: '🟢'
      };
  }
}
