import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Activity, Brain, Dumbbell, Bed, Mail, Gift, ChevronLeft, ChevronRight, User, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TForecastFormProps {
  onResult: (result: any) => void;
}

interface FormData {
  email: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  trainingFrequency: string;
  trainingType: string;
  averageSleep: string;
  diet: string;
  alcohol: string;
  nicotine: string;
  libido: string;
  morningEnergy: string;
  recovery: string;
  mood: string;
}

const sections = [
  {
    id: 'demographics',
    title: "Лична информация",
    icon: User,
    description: "Попълнете основните данни за точен анализ",
    fields: ['gender', 'age', 'height', 'weight']
  },
  {
    id: 'training',
    title: "Тренировки и дейност",
    icon: Dumbbell,
    description: "Вашата физическа активност и тренировъчен режим",
    fields: ['trainingFrequency', 'trainingType']
  },
  {
    id: 'lifestyle',
    title: "Фактори от начина на живот",
    icon: Bed,
    description: "Ежедневните навици които влияят на здравето",
    fields: ['averageSleep', 'diet', 'alcohol', 'nicotine']
  },
  {
    id: 'health',
    title: "Здравни индикатори",
    icon: Heart,
    description: "Как се чувствате и функционирате ежедневно",
    fields: ['libido', 'morningEnergy', 'recovery', 'mood']
  }
];

