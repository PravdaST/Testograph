import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Activity, Brain, Dumbbell, Bed, Mail, Gift, ChevronLeft, ChevronRight, User, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormSelect, FormSelectContent, FormSelectItem, FormSelectTrigger, FormSelectValue } from "@/components/FormSelect";

interface TForecastFormProps {
  onResult: (result: any) => void;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  trainingFrequency: string;
  trainingType: string[];
  supplements: string;
  averageSleep: string;
  diet: string;
  alcohol: string;
  nicotine: string;
  libido: string;
  morningErection: string;
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
    fields: ['trainingFrequency', 'trainingType', 'supplements']
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
    fields: ['libido', 'morningErection', 'morningEnergy', 'recovery', 'mood']
  }
];

const TForecastFormMultiStep = ({ onResult }: TForecastFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    trainingFrequency: "",
    trainingType: [],
    supplements: "",
    averageSleep: "",
    diet: "",
    alcohol: "",
    nicotine: "",
    libido: "",
    morningErection: "",
    morningEnergy: "",
    recovery: "",
    mood: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    setEmailError("");
    setFirstNameError("");
    
    if (!userFirstName.trim()) {
      setFirstNameError("Името е задължително");
      return;
    }
    if (!userEmail) {
      setEmailError("Имейлът е задължителен");
      return;
    }
    if (!emailRegex.test(userEmail)) {
      setEmailError("Моля, въведете валиден имейл адрес");
      return;
    }
    
    setShowEmailPopup(false);
    
    // Pass email and names directly to submitForm to avoid async state issues
    submitForm(userEmail, userFirstName, userLastName);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (stepIndex: number) => {
    const section = sections[stepIndex];
    const allFieldsFilled = section.fields.every(field => {
      const value = formData[field as keyof FormData];
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
    
    // Show email popup instead of submitting directly
    setShowEmailPopup(true);
  };

  const submitForm = async (email?: string, firstName?: string, lastName?: string) => {
    setIsLoading(true);
    try {
      // Prepare the complete payload with all form data
      const payload = {
        ...formData,
        email: email || formData.email,
        firstName: firstName || formData.firstName,
        lastName: lastName || formData.lastName,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        averageSleep: parseFloat(formData.averageSleep),
        alcohol: parseInt(formData.alcohol)
      };

      const response = await fetch('https://xtracts4u.app.n8n.cloud/webhook-test/testo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      setShowEmailPopup(false); // Allow user to try again
    } finally {
      setIsLoading(false);
    }
  };

  const renderDemographicsStep = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="gender">Пол</Label>
          <FormSelect value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <FormSelectTrigger className="mt-1">
              <FormSelectValue placeholder="Изберете пол" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="male">Мъжки</FormSelectItem>
            </FormSelectContent>
          </FormSelect>
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
            className="mt-1 bg-muted/10 border-muted/20 backdrop-blur-sm"
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
            className="mt-1 bg-muted/10 border-muted/20 backdrop-blur-sm"
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
            className="mt-1 bg-muted/10 border-muted/20 backdrop-blur-sm"
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
          <FormSelect value={formData.trainingFrequency} onValueChange={(value) => handleInputChange('trainingFrequency', value)}>
            <FormSelectTrigger className="mt-1">
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
          <div className="mt-2 space-y-3 p-3 rounded-md border border-muted/20 bg-muted/10 backdrop-blur-sm">
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
                    
                    // If "Не спортувам" is selected, clear other selections
                    if (option.value === "none" && e.target.checked) {
                      handleInputChange('trainingType', ["none"]);
                    }
                    // If any other option is selected while "Не спортувам" is checked, remove "Не спортувам"
                    else if (option.value !== "none" && e.target.checked && formData.trainingType.includes("none")) {
                      handleInputChange('trainingType', [option.value]);
                    }
                    else {
                      handleInputChange('trainingType', newTypes);
                    }
                  }}
                  className="rounded border-muted/40 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-2 bg-muted/20"
                />
                <Label
                  htmlFor={`training-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
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
              className="bg-muted/10 border-muted/20 backdrop-blur-sm disabled:opacity-50"
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
              <Label
                htmlFor="no-supplements"
                className="text-sm font-normal cursor-pointer"
              >
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
            className="mt-1 bg-muted/10 border-muted/20 backdrop-blur-sm"
          />
          {errors.averageSleep && <p className="text-sm text-destructive mt-1">{errors.averageSleep}</p>}
        </div>
        <div>
          <Label htmlFor="diet">Тип диета</Label>
          <FormSelect value={formData.diet} onValueChange={(value) => handleInputChange('diet', value)}>
            <FormSelectTrigger className="mt-1">
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
            className="mt-1 bg-muted/10 border-muted/20 backdrop-blur-sm"
          />
          {errors.alcohol && <p className="text-sm text-destructive mt-1">{errors.alcohol}</p>}
        </div>
        <div>
          <Label htmlFor="nicotine">Употреба на никотин</Label>
          <FormSelect value={formData.nicotine} onValueChange={(value) => handleInputChange('nicotine', value)}>
            <FormSelectTrigger className="mt-1">
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
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="libido">Ниво на либидо</Label>
          <FormSelect value={formData.libido} onValueChange={(value) => handleInputChange('libido', value)}>
            <FormSelectTrigger className="mt-1">
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
            <FormSelectTrigger className="mt-1">
              <FormSelectValue placeholder="Изберете честота на сутрешна ерекция" />
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
            <FormSelectTrigger className="mt-1">
              <FormSelectValue placeholder="Изберете ниво на сутрешна енергия" />
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
            <FormSelectTrigger className="mt-1">
              <FormSelectValue placeholder="Изберете темп на възстановяване" />
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
            <FormSelectTrigger className="mt-1">
              <FormSelectValue placeholder="Изберете общо настроение" />
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
      <Dialog open={showEmailPopup} onOpenChange={(open) => !isLoading && setShowEmailPopup(open)}>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  id="popup-firstName"
                  type="text"
                  value={userFirstName}
                  onChange={e => setUserFirstName(e.target.value)}
                  placeholder="Име"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary focus:border-primary"
                  autoFocus
                />
                {firstNameError && <p className="text-sm text-red-400 mt-1">{firstNameError}</p>}
              </div>
              <div>
                <Input
                  id="popup-lastName"
                  type="text"
                  value={userLastName}
                  onChange={e => setUserLastName(e.target.value)}
                  placeholder="Фамилия (незадължително)"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div>
              <Input
                id="popup-email"
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                placeholder="Въведете вашия имейл адрес"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary focus:border-primary"
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
          <div className="p-6 border-b border-muted/20 animate-fade-in">
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
            <div className={`flex mt-8 pt-6 border-t border-muted/20 ${currentStep === 0 ? 'justify-end' : 'justify-between'}`}>
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="bg-muted/10 border-muted/20 backdrop-blur-sm hover:shadow-glow transition-all duration-300"
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
                    : 'border-muted/20 bg-muted/10 backdrop-blur-sm'
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
        <div className="mt-8 p-4 bg-muted/50 rounded-lg backdrop-blur-sm border border-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            Този инструмент не е заместител на медицински изследвания, диагнози и лечение. Преди да предприемате промени във вашето здраве или начин на живот винаги се консултирайте с квалифициран здравен специалист.
          </p>
        </div>
      </div>
    </>
  );
};

export default TForecastFormMultiStep;