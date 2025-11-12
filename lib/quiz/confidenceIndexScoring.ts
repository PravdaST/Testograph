/**
 * Enhanced Confidence Index Scoring System
 * Calculates comprehensive 0-100 score with category breakdowns, timeline predictions, and percentile ranking
 * Higher score = Better testosterone health indicators
 */

export interface QuizAnswers {
  // Demographics
  age?: string;
  profession?: string;
  'work-stress'?: string;
  'ed-problem'?: string;

  // Body composition
  height?: string;
  weight?: string;
  'body-fat'?: string;

  // Lifestyle
  diet?: string;
  nicotine?: string;
  alcohol?: string;
  sleep?: string;

  // Intimate questions
  'sex-frequency'?: string;
  frustration?: string;
  'one-change'?: string;

  // Solution fit
  'past-attempts'?: string;
  'decision-criteria'?: string;
  vision?: string;

  // Contact
  firstName?: string;
  email?: string;
}

export interface CategoryScores {
  lifestyle: number; // 0-100
  physical: number; // 0-100
  sexual: number; // 0-100
  mental: number; // 0-100
}

export interface TimelinePrediction {
  day14: number; // Expected score at 14 days
  day30: number; // Expected score at 30 days
  day60: number; // Expected score at 60 days
  day90: number; // Expected score at 90 days
}

export interface ConfidenceIndexResult {
  score: number; // 0-100 (higher = better)
  level: 'критично' | 'ниско' | 'средно' | 'добро' | 'отлично';
  testosteroneEstimate: 'много нисък' | 'нисък' | 'среден' | 'добър' | 'отличен';
  recommendations: string[];
  urgencyLevel: 'висока' | 'средна' | 'ниска';
  categoryScores: CategoryScores;
  percentile: number; // 0-100 (compared to age group)
  timeline: TimelinePrediction;
  topIssues: string[]; // Top 3 priority issues
}