const TForecastFormMultiStep = ({ onResult }: TForecastFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    trainingFrequency: "",
    trainingType: "",
    averageSleep: "",
    diet: "",
    alcohol: "",
    nicotine: "",
    libido: "",
    morningEnergy: "",
    recovery: "",
    mood: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userEmail) {
      setEmailError("Имейлът е задължителен");
      return;
    }
    if (!emailRegex.test(userEmail)) {
      setEmailError("Моля, въведете валиден имейл адрес");
      return;
    }
    setEmailError("");
    setFormData(prev => ({ ...prev, email: userEmail }));
    setShowEmailPopup(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (stepIndex: number) => {
    const section = sections[stepIndex];
    const allFieldsFilled = section.fields.every(field => formData[field as keyof FormData]);
    return allFieldsFilled;
  };

  const getProgress = () => {
    const completedSteps = sections.slice(0, currentStep + 1).filter((_, index) => validateStep(index)).length;
    return (completedSteps / sections.length) * 100;
  };

  const nextStep = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.gender) newErrors.gender = "Полът е задължителен";
    if (!formData.age) newErrors.age = "Възрастта е задължителна";
    if (!formData.height) newErrors.height = "Ръстът е задължителен";
    if (!formData.weight) newErrors.weight = "Теглото е задължително";
    if (!formData.trainingFrequency) newErrors.trainingFrequency = "Честотата на тренировки е задължителна";
    if (!formData.trainingType) newErrors.trainingType = "Типът тренировка е задължителен";
    if (!formData.averageSleep) newErrors.averageSleep = "Часовете сън са задължителни";
    if (!formData.diet) newErrors.diet = "Типът диета е задължителен";
    if (!formData.alcohol) newErrors.alcohol = "Консумацията на алкохол е задължителна";
    if (!formData.nicotine) newErrors.nicotine = "Употребата на никотин е задължителна";
    if (!formData.libido) newErrors.libido = "Нивото на либидо е задължително";
    if (!formData.morningEnergy) newErrors.morningEnergy = "Сутрешната енергия е задължителна";
    if (!formData.recovery) newErrors.recovery = "Темпът на възстановяване е задължителен";
    if (!formData.mood) newErrors.mood = "Общото настроение е задължително";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Грешка",
        description: "Моля, попълнете всички задължителни полета.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('https://xtracts4u.app.n8n.cloud/webhook-test/testo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          height: parseInt(formData.height),
          weight: parseInt(formData.weight),
          averageSleep: parseFloat(formData.averageSleep),
          alcohol: parseInt(formData.alcohol)
        })
      });
      if (!response.ok) {
        throw new Error('Failed to get forecast');
      }
      onResult({
        type: 'thank-you',
        title: 'Благодарим! Вашата Testograph прогноза е в процес.',
        description: "Изпратихме вашия персонализиран доклад до вашия имейл адрес.\nМоже да отнеме 1–2 минути да пристигне — ако не го видите, моля проверете папките Промоции или Спам."
      });
      toast({
        title: "Анализът завърши",
        description: "Вашата Testograph прогноза беше генерирана успешно."
      });
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Неуспешно генериране на прогнозата. Моля, опитайте отново.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDemographicsStep = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="gender">Пол</Label>
          <select
            id="gender"
            value={formData.gender}
            onChange={e => handleInputChange('gender', e.target.value)}
            className="flex h-10 w-full items-center justify-between border border-glass-border bg-glass-bg/50 backdrop-blur-sm px-3 py-2 text-sm rounded-md mt-1"
          >
            <option value="" disabled hidden>Изберете пол</option>
            <option value="male">Мъжки</option>
          </select>
          {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
        </div>
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
            className="mt-1 bg-glass-bg/50 border-glass-border backdrop-blur-sm"
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
            className="mt-1 bg-glass-bg/50 border-glass-border backdrop-blur-sm"
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
            className="mt-1 bg-glass-bg/50 border-glass-border backdrop-blur-sm"
          />
          {errors.weight && <p className="text-sm text-destructive mt-1">{errors.weight}</p>}
        </div>
      </div>
    </div>
  );

  const renderTrainingStep = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="trainingFrequency">Честота на тренировки</Label>
          <select
            id="trainingFrequency"
            value={formData.trainingFrequency}
            onChange={e => handleInputChange('trainingFrequency', e.target.value)}
            className="flex h-10 w-full items-center justify-between border border-glass-border bg-glass-bg/50 backdrop-blur-sm px-3 py-2 text-sm rounded-md mt-1"
          >
            <option value="" disabled hidden>Изберете честота</option>
            <option value="none">Никаква</option>
            <option value="1-2">1-2 пъти/седмица</option>
            <option value="3-4">3-4 пъти/седмица</option>
            <option value="5-6">5-6 пъти/седмица</option>
            <option value="6+">6+ пъти/седмица</option>
          </select>
          {errors.trainingFrequency && <p className="text-sm text-destructive mt-1">{errors.trainingFrequency}</p>}
        </div>
        <div>
          <Label htmlFor="trainingType">Тип тренировка</Label>
          <select
            id="trainingType"
            value={formData.trainingType}
            onChange={e => handleInputChange('trainingType', e.target.value)}
            className="flex h-10 w-full items-center justify-between border border-glass-border bg-glass-bg/50 backdrop-blur-sm px-3 py-2 text-sm rounded-md mt-1"
          >
            <option value="" disabled hidden>Изберете тип</option>
            <option value="none">Никаква</option>
            <option value="strength">Силови тренировки</option>
            <option value="mix">Смесени тренировки</option>
            <option value="endurance">Издръжливост</option>
          </select>
          {errors.trainingType && <p className="text-sm text-destructive mt-1">{errors.trainingType}</p>}
        </div>
      </div>
    </div>
  );

  const renderLifestyleStep = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
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
            className="mt-1 bg-glass-bg/50 border-glass-border backdrop-blur-sm"
          />
          {errors.averageSleep && <p className="text-sm text-destructive mt-1">{errors.averageSleep}</p>}
        </div>
        <div>
          <Label htmlFor="diet">Тип диета</Label>
          <select
            id="diet"
            value={formData.diet}
            onChange={e => handleInputChange('diet', e.target.value)}
            className="flex h-10 w-full items-center justify-between border border-glass-border bg-glass-bg/50 backdrop-blur-sm px-3 py-2 text-sm rounded-md mt-1"
          >
            <option value="" disabled hidden>Изберете тип диета</option>
            <option value="balanced">Балансирана диета</option>
            <option value="processed">Преработени храни</option>
            <option value="custom">Опишете вашата диета</option>
          </select>
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
            className="mt-1 bg-glass-bg/50 border-glass-border backdrop-blur-sm"
          />
          {errors.alcohol && <p className="text-sm text-destructive mt-1">{errors.alcohol}</p>}
        </div>
        <div>
          <Label htmlFor="nicotine">Употреба на никотин</Label>
          <select
            id="nicotine"
            value={formData.nicotine}
            onChange={e => handleInputChange('nicotine', e.target.value)}
            className="flex h-10 w-full items-center justify-between border border-glass-border bg-glass-bg/50 backdrop-blur-sm px-3 py-2 text-sm rounded-md mt-1"
          >
            <option value="" disabled hidden>Изберете употреба на никотин</option>
            <option value="none">Никаква</option>
            <option value="vape">Вейп</option>
            <option value="cigarettes">Цигари</option>
            <option value="other">Друго</option>
          </select>
          {errors.nicotine && <p className="text-sm text-destructive mt-1">{errors.nicotine}</p>}
        </div>
      </div>
    </div>
  );

  const renderHealthStep = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="libido">Ниво на либидо</Label>
          <select
            id="libido"
            value={formData.libido}
            onChange={e => handleInputChange('libido', e.target.value)}
            className="flex h-10 w-full items-center justify-between border border-glass-border bg-glass-bg/50 backdrop-blur-sm px-3 py-2 text-sm rounded-md mt-1"
          >
            <option value="" disabled hidden>Изберете ниво на либидо</option>
            <option value="high">Високо</option>
            <option value="normal">Нормално</option>
            <option value="low">Ниско</option>
            <option value="very-low">Много ниско</option>
          </select>
          {errors.libido && <p className="text-sm text-destructive mt-1">{errors.libido}</p>}
        </div>
        <div>
          <Label htmlFor="morningEnergy">Сутрешна енергия</Label>
          <select
            id="morningEnergy"
            value={formData.morningEnergy}
            onChange={e => handleInputChange('morningEnergy', e.target.value)}
            className="flex h-10 w-full items-center justify-between border border-glass-border bg-glass-bg/50 backdrop-blur-sm px-3 py-2 text-sm rounded-md mt-1"
          >
            <option value="" disabled hidden>Изберете ниво на сутрешна енергия</option>
            <option value="high">Висока</option>
            <option value="normal">Нормална</option>
            <option value="low">Ниска</option>
            <option value="very-low">Много ниска</option>
          </select>
          {errors.morningEnergy && <p className="text-sm text-destructive mt-1">{errors.morningEnergy}</p>}
        </div>
        <div>
          <Label htmlFor="recovery">Темп на възстановяване</Label>
          <select
            id="recovery"
            value={formData.recovery}
            onChange={e => handleInputChange('recovery', e.target.value)}
            className="flex h-10 w-full items-center justify-between border border-glass-border bg-glass-bg/50 backdrop-blur-sm px-3 py-2 text-sm rounded-md mt-1"
          >
            <option value="" disabled hidden>Изберете темп на възстановяване</option>
            <option value="fast">Бързо</option>
            <option value="normal">Нормално</option>
            <option value="slow">Бавно</option>
            <option value="very-slow">Много бавно</option>
          </select>
          {errors.recovery && <p className="text-sm text-destructive mt-1">{errors.recovery}</p>}
        </div>
        <div>
          <Label htmlFor="mood">Общо настроение</Label>
          <select
            id="mood"
            value={formData.mood}
            onChange={e => handleInputChange('mood', e.target.value)}
            className="flex h-10 w-full items-center justify-between border border-glass-border bg-glass-bg/50 backdrop-blur-sm px-3 py-2 text-sm rounded-md mt-1"
          >
            <option value="" disabled hidden>Изберете общо настроение</option>
            <option value="positive">Позитивно</option>
            <option value="stable">Стабилно</option>
            <option value="variable">Променливо</option>
            <option value="negative">Негативно</option>
          </select>
          {errors.mood && <p className="text-sm text-destructive mt-1">{errors.mood}</p>}
        </div>
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
    <>
      {/* Email Popup */}
      <Dialog open={showEmailPopup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700 text-white">
          <DialogHeader className="space-y-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-primary">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-3">
              <DialogTitle className="text-center text-2xl font-bold text-white">Получете своят безплатен Testograph анализ</DialogTitle>
              <DialogDescription className="text-center text-base leading-relaxed px-4 text-slate-300">
                Присъединете се към хилядите, които подобриха своето здраве.
                Получете персонализирани съвети и ексклузивни прозрения в пощенската си кутия.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleEmailSubmit} className="space-y-6 mt-8">
            <div>
              <Input
                id="popup-email"
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                placeholder="Въведете вашия имейл адрес"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary focus:border-primary"
                autoFocus
              />
              {emailError && <p className="text-sm text-red-400 mt-1">{emailError}</p>}
            </div>
            
            <Button type="submit" className="w-full bg-gradient-primary hover:shadow-glow text-white font-semibold py-3 transition-all duration-300">
              Получи в e-mail
            </Button>

            <div className="flex items-center justify-center space-x-6 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">★</span>
                <span>Бърз достъп</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-green-500">🔒</span>
                <span>Защитена поверителност</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-blue-500">📧</span>
                <span>Отписване по всяко време</span>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="testograph-form-container">
        <GlassCard variant="elevated" className="max-w-4xl mx-auto animate-scale-in">
          {/* Progress Header */}
          <div className="p-6 border-b border-glass-border/50 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{currentSection.title}</h2>
                  <p className="text-sm text-muted-foreground">{currentSection.description}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Стъпка {currentStep + 1} от {sections.length}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0%</span>
              <span>{Math.round(getProgress())}% завършено</span>
              <span>100%</span>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={onSubmit} className="p-6">
            <div className="animate-fade-in">
              {renderSteps[currentStep]()}
            </div>

            {/* Navigation Buttons */}
            <div className={`flex mt-8 pt-6 border-t border-glass-border/50 ${currentStep === 0 ? 'justify-end' : 'justify-between'}`}>
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="bg-glass-bg border-glass-border backdrop-blur-sm hover:shadow-glow transition-all duration-300"
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
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  Напред
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || !validateStep(currentStep)}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Генериране на доклад...
                    </>
                  ) : (
                    "Завърши анализа"
                  )}
                </Button>
              )}
            </div>
          </form>
        </GlassCard>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {sections.map((section, index) => {
            const IconComp = section.icon;
            const isCompleted = validateStep(index);
            const isCurrent = index === currentStep;
            const isPast = index < currentStep;
            
            return (
              <div
                key={section.id}
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  isCurrent
                    ? 'border-primary bg-primary/20 shadow-glow'
                    : isPast || isCompleted
                    ? 'border-success bg-success/20'
                    : 'border-glass-border bg-glass-bg/50 backdrop-blur-sm'
                }`}
              >
                <IconComp className={`w-5 h-5 ${
                  isCurrent ? 'text-primary' : isPast || isCompleted ? 'text-success' : 'text-muted-foreground'
                }`} />
              </div>
            );
          })}
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg backdrop-blur-sm border border-glass-border/50">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Медицински отказ от отговорност:</strong> Този инструмент не е заместител на медицински съвет, диагноза или лечение. 
            Винаги се консултирайте с квалифициран здравен специалист преди да предприемете промени във вашето здраве или начин на живот.
          </p>
        </div>
      </div>
    </>
  );
};

export default TForecastFormMultiStep;