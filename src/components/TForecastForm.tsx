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
      setEmailError("Email is required");
      return;
    }
    
    if (!emailRegex.test(userEmail)) {
      setEmailError("Please enter a valid email address");
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
        title: 'Thank you! Your T-Forecast is on the way.',
        description: "We've sent your personalized report to your email address.\nIt may take 1–2 minutes to arrive — if you don't see it, please check your Promotions or Spam folders."
      });
      
      toast({
        title: "Analysis Complete",
        description: "Your T-Forecast has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate forecast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formSections = [
    {
      title: "Personal Information",
      icon: <Activity className="h-5 w-5" />,
      fields: ["gender", "age", "height", "weight"]
    },
    {
      title: "Training & Activity",
      icon: <Dumbbell className="h-5 w-5" />,
      fields: ["trainingFrequency", "trainingType"]
    },
    {
      title: "Lifestyle Factors",
      icon: <Bed className="h-5 w-5" />,
      fields: ["averageSleep", "diet", "alcohol", "nicotine"]
    },
    {
      title: "Health Indicators",
      icon: <Brain className="h-5 w-5" />,
      fields: ["libido", "morningEnergy", "recovery", "mood"]
    }
  ];

  return (
    <>
      {/* Email Popup */}
      <Dialog open={showEmailPopup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">Welcome to T-Forecast</DialogTitle>
            <DialogDescription className="text-center">
              Enter your email address to get started with your personalized testosterone analysis.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="popup-email">Email Address</Label>
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
              Continue to Assessment
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
                  Complete the fields below for accurate analysis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Gender Field */}
              {section.fields.includes("gender") && (
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setValue("gender", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Age Field */}
              {section.fields.includes("age") && (
                <div>
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register("age", { required: "Age is required", min: 18, max: 100 })}
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
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    {...register("height", { required: "Height is required", min: 100, max: 250 })}
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
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    {...register("weight", { required: "Weight is required", min: 30, max: 300 })}
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
                  <Label htmlFor="trainingFrequency">Training Frequency</Label>
                  <Select onValueChange={(value) => setValue("trainingFrequency", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="1-2">1-2 times/week</SelectItem>
                      <SelectItem value="3-4">3-4 times/week</SelectItem>
                      <SelectItem value="5-6">5-6 times/week</SelectItem>
                      <SelectItem value="6+">6+ times/week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Training Type Field */}
              {section.fields.includes("trainingType") && (
                <div>
                  <Label htmlFor="trainingType">Training Type</Label>
                  <Select onValueChange={(value) => setValue("trainingType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="strength">Strength Training</SelectItem>
                      <SelectItem value="mix">Mixed Training</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Average Sleep Field */}
              {section.fields.includes("averageSleep") && (
                <div>
                  <Label htmlFor="averageSleep">Average Sleep (hours)</Label>
                  <Input
                    id="averageSleep"
                    type="number"
                    step="0.5"
                    {...register("averageSleep", { required: "Sleep hours required", min: 3, max: 12 })}
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
                  <Label htmlFor="diet">Diet Type</Label>
                  <Select onValueChange={(value) => setValue("diet", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select diet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced Diet</SelectItem>
                      <SelectItem value="processed">Processed Foods</SelectItem>
                      <SelectItem value="custom">Describe Your Diet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Alcohol Field */}
              {section.fields.includes("alcohol") && (
                <div>
                  <Label htmlFor="alcohol">Alcohol (drinks/week)</Label>
                  <Input
                    id="alcohol"
                    type="number"
                    {...register("alcohol", { required: "Alcohol intake required", min: 0, max: 50 })}
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
                  <Label htmlFor="nicotine">Nicotine Use</Label>
                  <Select onValueChange={(value) => setValue("nicotine", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select nicotine use" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="vape">Vape</SelectItem>
                      <SelectItem value="cigarettes">Cigarettes</SelectItem>
                      <SelectItem value="iqos">IQOS</SelectItem>
                      <SelectItem value="all">All Types</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Libido Field */}
              {section.fields.includes("libido") && (
                <div>
                  <Label htmlFor="libido">Libido Level</Label>
                  <Select onValueChange={(value) => setValue("libido", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Morning Energy Field */}
              {section.fields.includes("morningEnergy") && (
                <div>
                  <Label htmlFor="morningEnergy">Morning Energy</Label>
                  <Select onValueChange={(value) => setValue("morningEnergy", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select energy level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Low/None</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Recovery Field */}
              {section.fields.includes("recovery") && (
                <div>
                  <Label htmlFor="recovery">Recovery Rate</Label>
                  <Select onValueChange={(value) => setValue("recovery", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select recovery rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Mood Field */}
              {section.fields.includes("mood") && (
                <div>
                  <Label htmlFor="mood">Overall Mood</Label>
                  <Select onValueChange={(value) => setValue("mood", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bad">Poor</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
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
              Analyzing Your Data...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Get My T-Forecast
            </>
          )}
        </Button>
      </div>
    </form>
    </>
  );
};

export default TForecastForm;