export const calculateConfidenceIndex = (
  answers: QuizAnswers
): ConfidenceIndexResult => {
  let score = 50; // Base score

  // Category scores (tracked separately)
  let lifestyleScore = 50;
  let physicalScore = 50;
  let sexualScore = 50;
  let mentalScore = 50;

  // Issues tracking for prioritization
  const issues: Array<{ issue: string; severity: number }> = [];

  // ==========================================
  // AGE FACTOR (-10 to +5) - affects physical
  // ==========================================
  const age = answers.age;
  if (age === '25-35') {
    score += 5;
    physicalScore += 10;
  } else if (age === '36-45') {
    score += 0;
    physicalScore += 0;
  } else if (age === '46-55') {
    score -= 5;
    physicalScore -= 10;
  } else if (age === '56+') {
    score -= 10;
    physicalScore -= 15;
  }

  // ==========================================
  // WORK STRESS (-5 to +5) - affects mental
  // ==========================================
  const workStress = answers['work-stress'];
  if (workStress === 'calm') {
    score += 5;
    mentalScore += 10;
  } else if (workStress === 'sometimes') {
    score += 0;
    mentalScore += 0;
  } else if (workStress === 'exhausting') {
    score -= 5;
    mentalScore -= 15;
    issues.push({ issue: 'Висок работен стрес', severity: 15 });
  }

  // ==========================================
  // BODY COMPOSITION (-10 to +10) - affects physical
  // ==========================================
  const bodyFat = answers['body-fat'];
  if (bodyFat === 'low') {
    score += 10;
    physicalScore += 15;
  } else if (bodyFat === 'medium') {
    score += 0;
    physicalScore += 0;
  } else if (bodyFat === 'high') {
    score -= 10;
    physicalScore -= 20;
    issues.push({ issue: 'Високи подкожни мазнини', severity: 20 });
  }

  // ==========================================
  // DIET (-10 to +10) - affects lifestyle
  // ==========================================
  const diet = answers.diet;
  if (diet === 'balanced') {
    score += 10;
    lifestyleScore += 15;
  } else if (diet === 'trying') {
    score += 5;
    lifestyleScore += 7;
  } else if (diet === 'processed') {
    score -= 5;
    lifestyleScore -= 10;
    issues.push({ issue: 'Лошо хранене', severity: 10 });
  } else if (diet === 'none') {
    score -= 10;
    lifestyleScore -= 15;
    issues.push({ issue: 'Липса на хранителен режим', severity: 15 });
  }

  // ==========================================
  // NICOTINE (-15 to +10) - affects lifestyle
  // ==========================================
  const nicotine = answers.nicotine;
  if (nicotine === 'never') {
    score += 10;
    lifestyleScore += 12;
  } else if (nicotine === 'quit') {
    score += 5;
    lifestyleScore += 6;
  } else if (nicotine === 'sometimes') {
    score -= 5;
    lifestyleScore -= 10;
    issues.push({ issue: 'Употреба на никотин', severity: 10 });
  } else if (nicotine === 'daily') {
    score -= 15;
    lifestyleScore -= 20;
    issues.push({ issue: 'Ежедневно пушене', severity: 20 });
  }

  // ==========================================
  // ALCOHOL (-15 to +10) - affects lifestyle
  // ==========================================
  const alcohol = answers.alcohol;
  if (alcohol === 'never') {
    score += 10;
    lifestyleScore += 12;
  } else if (alcohol === 'rarely') {
    score += 5;
    lifestyleScore += 6;
  } else if (alcohol === 'weekly') {
    score -= 5;
    lifestyleScore -= 10;
    issues.push({ issue: 'Редовна употреба на алкохол', severity: 10 });
  } else if (alcohol === 'daily') {
    score -= 15;
    lifestyleScore -= 20;
    issues.push({ issue: 'Ежедневна употреба на алкохол', severity: 20 });
  }

  // ==========================================
  // SLEEP (-15 to +10) - affects lifestyle + mental
  // ==========================================
  const sleep = answers.sleep;
  if (sleep === '7-8') {
    score += 10;
    lifestyleScore += 12;
    mentalScore += 10;
  } else if (sleep === '6-7') {
    score += 0;
    lifestyleScore += 0;
    mentalScore += 0;
  } else if (sleep === '<6') {
    score -= 10;
    lifestyleScore -= 12;
    mentalScore -= 10;
    issues.push({ issue: 'Недостатъчен сън', severity: 12 });
  } else if (sleep === 'poor') {
    score -= 15;
    lifestyleScore -= 18;
    mentalScore -= 15;
    issues.push({ issue: 'Лошо качество на съня', severity: 18 });
  }

  // ==========================================
  // SEX FREQUENCY (-20 to +5) - affects sexual
  // ==========================================
  const sexFrequency = answers['sex-frequency'];
  if (sexFrequency === 'weekly+') {
    score += 5;
    sexualScore += 15;
  } else if (sexFrequency === 'weekly') {
    score += 0;
    sexualScore += 5;
  } else if (sexFrequency === 'monthly') {
    score -= 10;
    sexualScore -= 15;
    issues.push({ issue: 'Ниска честота на секс', severity: 15 });
  } else if (sexFrequency === 'rare') {
    score -= 20;
    sexualScore -= 25;
    issues.push({ issue: 'Много ниска сексуална активност', severity: 25 });
  }

  // ==========================================
  // FRUSTRATION LEVEL (-15 to 0) - affects sexual + mental
  // ==========================================
  const frustration = answers.frustration;
  if (frustration === 'lost-spark') {
    score -= 10;
    sexualScore -= 12;
    mentalScore -= 8;
    issues.push({ issue: 'Загубена "искра" и желание', severity: 12 });
  } else if (frustration === 'performance') {
    score -= 15;
    sexualScore -= 20;
    mentalScore -= 10;
    issues.push({ issue: 'Притеснения за представянето', severity: 20 });
  } else if (frustration === 'distance') {
    score -= 12;
    sexualScore -= 15;
    mentalScore -= 9;
    issues.push({ issue: 'Дистанция с партньорката', severity: 15 });
  } else if (frustration === 'exhausted') {
    score -= 8;
    sexualScore -= 10;
    mentalScore -= 12;
    issues.push({ issue: 'Хронична умора', severity: 12 });
  }

  // ==========================================
  // ONE CHANGE (Indicates severity: -10 to 0) - affects sexual
  // ==========================================
  const oneChange = answers['one-change'];
  if (oneChange === 'initiate') {
    score -= 10;
    sexualScore -= 12;
  } else if (oneChange === 'feel-man') {
    score -= 8;
    sexualScore -= 10;
    mentalScore -= 8;
  } else if (oneChange === 'desire') {
    score -= 12;
    sexualScore -= 15;
  } else if (oneChange === 'energy') {
    score -= 6;
    physicalScore -= 8;
    mentalScore -= 6;
  }

  // ==========================================
  // CLAMP SCORES (0-100)
  // ==========================================
  score = Math.max(0, Math.min(100, Math.round(score)));
  lifestyleScore = Math.max(0, Math.min(100, Math.round(lifestyleScore)));
  physicalScore = Math.max(0, Math.min(100, Math.round(physicalScore)));
  sexualScore = Math.max(0, Math.min(100, Math.round(sexualScore)));
  mentalScore = Math.max(0, Math.min(100, Math.round(mentalScore)));

  // ==========================================
  // DETERMINE LEVEL
  // ==========================================
  let level: ConfidenceIndexResult['level'];
  let testosteroneEstimate: ConfidenceIndexResult['testosteroneEstimate'];
  let urgencyLevel: ConfidenceIndexResult['urgencyLevel'];

  if (score >= 80) {
    level = 'отлично';
    testosteroneEstimate = 'отличен';
    urgencyLevel = 'ниска';
  } else if (score >= 60) {
    level = 'добро';
    testosteroneEstimate = 'добър';
    urgencyLevel = 'ниска';
  } else if (score >= 40) {
    level = 'средно';
    testosteroneEstimate = 'среден';
    urgencyLevel = 'средна';
  } else if (score >= 20) {
    level = 'ниско';
    testosteroneEstimate = 'нисък';
    urgencyLevel = 'висока';
  } else {
    level = 'критично';
    testosteroneEstimate = 'много нисък';
    urgencyLevel = 'висока';
  }

  // ==========================================
  // CALCULATE PERCENTILE (age-adjusted)
  // ==========================================
  let percentile = 50; // Base percentile

  // Adjust based on score
  if (score >= 80) percentile = 85 + (score - 80) * 0.75; // 85-100th percentile
  else if (score >= 60) percentile = 65 + (score - 60) * 1.0; // 65-85th percentile
  else if (score >= 40) percentile = 35 + (score - 40) * 1.5; // 35-65th percentile
  else if (score >= 20) percentile = 15 + (score - 20) * 1.0; // 15-35th percentile
  else percentile = score * 0.75; // 0-15th percentile

  // Age adjustment (younger = higher percentile at same score)
  if (age === '25-35') percentile += 5;
  else if (age === '56+') percentile -= 5;

  percentile = Math.max(1, Math.min(99, Math.round(percentile)));

  // ==========================================
  // CALCULATE TIMELINE PREDICTIONS
  // ==========================================
  const improvementRate = urgencyLevel === 'висока' ? 1.5 : urgencyLevel === 'средна' ? 1.2 : 1.0;

  const timeline: TimelinePrediction = {
    day14: Math.min(100, Math.round(score + (10 * improvementRate))),
    day30: Math.min(100, Math.round(score + (18 * improvementRate))),
    day60: Math.min(100, Math.round(score + (30 * improvementRate))),
    day90: Math.min(100, Math.round(score + (40 * improvementRate))),
  };

  // ==========================================
  // IDENTIFY TOP 3 ISSUES
  // ==========================================
  const topIssues = issues
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3)
    .map((i) => i.issue);

  // ==========================================
  // GENERATE RECOMMENDATIONS
  // ==========================================
  const recommendations: string[] = [];

  // Lifestyle recommendations
  if (answers.diet === 'processed' || answers.diet === 'none') {
    recommendations.push('Подобри хранителния режим с повече протеини и здравословни мазнини');
  }
  if (answers.nicotine === 'daily' || answers.nicotine === 'sometimes') {
    recommendations.push('Намали или премахни никотина - пряко потиска тестостерона');
  }
  if (answers.alcohol === 'daily' || answers.alcohol === 'weekly') {
    recommendations.push('Ограничи алкохола до максимум 1-2 пъти седмично');
  }
  if (answers.sleep === '<6' || answers.sleep === 'poor') {
    recommendations.push('Приоритизирай качествения сън - 7-8 часа са критични за тестостерона');
  }

  // Body composition
  if (answers['body-fat'] === 'high') {
    recommendations.push('Намали подкожните мазнини с калориен дефицит и силови тренировки');
  }

  // Intimate health
  if (answers['sex-frequency'] === 'rare' || answers['sex-frequency'] === 'monthly') {
    recommendations.push('Работи върху хормоналния баланс за подобряване на либидото');
  }

  // Stress management
  if (answers['work-stress'] === 'exhausting') {
    recommendations.push('Намали стреса с медитация, дишащи упражнения и достатъчно почивка');
  }

  // If high score, still give maintenance advice
  if (score >= 70) {
    recommendations.push('Запази добрите навици и продължи с редовни тренировки');
    recommendations.push('Периодично проверявай тестостероновите нива с кръвни изследвания');
  }

  // Default recommendation
  if (recommendations.length === 0) {
    recommendations.push('Консултирай се със специалист за персонализиран план');
  }

  return {
    score,
    level,
    testosteroneEstimate,
    recommendations,
    urgencyLevel,
    categoryScores: {
      lifestyle: lifestyleScore,
      physical: physicalScore,
      sexual: sexualScore,
      mental: mentalScore,
    },
    percentile,
    timeline,
    topIssues,
  };
};
