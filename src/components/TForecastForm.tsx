import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Activity, Brain, Dumbbell, Bed, Mail, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface TForecastFormProps {
  onResult: (result: any) => void;
}
const TForecastForm = ({
  onResult
}: TForecastFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const {
    toast
  } = useToast();

  // Form data state
  const [formData, setFormData] = useState({
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
    setFormData(prev => ({
      ...prev,
      email: userEmail
    }));
    setShowEmailPopup(false);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
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
        headers: {
          'Content-Type': 'application/json'
        },
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
      const result = await response.json();
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
  return <>
      {/* Email Popup */}
      <Dialog open={showEmailPopup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700 text-white">
          <DialogHeader className="space-y-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/80">
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
              <Input id="popup-email" type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="Въведете вашия имейл адрес" className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary focus:border-primary" autoFocus />
              {emailError && <p className="text-sm text-red-400 mt-1">{emailError}</p>}
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3">Получи в e-mail</Button>

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
        <form onSubmit={onSubmit} className="tg-form space-y-8">
          {/* Personal Information */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Лична информация</CardTitle>
                  <CardDescription>
                    Попълнете полетата по-долу за точен анализ
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="gender">Пол</Label>
                  <select id="gender" value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)} className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 rounded-2xl">
                    <option value="" disabled hidden>Изберете пол</option>
                    <option value="male">Мъжки</option>
                  </select>
                  {errors.gender && <p className="text-sm text-destructive mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <Label htmlFor="age">Възраст (години)</Label>
                  <Input id="age" type="number" value={formData.age} onChange={e => handleInputChange('age', e.target.value)} placeholder="30" min="18" max="100" className="mt-1 rounded-2xl" />
                  {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
                </div>

                <div>
                  <Label htmlFor="height">Ръст (см)</Label>
                  <Input id="height" type="number" value={formData.height} onChange={e => handleInputChange('height', e.target.value)} placeholder="175" min="100" max="250" className="mt-1 rounded-2xl" />
                  {errors.height && <p className="text-sm text-destructive mt-1">{errors.height}</p>}
                </div>

                <div>
                  <Label htmlFor="weight">Тегло (кг)</Label>
                  <Input id="weight" type="number" value={formData.weight} onChange={e => handleInputChange('weight', e.target.value)} placeholder="75" min="30" max="300" className="mt-1 rounded-2xl" />
                  {errors.weight && <p className="text-sm text-destructive mt-1">{errors.weight}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Information */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Тренировки и дейност</CardTitle>
                  <CardDescription>
                    Попълнете полетата по-долу за точен анализ
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="trainingFrequency">Честота на тренировки</Label>
                  <select id="trainingFrequency" value={formData.trainingFrequency} onChange={e => handleInputChange('trainingFrequency', e.target.value)} className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 rounded-2xl">
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
                  <select id="trainingType" value={formData.trainingType} onChange={e => handleInputChange('trainingType', e.target.value)} className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 rounded-xl">
                    <option value="" disabled hidden>Изберете тип</option>
                    <option value="none">Никаква</option>
                    <option value="strength">Силови тренировки</option>
                    <option value="mix">Смесени тренировки</option>
                    <option value="endurance">Издръжливост</option>
                  </select>
                  {errors.trainingType && <p className="text-sm text-destructive mt-1">{errors.trainingType}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle Factors */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Bed className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Фактори от начина на живот</CardTitle>
                  <CardDescription>
                    Попълнете полетата по-долу за точен анализ
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="averageSleep">Среден сън (часове)</Label>
                  <Input id="averageSleep" type="number" step="0.5" value={formData.averageSleep} onChange={e => handleInputChange('averageSleep', e.target.value)} placeholder="7.5" min="3" max="12" className="mt-1 rounded-2xl" />
                  {errors.averageSleep && <p className="text-sm text-destructive mt-1">{errors.averageSleep}</p>}
                </div>

                <div>
                  <Label htmlFor="diet">Тип диета</Label>
                  <select id="diet" value={formData.diet} onChange={e => handleInputChange('diet', e.target.value)} className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 rounded-2xl">
                    <option value="" disabled hidden>Изберете тип диета</option>
                    <option value="balanced">Балансирана диета</option>
                    <option value="processed">Преработени храни</option>
                    <option value="custom">Опишете вашата диета</option>
                  </select>
                  {errors.diet && <p className="text-sm text-destructive mt-1">{errors.diet}</p>}
                </div>

                <div>
                  <Label htmlFor="alcohol">Алкохол (питиета/седмица)</Label>
                  <Input id="alcohol" type="number" value={formData.alcohol} onChange={e => handleInputChange('alcohol', e.target.value)} placeholder="3" min="0" max="50" className="mt-1 rounded-2xl" />
                  {errors.alcohol && <p className="text-sm text-destructive mt-1">{errors.alcohol}</p>}
                </div>

                <div>
                  <Label htmlFor="nicotine">Употреба на никотин</Label>
                  <select id="nicotine" value={formData.nicotine} onChange={e => handleInputChange('nicotine', e.target.value)} className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 rounded-2xl">
                    <option value="" disabled hidden>Изберете употреба на никотин</option>
                    <option value="none">Никаква</option>
                    <option value="vape">Вейп</option>
                    <option value="cigarettes">Цигари</option>
                    <option value="iqos">IQOS</option>
                    <option value="all">Всички видове</option>
                  </select>
                  {errors.nicotine && <p className="text-sm text-destructive mt-1">{errors.nicotine}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Indicators */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Здравни показатели</CardTitle>
                  <CardDescription>
                    Попълнете полетата по-долу за точен анализ
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="libido">Ниво на либидо</Label>
                  <select id="libido" value={formData.libido} onChange={e => handleInputChange('libido', e.target.value)} className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 rounded-2xl">
                    <option value="" disabled hidden>Изберете ниво</option>
                    <option value="low">Ниско</option>
                    <option value="average">Средно</option>
                    <option value="high">Високо</option>
                  </select>
                  {errors.libido && <p className="text-sm text-destructive mt-1">{errors.libido}</p>}
                </div>

                <div>
                  <Label htmlFor="morningEnergy">Сутрешна енергия</Label>
                  <select id="morningEnergy" value={formData.morningEnergy} onChange={e => handleInputChange('morningEnergy', e.target.value)} className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 rounded-2xl">
                    <option value="" disabled hidden>Изберете ниво на енергия</option>
                    <option value="none">Ниска/Никаква</option>
                    <option value="high">Висока</option>
                  </select>
                  {errors.morningEnergy && <p className="text-sm text-destructive mt-1">{errors.morningEnergy}</p>}
                </div>

                <div>
                  <Label htmlFor="recovery">Темп на възстановяване</Label>
                  <select id="recovery" value={formData.recovery} onChange={e => handleInputChange('recovery', e.target.value)} className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 rounded-2xl">
                    <option value="" disabled hidden>Изберете темп на възстановяване</option>
                    <option value="slow">Бавно</option>
                    <option value="average">Средно</option>
                    <option value="fast">Бързо</option>
                  </select>
                  {errors.recovery && <p className="text-sm text-destructive mt-1">{errors.recovery}</p>}
                </div>

                <div>
                  <Label htmlFor="mood">Общо настроение</Label>
                  <select id="mood" value={formData.mood} onChange={e => handleInputChange('mood', e.target.value)} className="flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 rounded-2xl">
                    <option value="" disabled hidden>Изберете настроение</option>
                    <option value="bad">Лошо</option>
                    <option value="neutral">Неутрално</option>
                    <option value="good">Добро</option>
                  </select>
                  {errors.mood && <p className="text-sm text-destructive mt-1">{errors.mood}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-8">
            <Button type="submit" size="lg" disabled={isLoading} className="w-full max-w-md bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg rounded-full">
              {isLoading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Анализираме вашите данни...
                </> : <>
                  <Activity className="mr-2 h-4 w-4" />
                  Вземи своят Testograph анализ
                </>}
            </Button>
          </div>
        </form>
      </div>
    </>;
};
export default TForecastForm;