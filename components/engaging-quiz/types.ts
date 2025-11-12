export type QuestionType = 'slider' | 'buttons' | 'text' | 'email';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  subtitle?: string;
  options?: {
    value: string;
    label: string;
    icon?: string;
  }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  required?: boolean;
  visualComponent?: 'AgeGroupIcons' | 'TestosteroneGraph' | 'HabitsIndicator' | 'SocialProofGrid' | 'TimelineVisual' | 'TrustFactorGrid' | 'CalculatingAnimation';
}

export interface InfoSlide {
  id: string;
  type: 'info';
  icon: string;
  title: string;
  content: string[];
  cta?: string;
  visualComponent?: 'AgeGroupIcons' | 'TestosteroneGraph' | 'HabitsIndicator' | 'SocialProofGrid' | 'TimelineVisual' | 'TrustFactorGrid' | 'CalculatingAnimation';
}

export type QuizItem = Question | InfoSlide;

export interface QuizData {
  [key: string]: string | number;
}
