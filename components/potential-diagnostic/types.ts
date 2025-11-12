export interface Answer {
  text: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface Question {
  id: number;
  phase: number;
  title: string;
  subtitle?: string;
  type: 'multiple-choice' | 'text' | 'email';
  answers?: Answer[];
  placeholder?: string;
}

export interface Phase {
  id: number;
  name: string;
  feedbackTitle?: string;
  feedbackSubtitle?: string;
}
