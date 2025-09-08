import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Activity, Brain, Dumbbell, Bed, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  email: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  trainingFrequency: string;
  trainingType: string;
  averageSleep: number;
  diet: string;
  alcohol: number;
  nicotine: string;
  libido: string;
  morningEnergy: string;
  recovery: string;
  mood: string;
}

interface TForecastFormProps {
  onResult: (result: any) => void;
}

const TForecastForm = ({ onResult }: TForecastFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();

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
    setShowEmailPopup(false);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    // Include the email from the popup
    const formDataWithEmail = {
      ...data,
      email: userEmail
    };
    
    try {
      const response = await fetch('https://xtracts4u.app.n8n.cloud/webhook-test/testo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataWithEmail),
      });

      if (!response.ok) {
        throw new Error('Failed to get forecast');
      }

      const result = await response.json();
      
      // Show thank you message instead of results
      onResult({
        type: 'thank-you',
        title: 'Благодарим! Вашата T-прогноза е в процес.',
        description: "Изпратихме вашия персонализиран доклад до вашия имейл адрес.\nМоже да отнеме 1–2 минути да пристигне — ако не го видите, моля проверете папките Промоции или Спам."
      });
      
      toast({
        title: "Анализът завърши",
        description: "Вашата T-прогноза беше генерирана успешно.",
      });
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Неуспешно генериране на прогнозата. Моля, опитайте отново.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formSections = [
    {
      title: "Лична информация",
      icon: <Activity className="h-5 w-5" />,
      fields: ["gender", "age", "height", "weight"]
    },
    {
      title: "Тренировки и дейност",
      icon: <Dumbbell className="h-5 w-5" />,
      fields: ["trainingFrequency", "trainingType"]
    },
    {
      title: "Фактори от начина на живот",
      icon: <Bed className="h-5 w-5" />,
      fields: ["averageSleep", "diet", "alcohol", "nicotine"]
    },
    {
      title: "Здравни показатели",
      icon: <Brain className="h-5 w-5" />,
      fields: ["libido", "morningEnergy", "recovery", "mood"]
    }
  ];

  return (
    <>
      {/* Email Popup */}
      <Dialog open={showEmailPopup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3">
              <DialogTitle className="text-center text-2xl font-bold">Добре дошли в T-Forecast</DialogTitle>
              <DialogDescription className="text-center text-base leading-relaxed px-4">
                Въведете вашия имейл адрес, за да започнете с вашия персонализиран анализ на тестостерона.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleEmailSubmit} className="space-y-6 mt-8">
            <div>
              <Label htmlFor="popup-email">Имейл адрес</Label>
              <Input
                id="popup-email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="mt-1"
                autoFocus
              />
              {emailError && (
                <p className="text-sm text-destructive mt-1">{emailError}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Продължете към анализа
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {formSections.map((section, index) => (
        <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {section.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>
                  Попълнете полетата по-долу за точен анализ
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Gender Field */}
              {section.fields.includes("gender") && (
                <div>
                  <Label htmlFor="gender">Пол</Label>
                  <Select onValueChange={(value) => setValue("gender", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Изберете пол" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Мъжки</SelectItem>
                      <SelectItem value="female">Женски</SelectItem>
                      <SelectItem value="other">Друг</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Age Field */}
              {section.fields.includes("age") && (
                <div>
                  <Label htmlFor="age">Възраст (години)</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register("age", { required: "Възрастта е задължителна", min: 18, max: 100 })}
                    className="mt-1"
                    placeholder="30"
                  />
                  {errors.age && (
                    <p className="text-sm text-destructive mt-1">{errors.age.message}</p>
                  )}
                </div>
              )}

              {/* Height Field */}
              {section.fields.includes("height") && (
                <div>
                  <Label htmlFor="height">Ръст (см)</Label>
                  <Input
                    id="height"
                    type="number"
                    {...register("height", { required: "Ръстът е задължителен", min: 100, max: 250 })}
                    className="mt-1"
                    placeholder="175"
                  />
                  {errors.height && (
                    <p className="text-sm text-destructive mt-1">{errors.height.message}</p>
                  )}
                </div>
              )}

              {/* Weight Field */}
              {section.fields.includes("weight") && (
                <div>
                  <Label htmlFor="weight">Тегло (кг)</Label>
                  <Input
                    id="weight"
                    type="number"
                    {...register("weight", { required: "Теглото е задължително", min: 30, max: 300 })}
                    className="mt-1"
                    placeholder="75"
                  />
                  {errors.weight && (
                    <p className="text-sm text-destructive mt-1">{errors.weight.message}</p>
                  )}
                </div>
              )}

              {/* Training Frequency Field */}
              {section.fields.includes("trainingFrequency") && (
                <div>
                  <Label htmlFor="trainingFrequency">Честота на тренировки</Label>
                  <Select onValueChange={(value) => setValue("trainingFrequency", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Изберете честота" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Никаква</SelectItem>
                      <SelectItem value="1-2">1-2 пъти/седмица</SelectItem>
                      <SelectItem value="3-4">3-4 пъти/седмица</SelectItem>
                      <SelectItem value="5-6">5-6 пъти/седмица</SelectItem>
                      <SelectItem value="6+">6+ пъти/седмица</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Training Type Field */}
              {section.fields.includes("trainingType") && (
                <div>
                  <Label htmlFor="trainingType">Тип тренировка</Label>
                  <Select onValueChange={(value) => setValue("trainingType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Изберете тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Никаква</SelectItem>
                      <SelectItem value="strength">Силови тренировки</SelectItem>
                      <SelectItem value="mix">Смесени тренировки</SelectItem>
                      <SelectItem value="endurance">Издръжливост</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Average Sleep Field */}
              {section.fields.includes("averageSleep") && (
                <div>
                  <Label htmlFor="averageSleep">Среден сън (часове)</Label>
                  <Input
                    id="averageSleep"
                    type="number"
                    step="0.5"
                    {...register("averageSleep", { required: "Часовете сън са задължителни", min: 3, max: 12 })}
                    className="mt-1"
                    placeholder="7.5"
                  />
                  {errors.averageSleep && (
                    <p className="text-sm text-destructive mt-1">{errors.averageSleep.message}</p>
                  )}
                </div>
              )}

              {/* Diet Field */}
              {section.fields.includes("diet") && (
                <div>
                  <Label htmlFor="diet">Тип диета</Label>
                  <Select onValueChange={(value) => setValue("diet", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Изберете тип диета" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Балансирана диета</SelectItem>
                      <SelectItem value="processed">Преработени храни</SelectItem>
                      <SelectItem value="custom">Опишете вашата диета</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Alcohol Field */}
              {section.fields.includes("alcohol") && (
                <div>
                  <Label htmlFor="alcohol">Алкохол (питиета/седмица)</Label>
                  <Input
                    id="alcohol"
                    type="number"
                    {...register("alcohol", { required: "Консумацията на алкохол е задължителна", min: 0, max: 50 })}
                    className="mt-1"
                    placeholder="3"
                  />
                  {errors.alcohol && (
                    <p className="text-sm text-destructive mt-1">{errors.alcohol.message}</p>
                  )}
                </div>
              )}

              {/* Nicotine Field */}
              {section.fields.includes("nicotine") && (
                <div>
                  <Label htmlFor="nicotine">Употреба на никотин</Label>
                  <Select onValueChange={(value) => setValue("nicotine", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Изберете употреба на никотин" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Никаква</SelectItem>
                      <SelectItem value="vape">Вейп</SelectItem>
                      <SelectItem value="cigarettes">Цигари</SelectItem>
                      <SelectItem value="iqos">IQOS</SelectItem>
                      <SelectItem value="all">Всички видове</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Libido Field */}
              {section.fields.includes("libido") && (
                <div>
                  <Label htmlFor="libido">Ниво на либидо</Label>
                  <Select onValueChange={(value) => setValue("libido", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Изберете ниво" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Ниско</SelectItem>
                      <SelectItem value="average">Средно</SelectItem>
                      <SelectItem value="high">Високо</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Morning Energy Field */}
              {section.fields.includes("morningEnergy") && (
                <div>
                  <Label htmlFor="morningEnergy">Сутрешна енергия</Label>
                  <Select onValueChange={(value) => setValue("morningEnergy", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Изберете ниво на енергия" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ниска/Никаква</SelectItem>
                      <SelectItem value="high">Висока</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Recovery Field */}
              {section.fields.includes("recovery") && (
                <div>
                  <Label htmlFor="recovery">Темп на възстановяване</Label>
                  <Select onValueChange={(value) => setValue("recovery", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Изберете темп на възстановяване" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Бавно</SelectItem>
                      <SelectItem value="average">Средно</SelectItem>
                      <SelectItem value="fast">Бързо</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Mood Field */}
              {section.fields.includes("mood") && (
                <div>
                  <Label htmlFor="mood">Общо настроение</Label>
                  <Select onValueChange={(value) => setValue("mood", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Изберете настроение" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bad">Лошо</SelectItem>
                      <SelectItem value="neutral">Неутрално</SelectItem>
                      <SelectItem value="good">Добро</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center pt-8">
        <Button 
          type="submit" 
          size="lg" 
          disabled={isLoading}
          className="w-full max-w-md bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Анализираме вашите данни...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Получете моята T-прогноза
            </>
          )}
        </Button>
      </div>
    </form>
    </>
  );
};

export default TForecastForm;