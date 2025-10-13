"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { ChevronLeft, ChevronRight, User, Dumbbell, Bed, Heart } from "lucide-react";
import { FormSelect, FormSelectContent, FormSelectItem, FormSelectTrigger, FormSelectValue } from "@/components/FormSelect";
import type { QuizData } from "@/lib/test/scoring";

interface QuizFormProps {
  onComplete: (data: QuizData & { email: string; firstName: string }) => void;
}

const sections = [
  {
    id: 'demographics',
    title: "Лична информация",
    icon: User,
    description: "Основни данни за точен анализ",
    fields: ['age', 'height', 'weight']
  },
  {
    id: 'training',
    title: "Тренировки и дейност",
    icon: Dumbbell,
    description: "Физическа активност и тренировъчен режим",
    fields: ['trainingFrequency', 'trainingType', 'supplements']
  },
  {
    id: 'lifestyle',
    title: "Начин на живот",
    icon: Bed,
    description: "Ежедневни навици които влияят на тестостерона",
    fields: ['averageSleep', 'diet', 'alcohol', 'nicotine']
  },
  {
    id: 'health',
    title: "Здравни индикатори",
    icon: Heart,
    description: "Как се чувствате и функционирате",
    fields: ['libido', 'morningErection', 'morningEnergy', 'recovery', 'mood', 'email', 'firstName']
  }
];

