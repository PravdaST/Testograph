import { QuizItem } from './types';

export const quizItems: QuizItem[] = [
  // BLOCK 1: Demographics (3 questions)
  {
    id: 'age',
    type: 'slider',
    question: 'Колко години си?',
    subtitle: 'Възрастта е ключов фактор за нивата на тестостерон',
    min: 18,
    max: 80,
    step: 1,
    unit: 'години',
    required: true
  },
  {
    id: 'height',
    type: 'slider',
    question: 'Колко си висок?',
    subtitle: 'В сантиметри',
    min: 150,
    max: 220,
    step: 1,
    unit: 'см',
    required: true
  },
  {
    id: 'weight',
    type: 'slider',
    question: 'Колко тежиш?',
    subtitle: 'Текущото ти тегло',
    min: 50,
    max: 150,
    step: 1,
    unit: 'кг',
    required: true
  },

  // INFO SLIDE 1
  {
    id: 'info-1',
    type: 'info',
    icon: '💡',
    title: 'Знаеше ли че?',
    content: [
      'След 30 години тестостеронът пада с 1-2% ГОДИШНО',
      'На 50 можеш да имаш 30% по-нисък тестостерон!',
      'Добрата новина? Можеш да го повишиш естествено.'
    ],
    cta: 'Продължи →'
  },

  // BLOCK 2: Lifestyle (5 questions)
  {
    id: 'sleep',
    type: 'slider',
    question: 'Колко часа спиш средно на ден?',
    subtitle: 'Съня е критичен за производството на тестостерон',
    min: 4,
    max: 12,
    step: 0.5,
    unit: 'часа',
    required: true
  },
  {
    id: 'alcohol',
    type: 'buttons',
    question: 'Колко често пиеш алкохол?',
    subtitle: 'Алкохолът намалява тестостерона значително',
    options: [
      { value: 'never', label: 'Никога', icon: '🚫' },
      { value: 'rarely', label: 'Рядко (1-2/месец)', icon: '🍺' },
      { value: 'weekly', label: 'Седмично (1-3/седмица)', icon: '🍻' },
      { value: 'often', label: 'Често (4+/седмица)', icon: '🍷' }
    ],
    required: true
  },
  {
    id: 'nicotine',
    type: 'buttons',
    question: 'Пушиш ли или използваш никотин?',
    subtitle: 'Никотинът влияе негативно на хормоналния баланс',
    options: [
      { value: 'none', label: 'Не', icon: '✅' },
      { value: 'cigarettes', label: 'Цигари', icon: '🚬' },
      { value: 'iqos', label: 'IQOS', icon: '💨' },
      { value: 'vape', label: 'Вейп', icon: '🌫️' }
    ],
    required: true
  },
  {
    id: 'diet',
    type: 'buttons',
    question: 'Как би описал храненето си?',
    subtitle: 'Диетата е основа за хормоналното здраве',
    options: [
      { value: 'balanced', label: 'Балансирано', icon: '🥗' },
      { value: 'high-protein', label: 'Високопротеиново', icon: '🥩' },
      { value: 'junk', label: 'Junk Food', icon: '🍔' },
      { value: 'vegan', label: 'Веган/Вегетарианско', icon: '🌱' },
      { value: 'keto', label: 'Кето/Low Carb', icon: '🥑' }
    ],
    required: true
  },
  {
    id: 'stress',
    type: 'slider',
    question: 'Колко е нивото ти на стрес?',
    subtitle: 'От 1 (спокоен) до 10 (много стресиран)',
    min: 1,
    max: 10,
    step: 1,
    required: true
  },

  // INFO SLIDE 2
  {
    id: 'info-2',
    type: 'info',
    icon: '🎁',
    title: 'БЕЗПЛАТЕН АНАЛИЗ',
    content: [
      'Стойност: 49 лв (100% БЕЗПЛАТНО за теб)',
      '',
      'Ще получиш:',
      '✓ Детайлен PDF доклад',
      '✓ Изчисление в nmol/L',
      '✓ Персонализирани препоръки',
      '✓ План за действие'
    ],
    cta: 'Продължи →'
  },

  // BLOCK 3: Training (4 questions)
  {
    id: 'training-frequency',
    type: 'buttons',
    question: 'Колко пъти тренираш седмично?',
    subtitle: 'Силовите тренировки са ключови за тестостерона',
    options: [
      { value: 'none', label: 'Не тренирам', icon: '😴' },
      { value: '1-2', label: '1-2 пъти', icon: '🏃' },
      { value: '3-4', label: '3-4 пъти', icon: '💪' },
      { value: '5-6', label: '5-6 пъти', icon: '🏋️' },
      { value: '6+', label: '6+ пъти', icon: '🔥' }
    ],
    required: true
  },
  {
    id: 'training-type',
    type: 'buttons',
    question: 'Какъв тип тренировки правиш?',
    subtitle: 'Можеш да избереш повече от един вариант',
    options: [
      { value: 'none', label: 'Не тренирам', icon: '⏸️' },
      { value: 'strength', label: 'Силови', icon: '🏋️‍♂️' },
      { value: 'cardio', label: 'Кардио', icon: '🏃‍♂️' },
      { value: 'hiit', label: 'HIIT', icon: '⚡' },
      { value: 'sports', label: 'Спорт', icon: '⚽' }
    ],
    required: true
  },
  {
    id: 'recovery',
    type: 'buttons',
    question: 'Как се възстановяваш след тренировка?',
    subtitle: 'Доброто възстановяване показва добър тестостерон',
    options: [
      { value: 'very-fast', label: 'Много бързо', icon: '⚡' },
      { value: 'fast', label: 'Бързо', icon: '✅' },
      { value: 'normal', label: 'Нормално', icon: '👍' },
      { value: 'slow', label: 'Бавно', icon: '🐌' },
      { value: 'very-slow', label: 'Много бавно', icon: '😴' }
    ],
    required: true
  },
  {
    id: 'supplements',
    type: 'text',
    question: 'Какви добавки приемаш?',
    subtitle: 'Напиши или остави празно ако не приемаш',
    placeholder: 'Напр: Протеин, Витамин Д, Креатин...',
    required: false
  },

  // INFO SLIDE 3 - Testimonial
  {
    id: 'info-3',
    type: 'info',
    icon: '⭐',
    title: 'Мартин, 34 г., София',
    content: [
      '"Тестостеронът ми скочи от 9.7 на 23.2 nmol/L',
      'за само 3 месеца с програмата!"',
      '',
      'Мартин комбинира персонализиран план с добавките',
      'и постигна невероятни резултати.'
    ],
    cta: 'Виж как →'
  },

  // BLOCK 4: Симптоми Part 1 (3 questions)
  {
    id: 'libido',
    type: 'slider',
    question: 'Как е либидото ти?',
    subtitle: 'От 1 (много ниско) до 10 (много високо)',
    min: 1,
    max: 10,
    step: 1,
    required: true
  },
  {
    id: 'morning-erection',
    type: 'buttons',
    question: 'Колко често имаш сутрешна ерекция?',
    subtitle: 'Важен индикатор за тестостерона',
    options: [
      { value: 'every-morning', label: 'Всяка сутрин', icon: '✅' },
      { value: 'often', label: 'Често (4-5 пъти/седм)', icon: '👍' },
      { value: 'sometimes', label: 'Понякога (2-3 пъти/седм)', icon: '🤔' },
      { value: 'rarely', label: 'Рядко (1 път/седм)', icon: '😕' },
      { value: 'never', label: 'Почти никога', icon: '❌' }
    ],
    required: true
  },
  {
    id: 'morning-energy',
    type: 'slider',
    question: 'Как е енергията ти сутрин?',
    subtitle: 'От 1 (изтощен) до 10 (пълен с енергия)',
    min: 1,
    max: 10,
    step: 1,
    required: true
  },

  // INFO SLIDE 4 - Progress
  {
    id: 'info-4',
    type: 'info',
    icon: '🎯',
    title: 'Страхотно напредваш!',
    content: [
      '✓ 15 от 20 въпроса готови (75%)',
      '',
      'Само още 5 въпроса до твоя персонализиран резултат',
      '',
      'Отговори точно за най-добри препоръки!'
    ],
    cta: 'Напред →'
  },

  // BLOCK 5: Симптоми Part 2 (3 questions)
  {
    id: 'concentration',
    type: 'slider',
    question: 'Как е концентрацията и фокусът ти?',
    subtitle: 'От 1 (много лош) до 10 (отличен)',
    min: 1,
    max: 10,
    step: 1,
    required: true
  },
  {
    id: 'mood',
    type: 'buttons',
    question: 'Как е настроението ти общо?',
    subtitle: 'Тестостеронът силно влияе на настроението',
    options: [
      { value: 'positive', label: 'Позитивно', icon: '😊' },
      { value: 'stable', label: 'Стабилно', icon: '😐' },
      { value: 'variable', label: 'Променливо', icon: '😕' },
      { value: 'negative', label: 'Негативно', icon: '😞' }
    ],
    required: true
  },
  {
    id: 'muscle-mass',
    type: 'buttons',
    question: 'Мускулната ти маса последните 6 месеца?',
    subtitle: 'Тестостеронът е анаболен хормон',
    options: [
      { value: 'increased', label: 'Се увеличава', icon: '📈' },
      { value: 'same', label: 'Същата е', icon: '➡️' },
      { value: 'decreased', label: 'Намалява', icon: '📉' }
    ],
    required: true
  },

  // INFO SLIDE 5 - Almost done
  {
    id: 'info-5',
    type: 'info',
    icon: '⚡',
    title: 'Знаеше ли че ниският тестостерон води до:',
    content: [
      '• -30% либидо и сексуален драйв',
      '• -25% мускулна маса',
      '• +40% хронична умора',
      '• Депресия и тревожност',
      '• Увеличен риск от диабет',
      '',
      'Още само 2 въпроса до резултата!'
    ],
    cta: 'Завърши →'
  },

  // BLOCK 6: Contact (2 questions)
  {
    id: 'firstName',
    type: 'text',
    question: 'Как се казваш?',
    subtitle: 'За да персонализираме резултата ти',
    placeholder: 'Въведи името си',
    required: true
  },
  {
    id: 'email',
    type: 'email',
    question: 'На кой имейл да изпратим анализа?',
    subtitle: 'Ще получиш детайлен PDF доклад с резултата',
    placeholder: 'your@email.com',
    required: true
  }
];