export const QuizForm = ({ onComplete }: QuizFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    trainingFrequency: "",
    trainingType: [] as string[],
    supplements: "",
    averageSleep: "",
    diet: "",
    alcohol: "",
    nicotine: "",
    libido: "",
    morningErection: "",
    morningEnergy: "",
    recovery: "",
    mood: "",
    email: "",
    firstName: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (stepIndex: number) => {
    const section = sections[stepIndex];
    const allFieldsFilled = section.fields.every(field => {
      const value = formData[field as keyof typeof formData];
      return Array.isArray(value) ? value.length > 0 : value;
    });
    return allFieldsFilled;
  };

  const getProgress = () => {
    const completedSteps = sections.slice(0, currentStep + 1).filter((_, index) => validateStep(index)).length;
    return (completedSteps / sections.length) * 100;
  };

  const nextStep = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.age) newErrors.age = "Възрастта е задължителна";
    if (!formData.height) newErrors.height = "Ръстът е задължителен";
    if (!formData.weight) newErrors.weight = "Теглото е задължително";
    if (!formData.trainingFrequency) newErrors.trainingFrequency = "Честотата на тренировки е задължителна";
    if (!formData.trainingType || formData.trainingType.length === 0) newErrors.trainingType = "Типът тренировка е задължителен";
    if (!formData.supplements) newErrors.supplements = "Приемът на добавки е задължителен";
    if (!formData.averageSleep) newErrors.averageSleep = "Часовете сън са задължителни";
    if (!formData.diet) newErrors.diet = "Типът диета е задължителен";
    if (!formData.alcohol) newErrors.alcohol = "Консумацията на алкохол е задължителна";
    if (!formData.nicotine) newErrors.nicotine = "Употребата на никотин е задължителна";
    if (!formData.libido) newErrors.libido = "Нивото на либидо е задължително";
    if (!formData.morningErection) newErrors.morningErection = "Сутрешната ерекция е задължителна";
    if (!formData.morningEnergy) newErrors.morningEnergy = "Сутрешната енергия е задължителна";
    if (!formData.recovery) newErrors.recovery = "Темпът на възстановяване е задължителен";
    if (!formData.mood) newErrors.mood = "Общото настроение е задължително";
    if (!formData.firstName) newErrors.firstName = "Името е задължително";
    if (!formData.email) newErrors.email = "Имейлът е задължителен";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Моля, въведете валиден имейл адрес";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Convert to QuizData format
    const quizData: QuizData & { email: string; firstName: string } = {
      age: parseInt(formData.age),
      weight: parseInt(formData.weight),
      height: parseInt(formData.height),
      trainingFrequency: formData.trainingFrequency,
      trainingType: formData.trainingType,
      supplements: formData.supplements,
      averageSleep: parseFloat(formData.averageSleep),
      diet: formData.diet,
      alcohol: parseInt(formData.alcohol),
      nicotine: formData.nicotine,
      libido: formData.libido,
      morningErection: formData.morningErection,
      morningEnergy: formData.morningEnergy,
      recovery: formData.recovery,
      mood: formData.mood,
      email: formData.email,
      firstName: formData.firstName
    };

    onComplete(quizData);
  };

  const renderDemographicsStep = () => (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Label htmlFor="age">Възраст (години)</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={e => handleInputChange('age', e.target.value)}
            placeholder="30"
            min="18"
            max="100"
            className="mt-2 h-12 text-base"
          />
          {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
        </div>
        <div>
          <Label htmlFor="height">Ръст (см)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={e => handleInputChange('height', e.target.value)}
            placeholder="175"
            min="100"
            max="250"
            className="mt-2 h-12 text-base"
          />
          {errors.height && <p className="text-sm text-destructive mt-1">{errors.height}</p>}
        </div>
        <div>
          <Label htmlFor="weight">Тегло (кг)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={e => handleInputChange('weight', e.target.value)}
            placeholder="75"
            min="30"
            max="300"
            className="mt-2 h-12 text-base"
          />
          {errors.weight && <p className="text-sm text-destructive mt-1">{errors.weight}</p>}
        </div>
      </div>
    </div>
  );

  const renderTrainingStep = () => (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Label htmlFor="trainingFrequency">Честота на тренировки</Label>
          <FormSelect value={formData.trainingFrequency} onValueChange={(value) => handleInputChange('trainingFrequency', value)}>
            <FormSelectTrigger className="mt-2 h-12 text-base">
              <FormSelectValue placeholder="Изберете честота" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="none">Не спортувам</FormSelectItem>
              <FormSelectItem value="1-2">1-2 пъти/седмица</FormSelectItem>
              <FormSelectItem value="3-4">3-4 пъти/седмица</FormSelectItem>
              <FormSelectItem value="5-6">5-6 пъти/седмица</FormSelectItem>
              <FormSelectItem value="6+">6+ пъти/седмица</FormSelectItem>
            </FormSelectContent>
          </FormSelect>
          {errors.trainingFrequency && <p className="text-sm text-destructive mt-1">{errors.trainingFrequency}</p>}
        </div>
        <div>
          <Label htmlFor="trainingType">Тип тренировка (можете да изберете повече от един)</Label>
          <div className="mt-2 space-y-3 p-3 rounded-md border border-purple-500/30 bg-background backdrop-blur-sm shadow-sm shadow-purple-500/10">
            {[
              { value: "none", label: "Не спортувам" },
              { value: "strength", label: "Силови тренировки" },
              { value: "endurance", label: "За издръжливост" },
              { value: "cardio", label: "Кардио" }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`training-${option.value}`}
                  checked={formData.trainingType.includes(option.value)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...formData.trainingType, option.value]
                      : formData.trainingType.filter(type => type !== option.value);

                    if (option.value === "none" && e.target.checked) {
                      handleInputChange('trainingType', ["none"]);
                    } else if (option.value !== "none" && e.target.checked && formData.trainingType.includes("none")) {
                      handleInputChange('trainingType', [option.value]);
                    } else {
                      handleInputChange('trainingType', newTypes);
                    }
                  }}
                  className="rounded border-muted/40 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-2 bg-muted/20"
                />
                <Label htmlFor={`training-${option.value}`} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.trainingType && <p className="text-sm text-destructive mt-1">{errors.trainingType}</p>}
        </div>
        <div>
          <Label htmlFor="supplements">Прием на добавки</Label>
          <div className="mt-2 space-y-3">
            <Input
              id="supplements"
              type="text"
              value={formData.supplements === "Не приемам добавки" ? "" : formData.supplements}
              onChange={e => handleInputChange('supplements', e.target.value)}
              placeholder="Протеин, Витамин Д, Креатин"
              disabled={formData.supplements === "Не приемам добавки"}
              className="h-12 text-base disabled:opacity-50"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="no-supplements"
                checked={formData.supplements === "Не приемам добавки"}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange('supplements', "Не приемам добавки");
                  } else {
                    handleInputChange('supplements', "");
                  }
                }}
                className="rounded border-muted/40 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-2 bg-muted/20"
              />
              <Label htmlFor="no-supplements" className="text-sm font-normal cursor-pointer">
                Не приемам добавки
              </Label>
            </div>
          </div>
          {errors.supplements && <p className="text-sm text-destructive mt-1">{errors.supplements}</p>}
        </div>
      </div>
    </div>
  );

  const renderLifestyleStep = () => (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Label htmlFor="averageSleep">Среден сън (часове)</Label>
          <Input
            id="averageSleep"
            type="number"
            step="0.5"
            value={formData.averageSleep}
            onChange={e => handleInputChange('averageSleep', e.target.value)}
            placeholder="7.5"
            min="3"
            max="12"
            className="mt-2 h-12 text-base"
          />
          {errors.averageSleep && <p className="text-sm text-destructive mt-1">{errors.averageSleep}</p>}
        </div>
        <div>
          <Label htmlFor="diet">Тип диета</Label>
          <FormSelect value={formData.diet} onValueChange={(value) => handleInputChange('diet', value)}>
            <FormSelectTrigger className="mt-2 h-12 text-base">
              <FormSelectValue placeholder="Изберете тип диета" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="balanced">Балансирана диета</FormSelectItem>
              <FormSelectItem value="junk-food">Junk Food</FormSelectItem>
              <FormSelectItem value="vegan">Веган</FormSelectItem>
              <FormSelectItem value="vegetarian">Вегетарианска</FormSelectItem>
              <FormSelectItem value="carnivor">Карнивор</FormSelectItem>
              <FormSelectItem value="keto">Кето</FormSelectItem>
              <FormSelectItem value="fasting">Фастинг</FormSelectItem>
            </FormSelectContent>
          </FormSelect>
          {errors.diet && <p className="text-sm text-destructive mt-1">{errors.diet}</p>}
        </div>
        <div>
          <Label htmlFor="alcohol">Алкохол (питиета/седмица)</Label>
          <Input
            id="alcohol"
            type="number"
            value={formData.alcohol}
            onChange={e => handleInputChange('alcohol', e.target.value)}
            placeholder="3"
            min="0"
            max="50"
            className="mt-2 h-12 text-base"
          />
          {errors.alcohol && <p className="text-sm text-destructive mt-1">{errors.alcohol}</p>}
        </div>
        <div>
          <Label htmlFor="nicotine">Употреба на никотин</Label>
          <FormSelect value={formData.nicotine} onValueChange={(value) => handleInputChange('nicotine', value)}>
            <FormSelectTrigger className="mt-2 h-12 text-base">
              <FormSelectValue placeholder="Изберете употреба на никотин" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="none">Не пуша</FormSelectItem>
              <FormSelectItem value="cigarettes">Цигари</FormSelectItem>
              <FormSelectItem value="iqos">IQOS</FormSelectItem>
              <FormSelectItem value="vape">Вейп</FormSelectItem>
            </FormSelectContent>
          </FormSelect>
          {errors.nicotine && <p className="text-sm text-destructive mt-1">{errors.nicotine}</p>}
        </div>
      </div>
    </div>
  );

  const renderHealthStep = () => (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Label htmlFor="libido">Ниво на либидо</Label>
          <FormSelect value={formData.libido} onValueChange={(value) => handleInputChange('libido', value)}>
            <FormSelectTrigger className="mt-2 h-12 text-base">
              <FormSelectValue placeholder="Изберете ниво на либидо" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="high">Високо</FormSelectItem>
              <FormSelectItem value="normal">Нормално</FormSelectItem>
              <FormSelectItem value="low">Ниско</FormSelectItem>
              <FormSelectItem value="very-low">Много ниско</FormSelectItem>
            </FormSelectContent>
          </FormSelect>
          {errors.libido && <p className="text-sm text-destructive mt-1">{errors.libido}</p>}
        </div>
        <div>
          <Label htmlFor="morningErection">Сутрешна ерекция</Label>
          <FormSelect value={formData.morningErection} onValueChange={(value) => handleInputChange('morningErection', value)}>
            <FormSelectTrigger className="mt-2 h-12 text-base">
              <FormSelectValue placeholder="Изберете честота" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="every-morning">Всяка сутрин</FormSelectItem>
              <FormSelectItem value="sometimes">Понякога</FormSelectItem>
              <FormSelectItem value="rarely">Рядко</FormSelectItem>
              <FormSelectItem value="never">Нямам</FormSelectItem>
            </FormSelectContent>
          </FormSelect>
          {errors.morningErection && <p className="text-sm text-destructive mt-1">{errors.morningErection}</p>}
        </div>
        <div>
          <Label htmlFor="morningEnergy">Сутрешна енергия</Label>
          <FormSelect value={formData.morningEnergy} onValueChange={(value) => handleInputChange('morningEnergy', value)}>
            <FormSelectTrigger className="mt-2 h-12 text-base">
              <FormSelectValue placeholder="Изберете ниво" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="high">Висока</FormSelectItem>
              <FormSelectItem value="normal">Нормална</FormSelectItem>
              <FormSelectItem value="low">Ниска</FormSelectItem>
              <FormSelectItem value="very-low">Много ниска</FormSelectItem>
            </FormSelectContent>
          </FormSelect>
          {errors.morningEnergy && <p className="text-sm text-destructive mt-1">{errors.morningEnergy}</p>}
        </div>
        <div>
          <Label htmlFor="recovery">Физическо възстановяване</Label>
          <FormSelect value={formData.recovery} onValueChange={(value) => handleInputChange('recovery', value)}>
            <FormSelectTrigger className="mt-2 h-12 text-base">
              <FormSelectValue placeholder="Изберете темп" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="very-fast">Много бързо</FormSelectItem>
              <FormSelectItem value="fast">Бързо</FormSelectItem>
              <FormSelectItem value="normal">Нормално</FormSelectItem>
              <FormSelectItem value="slow">Бавно</FormSelectItem>
              <FormSelectItem value="very-slow">Много бавно</FormSelectItem>
            </FormSelectContent>
          </FormSelect>
          {errors.recovery && <p className="text-sm text-destructive mt-1">{errors.recovery}</p>}
        </div>
        <div>
          <Label htmlFor="mood">Общо настроение</Label>
          <FormSelect value={formData.mood} onValueChange={(value) => handleInputChange('mood', value)}>
            <FormSelectTrigger className="mt-2 h-12 text-base">
              <FormSelectValue placeholder="Изберете настроение" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="positive">Позитивно</FormSelectItem>
              <FormSelectItem value="stable">Стабилно</FormSelectItem>
              <FormSelectItem value="variable">Променливо</FormSelectItem>
              <FormSelectItem value="negative">Негативно</FormSelectItem>
            </FormSelectContent>
          </FormSelect>
          {errors.mood && <p className="text-sm text-destructive mt-1">{errors.mood}</p>}
        </div>
      </div>

      {/* Email & Name at the end */}
      <div className="pt-6 border-t border-primary/20">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Получете вашия резултат</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <Label htmlFor="firstName">Име</Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={e => handleInputChange('firstName', e.target.value)}
              placeholder="Вашето име"
              className="mt-2 h-12 text-base"
            />
            {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <Label htmlFor="email">Имейл адрес</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              className="mt-2 h-12 text-base"
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Ще изпратим детайлния анализ на вашия имейл
        </p>
      </div>
    </div>
  );

  const renderSteps = [
    renderDemographicsStep,
    renderTrainingStep,
    renderLifestyleStep,
    renderHealthStep
  ];

  const currentSection = sections[currentStep];
  const IconComponent = currentSection.icon;

  return (
    <div className="w-full">
      <GlassCard variant="elevated" className="max-w-3xl mx-auto animate-scale-in border border-primary/40">
        {/* Progress Header */}
        <div className="p-5 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{currentSection.title}</h2>
                <p className="text-xs text-muted-foreground">{currentSection.description}</p>
              </div>
            </div>
            <div className="text-xs font-medium text-muted-foreground bg-muted/20 px-2.5 py-1 rounded-full">
              {currentStep + 1}/{sections.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all duration-500 shadow-sm shadow-primary/50"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="flex justify-end mt-1.5">
              <span className="text-[10px] font-medium text-primary">{Math.round(getProgress())}% завършено</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className="p-6">
          <div className="animate-fade-in">
            {renderSteps[currentStep]()}
          </div>

          {/* Navigation Buttons */}
          <div className={`flex mt-6 pt-5 border-t border-primary/10 ${currentStep === 0 ? 'justify-end' : 'justify-between'}`}>
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="bg-muted/10 border-muted/30 backdrop-blur-sm hover:bg-muted/20 hover:border-primary/30 transition-all duration-300 text-base px-6 py-3 h-12 min-w-[120px]"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            )}

            {currentStep < sections.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 text-base px-6 py-3 h-12 min-w-[140px] font-semibold"
              >
                Напред
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!validateStep(currentStep)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 text-base px-8 py-3 h-12 min-w-[180px] font-bold"
              >
                Виж резултата
              </Button>
            )}
          </div>
        </form>
      </GlassCard>

      {/* Step Indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {sections.map((section, index) => {
          const IconComp = section.icon;
          const isCompleted = validateStep(index);
          const isCurrent = index === currentStep;
          const isPast = index < currentStep;

          return (
            <div
              key={section.id}
              className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${
                isCurrent
                  ? 'border-primary bg-primary/20 shadow-md shadow-primary/30 scale-110'
                  : isPast || isCompleted
                  ? 'border-success/50 bg-success/10'
                  : 'border-muted/30 bg-muted/5 backdrop-blur-sm'
              }`}
            >
              <IconComp className={`w-4 h-4 ${
                isCurrent ? 'text-primary' : isPast || isCompleted ? 'text-success' : 'text-muted-foreground'
              }`} />
            </div>
          );
        })}
      </div>

      {/* Medical Disclaimer */}
      <div className="mt-6 p-3 bg-muted/30 rounded-lg backdrop-blur-sm border border-muted/20 max-w-3xl mx-auto">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          Този инструмент не е заместител на медицински изследвания, диагнози и лечение. Преди да предприемате промени във вашето здраве или начин на живот винаги се консултирайте с квалифициран здравен специалист.
        </p>
      </div>
    </div>
  );
};
