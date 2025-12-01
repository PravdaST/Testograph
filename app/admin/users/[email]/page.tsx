"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  MessageSquare,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  MousePointer,
  Eye,
  ShoppingCart,
  DollarSign,
  Package,
  Utensils,
  Moon,
  FlaskConical,
  Dumbbell,
  Activity,
  Target,
  Flame,
  Trophy,
  Scale,
  Bot,
  Camera,
  Ruler,
  Pill,
  ClipboardList,
  UserCheck,
  AlertCircle,
  Mail,
  BarChart3,
  History,
  Zap,
  Link,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
  ZoomIn,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "chat_session" | "funnel_session" | "funnel_event" | "purchase";
  timestamp: string;
  data: any;
}

interface UserStats {
  totalChatSessions: number;
  totalFunnelAttempts: number;
  completedFunnels: number;
  totalEvents: number;
  firstName: string | null;
  totalPurchases: number;
  totalSpent: number;
  activeApps: string[];
}

interface Purchase {
  id: string;
  productName: string;
  productType: string;
  amount: number;
  currency: string;
  status: string;
  appsIncluded: string[];
  purchasedAt: string;
}

interface FunnelQuizAnswers {
  // Personal Info
  firstName: string | null;
  age: string | null;
  height: string | null;
  weight: string | null;
  bodyFat: string | null;
  profession: string | null;
  // Lifestyle
  sleep: string | null;
  alcohol: string | null;
  nicotine: string | null;
  diet: string | null;
  dietaryPreference: string | null;
  stress: number | null;
  workStress: string | null;
  // Training
  trainingFrequency: string | null;
  trainingType: string | null;
  recovery: string | null;
  supplements: string | null;
  // Symptoms
  libido: number | null;
  morningErection: string | null;
  morningEnergy: number | null;
  concentration: number | null;
  mood: string | null;
  muscleMass: string | null;
  edProblem: string | null;
  sexFrequency: string | null;
  // Motivation & Goals
  frustration: string | null;
  oneChange: string | null;
  pastAttempts: string | null;
  decisionCriteria: string | null;
  vision: string | null;
  // Results
  score: number | null;
  testosteroneLevel: number | null;
  testosteroneCategory: string | null;
  testosteroneEstimate: string | null;
  riskLevel: string | null;
  urgencyLevel: string | null;
  recommendedTier: string | null;
  percentile: number | null;
  confidenceIndex: number | null;
  categoryScores: any | null;
  topIssues: string[] | null;
  // Timeline
  timelineDay14: number | null;
  timelineDay30: number | null;
  timelineDay60: number | null;
  timelineDay90: number | null;
  // Metadata
  completedAt: string | null;
  source: string | null;
}

interface AppDataStats {
  quiz: {
    totalQuizzes: number;
    latestQuiz: {
      category: string;
      score: number;
      level: string;
      workoutLocation: string;
      programStartDate: string | null;
      programEndDate: string | null;
      completedAt: string;
      breakdownSymptoms?: number;
      breakdownNutrition?: number;
      breakdownTraining?: number;
      breakdownSleepRecovery?: number;
      breakdownContext?: number;
      breakdownOverall?: number;
    } | null;
    allQuizzes: Array<{
      category: string;
      score: number;
      level: string;
      completedAt: string;
    }>;
    funnelQuizAnswers: FunnelQuizAnswers | null;
  };
  appRegistration: {
    isRegistered: boolean;
    registeredAt: string | null;
    hasActiveSubscription: boolean;
    subscriptionExpiresAt: string | null;
    currentDay: number | null;
    dietaryPreference: string | null;
    category: string | null;
    currentLevel: string | null;
  };
  workouts: {
    total: number;
    recentSessions: Array<{
      date: string;
      duration: number;
      completed: boolean;
      workoutType: string;
    }>;
    lastWorkout: string | null;
  };
  meals: {
    total: number;
    recentCompletions: Array<{
      date: string;
      mealType: string;
      completed: boolean;
    }>;
    lastMeal: string | null;
  };
  sleep: {
    total: number;
    averageQuality: number | null;
    recentLogs: Array<{
      date: string;
      hours: number;
      quality: number;
      bedtime: string;
      wakeTime: string;
    }>;
    lastLog: string | null;
  };
  testoUp: {
    totalDaysTracked: number;
    complianceRate: number;
    inventory: {
      capsulesRemaining: number;
      totalCapsules: number;
      bottlesPurchased: number;
      lastPurchase: string | null;
    } | null;
    recentTracking: Array<{
      date: string;
      morningTaken: boolean;
      eveningTaken: boolean;
    }>;
  };
  coach: {
    totalMessages: number;
    allMessages: Array<{
      role: string;
      content: string;
      createdAt: string;
    }>;
    lastMessage: string | null;
  };
  measurements: {
    total: number;
    recentMeasurements: Array<{
      date: string;
      weight: number;
      bodyFat: number;
      chest: number;
      waist: number;
      arms: number;
    }>;
    lastMeasurement: string | null;
  };
  photos: {
    total: number;
    allPhotos: Array<{
      id: string;
      date: string;
      photoUrl: string;
      weight: number | null;
      bodyFatPct: number | null;
      notes: string | null;
      createdAt: string;
    }>;
  };
  feedback: {
    total: number;
    submissions: Array<{
      type: string;
      message: string;
      createdAt: string;
    }>;
  };
  // New comprehensive data
  funnel?: {
    totalSessions: number;
    sessions: Array<{
      sessionId: string;
      currentStep: number;
      maxStepReached: number;
      completed: boolean;
      offerTier: string | null;
      exitStep: number | null;
      userData: any;
      utmData: any;
      userAgent: string;
      entryTime: string;
      lastActivity: string;
      createdAt: string;
    }>;
    events: Array<{
      sessionId: string;
      stepNumber: number;
      eventType: string;
      metadata: any;
      timestamp: string;
    }>;
  };
  chatHistory?: {
    totalSessions: number;
    sessions: Array<{
      id: string;
      pdfFilename: string | null;
      pdfUrl: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
    messages: Array<{
      sessionId: string;
      role: string;
      content: string;
      createdAt: string;
    }>;
  };
  shopifyOrders?: {
    total: number;
    orders: Array<{
      shopifyOrderId: string;
      orderNumber: string;
      customerName: string;
      customerPhone: string;
      productName: string;
      productVariant: string;
      quantity: number;
      totalPrice: number;
      currency: string;
      financialStatus: string;
      fulfillmentStatus: string;
      orderStatus: string;
      isPaid: boolean;
      paymentConfirmedAt: string | null;
      createdAt: string;
    }>;
  };
  activation?: {
    hasActivation: boolean;
    data: {
      status: string;
      quizCompletedAt: string | null;
      purchaseCompletedAt: string | null;
      accountCreatedAt: string | null;
      accessGrantedAt: string | null;
      assignedCategory: string | null;
      assignedLevel: string | null;
      activationAttempts: number;
      lastError: string | null;
    } | null;
  };
  quizLeads?: {
    total: number;
    leads: Array<{
      category: string;
      isCompleted: boolean;
      quizScore: number;
      assignedLevel: string;
      answers: any;
      utmSource: string | null;
      utmMedium: string | null;
      utmCampaign: string | null;
      referrer: string | null;
      landingPage: string | null;
      startedAt: string;
      completedAt: string | null;
    }>;
  };
  progressScores?: {
    total: number;
    scores: Array<{
      date: string;
      score: number;
      compliancePercentage: number;
      completedTasks: number;
      totalTasks: number;
    }>;
  };
  scoreHistory?: {
    total: number;
    history: Array<{
      totalScore: number;
      sleepScore: number;
      lifestyleScore: number;
      categoryScore: number;
      dayNumber: number;
      source: string;
      notes: string | null;
      recordedAt: string;
    }>;
  };
  emailLogs?: {
    total: number;
    logs: Array<{
      subject: string;
      templateName: string | null;
      status: string;
      sentAt: string | null;
      openedAt: string | null;
      clickedAt: string | null;
      errorMessage: string | null;
      isBulk: boolean;
      createdAt: string;
    }>;
  };
  userProgress?: {
    total: number;
    entries: Array<{
      date: string;
      dayNumber: number;
      nutritionCompleted: boolean;
      sleepCompleted: boolean;
      supplementsCompleted: boolean;
      exerciseCompleted: boolean;
      mealsLogged: number;
      sleepHours: number;
      sleepQuality: number;
      supplementsTaken: number;
      exercisesCompleted: number;
      notes: string | null;
    }>;
  };
  checkins?: {
    total: number;
    entries: Array<{
      dayNumber: number;
      feeling: string;
      energyLevel: number;
      moodLevel: number;
      checkInDate: string;
    }>;
  };
  appQuizResults?: {
    total: number;
    results: Array<{
      category: string;
      score: number;
      level: string;
      answers: any;
      takenAt: string;
    }>;
  };
  dailyCompletion?: {
    total: number;
    entries: Array<{
      date: string;
      nutritionCompleted: boolean;
      workoutCompleted: boolean;
      sleepCompleted: boolean;
      supplementCompleted: boolean;
      completionPercentage: number;
    }>;
  };
}

interface ProDataStats {
  protocolActive: boolean;
  protocolStartDate: string | null;
  daysOnProtocol: number;
  dailyEntries: {
    totalEntries: number;
    latestEntries: any[];
    complianceRate: number;
    averageFeeling: number | null;
    averageEnergy: number | null;
    averageCompliance: number | null;
    currentStreak: number;
    longestStreak: number;
    missedDays: number;
  };
  weeklyMeasurements: {
    totalMeasurements: number;
    latestMeasurements: any[];
    weightChange: number | null;
    startWeight: number | null;
    currentWeight: number | null;
  };
}

interface UserProfileData {
  email: string;
  stats: UserStats;
  timeline: TimelineEvent[];
  purchases: Purchase[];
  appData?: AppDataStats;
  proData?: ProDataStats;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const email = decodeURIComponent(params?.email as string);

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    id: string;
    date: string;
    photoUrl: string;
    weight: number | null;
    bodyFatPct: number | null;
    notes: string | null;
    createdAt: string;
  } | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  useEffect(() => {
    if (email) {
      fetchUserProfile();
    }
  }, [email]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      // Fetch base profile data
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(email)}`,
      );
      const data: UserProfileData = await response.json();

      if (response.ok) {
        // Fetch app data
        try {
          const appResponse = await fetch(
            `/api/admin/app-data/${encodeURIComponent(email)}`,
          );
          if (appResponse.ok) {
            const appData = await appResponse.json();
            data.appData = appData.stats;
          }
        } catch (err) {
          console.error("Error fetching app data:", err);
        }

        // Fetch PRO data
        try {
          const proResponse = await fetch(
            `/api/admin/pro-data/${encodeURIComponent(email)}`,
          );
          if (proResponse.ok) {
            const proData = await proResponse.json();
            data.proData = proData.stats;
          }
        } catch (err) {
          console.error("Error fetching PRO data:", err);
        }

        setProfileData(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази снимка? Това действие не може да бъде отменено.')) {
      return;
    }

    setIsDeletingPhoto(true);
    try {
      const response = await fetch(`/api/admin/progress-photo/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state to remove the deleted photo
        if (profileData?.appData?.photos) {
          setProfileData({
            ...profileData,
            appData: {
              ...profileData.appData,
              photos: {
                ...profileData.appData.photos,
                total: profileData.appData.photos.total - 1,
                allPhotos: profileData.appData.photos.allPhotos.filter(p => p.id !== photoId),
              },
            },
          });
        }
        setSelectedPhoto(null);
      } else {
        const error = await response.json();
        alert(`Грешка при изтриване: ${error.error || 'Неизвестна грешка'}`);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Възникна грешка при изтриване на снимката');
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("bg-BG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("bg-BG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventIcon = (type: string, eventType?: string) => {
    if (type === "chat_session") return <MessageSquare className="h-4 w-4" />;
    if (type === "funnel_session") return <TrendingUp className="h-4 w-4" />;
    if (type === "purchase") return <ShoppingCart className="h-4 w-4" />;
    if (eventType === "offer_viewed") return <Eye className="h-4 w-4" />;
    if (eventType === "button_clicked")
      return <MousePointer className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getEventTitle = (event: TimelineEvent) => {
    if (event.type === "chat_session") {
      return "Нова Chat Сесия";
    }
    if (event.type === "funnel_session") {
      return event.data.completed ? "Завършен Funnel" : "Започнат Funnel";
    }
    if (event.type === "purchase") {
      return `Покупка: ${event.data.productName || "Неизвестен продукт"}`;
    }
    if (event.type === "funnel_event") {
      const eventType = event.data.event_type;
      if (eventType === "offer_viewed") {
        return `Видял ${event.data.metadata?.offerTier || ""} оферта`;
      }
      if (eventType === "button_clicked") {
        return `Кликнал: ${event.data.metadata?.buttonText || "бутон"}`;
      }
      if (eventType === "exit_intent") {
        return "Exit Intent Detection";
      }
    }
    return "Събитие";
  };

  const getEventDescription = (event: TimelineEvent) => {
    if (event.type === "chat_session") {
      return event.data.pdf_filename
        ? `PDF: ${event.data.pdf_filename}`
        : "Без PDF файл";
    }
    if (event.type === "funnel_session") {
      return `Offer: ${event.data.offer_tier || "Няма"} | Step ${event.data.exit_step || "N/A"}`;
    }
    if (event.type === "purchase") {
      const apps = event.data.appsIncluded || [];
      return `${event.data.amount || 0} ${event.data.currency || "BGN"} | ${apps.length} apps`;
    }
    if (event.type === "funnel_event") {
      return `Step ${event.data.step_number}`;
    }
    return "";
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!profileData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Потребителят не е намерен</p>
          <Button className="mt-4" onClick={() => router.push("/admin/users")}>
            Обратно към потребителите
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold">
              Потребителски Профил
            </h1>
            <p className="text-muted-foreground mt-1">{email}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat Сесии
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {profileData.stats.totalChatSessions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Funnel Опити
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {profileData.stats.totalFunnelAttempts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Завършени
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {profileData.stats.completedFunnels}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Покупки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {profileData.stats.totalPurchases}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Общо Платено
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {profileData.stats.totalSpent} лв
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Apps */}
        {profileData.stats.activeApps &&
          profileData.stats.activeApps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Активни Услуги
                </CardTitle>
                <CardDescription>
                  Apps до които потребителят има достъп
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileData.stats.activeApps.map((app) => (
                    <Badge key={app} variant="default" className="text-sm">
                      {app}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Purchases History */}
        {profileData.purchases && profileData.purchases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                История на Покупките
              </CardTitle>
              <CardDescription>
                Всички покупки направени от потребителя
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileData.purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{purchase.productName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {purchase.productType}
                        </Badge>
                        <Badge
                          variant={
                            purchase.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            purchase.status === "completed"
                              ? "bg-green-600"
                              : ""
                          }
                        >
                          {purchase.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(purchase.purchasedAt)}
                      </p>
                      {purchase.appsIncluded &&
                        purchase.appsIncluded.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {purchase.appsIncluded.map((app) => (
                              <Badge
                                key={app}
                                variant="secondary"
                                className="text-xs"
                              >
                                {app}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-green-600">
                        {purchase.amount} {purchase.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Testograph-v2 App Data */}
        {profileData.appData && (
          <>
            {/* Quiz Results & App Registration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Quiz Results */}
              {profileData.appData.quiz && profileData.appData.quiz.latestQuiz && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-blue-600" />
                      Quiz Резултати
                    </CardTitle>
                    <CardDescription>Попълнени quiz-ове от потребителя</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Категория</p>
                        <Badge variant="outline" className="mt-1">
                          {profileData.appData.quiz.latestQuiz.category}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="text-xl font-bold">{profileData.appData.quiz.latestQuiz.score}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ниво</p>
                        <Badge variant="secondary" className="mt-1">
                          {profileData.appData.quiz.latestQuiz.level}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Локация</p>
                        <p className="text-sm font-medium">{profileData.appData.quiz.latestQuiz.workoutLocation || 'N/A'}</p>
                      </div>
                    </div>
                    {profileData.appData.quiz.allQuizzes.length > 1 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Всички quiz-ове ({profileData.appData.quiz.totalQuizzes}):</p>
                        <div className="flex flex-wrap gap-1">
                          {profileData.appData.quiz.allQuizzes.map((q, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {q.category}: {q.score}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Funnel Quiz Answers - Detailed View */}
              {profileData.appData.quiz?.funnelQuizAnswers && (
                <Card className="col-span-2 border-l-4 border-l-purple-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Quiz Отговори (Подробно)
                    </CardTitle>
                    <CardDescription>Всички отговори дадени от потребителя при попълване на quiz-a</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Personal Info */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Лична информация
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {profileData.appData.quiz.funnelQuizAnswers.firstName && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Име</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.firstName}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.age && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Възраст</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.age}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.height && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Височина</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.height}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.weight && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Тегло</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.weight}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.bodyFat && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Телесни мазнини</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.bodyFat}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.profession && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Професия</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.profession}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lifestyle */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Начин на живот
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {profileData.appData.quiz.funnelQuizAnswers.sleep && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Сън</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.sleep}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.alcohol && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Алкохол</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.alcohol}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.nicotine && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Никотин</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.nicotine}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.diet && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Диета</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.diet}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.stress !== null && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Стрес</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.stress}/10</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.workStress && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Работен стрес</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.workStress}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Training */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Dumbbell className="h-4 w-4" />
                        Тренировки
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {profileData.appData.quiz.funnelQuizAnswers.trainingFrequency && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Честота</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.trainingFrequency}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.trainingType && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Тип тренировка</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.trainingType}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.recovery && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Възстановяване</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.recovery}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.supplements && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Добавки</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.supplements}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Симптоми
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {profileData.appData.quiz.funnelQuizAnswers.libido !== null && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Либидо</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.libido}/10</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.morningErection && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Сутрешна ерекция</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.morningErection}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.morningEnergy !== null && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Сутрешна енергия</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.morningEnergy}/10</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.concentration !== null && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Концентрация</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.concentration}/10</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.mood && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Настроение</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.mood}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.muscleMass && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Мускулна маса</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.muscleMass}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.edProblem && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">ЕД проблем</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.edProblem}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.sexFrequency && (
                          <div className="p-2 bg-accent rounded">
                            <p className="text-xs text-muted-foreground">Честота на секс</p>
                            <p className="text-sm font-medium">{profileData.appData.quiz.funnelQuizAnswers.sexFrequency}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Motivation & Goals */}
                    {(profileData.appData.quiz.funnelQuizAnswers.frustration ||
                      profileData.appData.quiz.funnelQuizAnswers.oneChange ||
                      profileData.appData.quiz.funnelQuizAnswers.vision) && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Мотивация и цели
                        </h4>
                        <div className="space-y-2">
                          {profileData.appData.quiz.funnelQuizAnswers.frustration && (
                            <div className="p-2 bg-accent rounded">
                              <p className="text-xs text-muted-foreground">Фрустрация</p>
                              <p className="text-sm">{profileData.appData.quiz.funnelQuizAnswers.frustration}</p>
                            </div>
                          )}
                          {profileData.appData.quiz.funnelQuizAnswers.oneChange && (
                            <div className="p-2 bg-accent rounded">
                              <p className="text-xs text-muted-foreground">Една промяна</p>
                              <p className="text-sm">{profileData.appData.quiz.funnelQuizAnswers.oneChange}</p>
                            </div>
                          )}
                          {profileData.appData.quiz.funnelQuizAnswers.pastAttempts && (
                            <div className="p-2 bg-accent rounded">
                              <p className="text-xs text-muted-foreground">Минали опити</p>
                              <p className="text-sm">{profileData.appData.quiz.funnelQuizAnswers.pastAttempts}</p>
                            </div>
                          )}
                          {profileData.appData.quiz.funnelQuizAnswers.decisionCriteria && (
                            <div className="p-2 bg-accent rounded">
                              <p className="text-xs text-muted-foreground">Критерии за решение</p>
                              <p className="text-sm">{profileData.appData.quiz.funnelQuizAnswers.decisionCriteria}</p>
                            </div>
                          )}
                          {profileData.appData.quiz.funnelQuizAnswers.vision && (
                            <div className="p-2 bg-accent rounded">
                              <p className="text-xs text-muted-foreground">Визия</p>
                              <p className="text-sm">{profileData.appData.quiz.funnelQuizAnswers.vision}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quiz Results Summary */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Резултати от Quiz
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {profileData.appData.quiz.funnelQuizAnswers.score !== null && (
                          <div className="p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className="text-lg font-bold text-blue-600">{profileData.appData.quiz.funnelQuizAnswers.score}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.testosteroneEstimate && (
                          <div className="p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs text-muted-foreground">Тестостерон (оценка)</p>
                            <p className="text-sm font-bold text-green-600">{profileData.appData.quiz.funnelQuizAnswers.testosteroneEstimate}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.riskLevel && (
                          <div className={`p-2 rounded border ${
                            profileData.appData.quiz.funnelQuizAnswers.riskLevel === 'висок' ? 'bg-red-50 border-red-200' :
                            profileData.appData.quiz.funnelQuizAnswers.riskLevel === 'среден' ? 'bg-amber-50 border-amber-200' :
                            'bg-green-50 border-green-200'
                          }`}>
                            <p className="text-xs text-muted-foreground">Риск</p>
                            <p className={`text-sm font-bold ${
                              profileData.appData.quiz.funnelQuizAnswers.riskLevel === 'висок' ? 'text-red-600' :
                              profileData.appData.quiz.funnelQuizAnswers.riskLevel === 'среден' ? 'text-amber-600' :
                              'text-green-600'
                            }`}>{profileData.appData.quiz.funnelQuizAnswers.riskLevel}</p>
                          </div>
                        )}
                        {profileData.appData.quiz.funnelQuizAnswers.percentile !== null && (
                          <div className="p-2 bg-purple-50 rounded border border-purple-200">
                            <p className="text-xs text-muted-foreground">Percentile</p>
                            <p className="text-lg font-bold text-purple-600">{profileData.appData.quiz.funnelQuizAnswers.percentile}%</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Predictions */}
                    {(profileData.appData.quiz.funnelQuizAnswers.timelineDay14 ||
                      profileData.appData.quiz.funnelQuizAnswers.timelineDay30 ||
                      profileData.appData.quiz.funnelQuizAnswers.timelineDay60 ||
                      profileData.appData.quiz.funnelQuizAnswers.timelineDay90) && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Прогноза за подобрение
                        </h4>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="p-2 bg-accent rounded text-center">
                            <p className="text-xs text-muted-foreground">Ден 14</p>
                            <p className="text-lg font-bold">{profileData.appData.quiz.funnelQuizAnswers.timelineDay14 || '-'}</p>
                          </div>
                          <div className="p-2 bg-accent rounded text-center">
                            <p className="text-xs text-muted-foreground">Ден 30</p>
                            <p className="text-lg font-bold">{profileData.appData.quiz.funnelQuizAnswers.timelineDay30 || '-'}</p>
                          </div>
                          <div className="p-2 bg-accent rounded text-center">
                            <p className="text-xs text-muted-foreground">Ден 60</p>
                            <p className="text-lg font-bold">{profileData.appData.quiz.funnelQuizAnswers.timelineDay60 || '-'}</p>
                          </div>
                          <div className="p-2 bg-accent rounded text-center">
                            <p className="text-xs text-muted-foreground">Ден 90</p>
                            <p className="text-lg font-bold">{profileData.appData.quiz.funnelQuizAnswers.timelineDay90 || '-'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top Issues */}
                    {profileData.appData.quiz.funnelQuizAnswers.topIssues &&
                     profileData.appData.quiz.funnelQuizAnswers.topIssues.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Основни проблеми
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {profileData.appData.quiz.funnelQuizAnswers.topIssues.map((issue, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* App Registration Status */}
              <Card className={`border-l-4 ${profileData.appData.appRegistration?.isRegistered ? 'border-l-green-500' : 'border-l-amber-500'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    App Регистрация
                  </CardTitle>
                  <CardDescription>Статус в app.testograph.eu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileData.appData.appRegistration?.isRegistered ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Регистриран</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Регистриран на</p>
                          <p className="font-medium">
                            {profileData.appData.appRegistration.registeredAt
                              ? new Date(profileData.appData.appRegistration.registeredAt).toLocaleDateString('bg-BG')
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Абонамент</p>
                          <Badge className={profileData.appData.appRegistration.hasActiveSubscription ? 'bg-green-600' : 'bg-gray-500'}>
                            {profileData.appData.appRegistration.hasActiveSubscription ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Текущ ден</p>
                          <p className="font-medium">{profileData.appData.appRegistration.currentDay || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Диета</p>
                          <p className="font-medium">{profileData.appData.appRegistration.dietaryPreference || 'N/A'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <span className="text-sm text-amber-800">Не е регистриран в приложението</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Dumbbell className="h-4 w-4" />
                    <span>Тренировки</span>
                  </div>
                  <p className="text-xl font-bold">{profileData.appData.workouts?.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profileData.appData.workouts?.lastWorkout
                      ? `Последна: ${new Date(profileData.appData.workouts.lastWorkout).toLocaleDateString('bg-BG')}`
                      : 'Няма записи'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Utensils className="h-4 w-4" />
                    <span>Хранения</span>
                  </div>
                  <p className="text-xl font-bold">{profileData.appData.meals?.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profileData.appData.meals?.lastMeal
                      ? `Последно: ${new Date(profileData.appData.meals.lastMeal).toLocaleDateString('bg-BG')}`
                      : 'Няма записи'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Moon className="h-4 w-4" />
                    <span>Сън</span>
                  </div>
                  <p className="text-xl font-bold">{profileData.appData.sleep?.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Качество: {profileData.appData.sleep?.averageQuality?.toFixed(1) || 'N/A'}/10
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Bot className="h-4 w-4" />
                    <span>AI Coach</span>
                  </div>
                  <p className="text-xl font-bold">{profileData.appData.coach?.totalMessages || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">съобщения</p>
                </CardContent>
              </Card>
            </div>

            {/* TestoUP Tracking */}
            {(profileData.appData.testoUp?.totalDaysTracked > 0 || profileData.appData.testoUp?.inventory) && (
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-orange-600" />
                    TestoUP Tracking
                  </CardTitle>
                  <CardDescription>Прием и инвентар на капсули</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Compliance */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Compliance</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Дни трекирани</p>
                          <p className="text-xl font-bold">{profileData.appData.testoUp?.totalDaysTracked || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Compliance Rate</p>
                          <p className="text-xl font-bold text-green-600">{profileData.appData.testoUp?.complianceRate || 0}%</p>
                        </div>
                      </div>
                      {profileData.appData.testoUp?.recentTracking && profileData.appData.testoUp.recentTracking.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Последни 7 дни:</p>
                          <div className="flex gap-1">
                            {profileData.appData.testoUp.recentTracking.slice(0, 7).map((t, i) => (
                              <div key={i} className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  t.morningTaken && t.eveningTaken ? 'bg-green-100 text-green-600' :
                                  t.morningTaken || t.eveningTaken ? 'bg-amber-100 text-amber-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {t.morningTaken && t.eveningTaken ? '2' : t.morningTaken || t.eveningTaken ? '1' : '0'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Inventory */}
                    {profileData.appData.testoUp?.inventory && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Инвентар</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Оставащи капсули</p>
                            <p className={`text-xl font-bold ${
                              profileData.appData.testoUp.inventory.capsulesRemaining <= 10 ? 'text-amber-600' :
                              profileData.appData.testoUp.inventory.capsulesRemaining === 0 ? 'text-red-600' :
                              'text-green-600'
                            }`}>
                              {profileData.appData.testoUp.inventory.capsulesRemaining}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Бутилки купени</p>
                            <p className="text-xl font-bold">{profileData.appData.testoUp.inventory.bottlesPurchased}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Body Measurements & Photos */}
            {(profileData.appData.measurements?.total > 0 || profileData.appData.photos?.total > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Body Measurements */}
                {profileData.appData.measurements?.total > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ruler className="h-5 w-5" />
                        Телесни Измервания
                      </CardTitle>
                      <CardDescription>{profileData.appData.measurements.total} записа</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {profileData.appData.measurements.recentMeasurements.length > 0 && (
                        <div className="space-y-2">
                          {profileData.appData.measurements.recentMeasurements.slice(0, 3).map((m, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-2 bg-accent rounded">
                              <span>{new Date(m.date).toLocaleDateString('bg-BG')}</span>
                              <div className="flex gap-2">
                                {m.weight && <Badge variant="outline">{m.weight}kg</Badge>}
                                {m.bodyFat && <Badge variant="outline">{m.bodyFat}% fat</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Progress Photos - Full Gallery */}
                {profileData.appData.photos?.total > 0 && (
                  <Card className="border-l-4 border-l-pink-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-pink-600" />
                        Снимки за Прогрес
                      </CardTitle>
                      <CardDescription>{profileData.appData.photos.total} снимки (кликни за детайли)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {profileData.appData.photos.allPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="border rounded-lg overflow-hidden bg-accent/30 cursor-pointer group hover:ring-2 hover:ring-pink-500 transition-all"
                            onClick={() => setSelectedPhoto(photo)}
                          >
                            <div className="relative">
                              <img
                                src={photo.photoUrl}
                                alt={`Progress photo from ${photo.date}`}
                                className="w-full aspect-square object-cover group-hover:opacity-80 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                <ZoomIn className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <div className="p-2 space-y-1">
                              <p className="text-xs font-medium">
                                {new Date(photo.date).toLocaleDateString('bg-BG')}
                              </p>
                              {(photo.weight || photo.bodyFatPct) && (
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  {photo.weight && <span>{photo.weight}kg</span>}
                                  {photo.bodyFatPct && <span>{photo.bodyFatPct}% BF</span>}
                                </div>
                              )}
                              {photo.notes && (
                                <p className="text-xs text-muted-foreground italic truncate" title={photo.notes}>
                                  {photo.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Shopify Orders */}
            {profileData.appData.shopifyOrders && profileData.appData.shopifyOrders.total > 0 && (
              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                    Shopify Поръчки
                  </CardTitle>
                  <CardDescription>{profileData.appData.shopifyOrders.total} поръчки</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.appData.shopifyOrders.orders.map((order, i) => (
                      <div key={i} className="p-3 bg-accent rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{order.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              Поръчка #{order.orderNumber}
                            </p>
                          </div>
                          <Badge className={order.isPaid ? 'bg-green-600' : 'bg-amber-600'}>
                            {order.isPaid ? 'Платена' : order.financialStatus}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Сума: </span>
                            <span className="font-medium">{order.totalPrice} {order.currency}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Количество: </span>
                            <span className="font-medium">{order.quantity}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Статус: </span>
                            <span className="font-medium">{order.orderStatus}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Дата: </span>
                            <span className="font-medium">{new Date(order.createdAt).toLocaleDateString('bg-BG')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Activation Status */}
            {profileData.appData.activation?.hasActivation && profileData.appData.activation.data && (
              <Card className="border-l-4 border-l-cyan-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-cyan-600" />
                    Статус на Активация
                  </CardTitle>
                  <CardDescription>Процес на активиране на достъп</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-2 bg-accent rounded">
                      <p className="text-xs text-muted-foreground">Статус</p>
                      <Badge className={
                        profileData.appData.activation.data.status === 'activated' ? 'bg-green-600' :
                        profileData.appData.activation.data.status === 'matched' ? 'bg-blue-600' :
                        profileData.appData.activation.data.status === 'failed' ? 'bg-red-600' :
                        'bg-amber-600'
                      }>
                        {profileData.appData.activation.data.status}
                      </Badge>
                    </div>
                    <div className="p-2 bg-accent rounded">
                      <p className="text-xs text-muted-foreground">Категория</p>
                      <p className="text-sm font-medium">{profileData.appData.activation.data.assignedCategory || 'N/A'}</p>
                    </div>
                    <div className="p-2 bg-accent rounded">
                      <p className="text-xs text-muted-foreground">Ниво</p>
                      <p className="text-sm font-medium">{profileData.appData.activation.data.assignedLevel || 'N/A'}</p>
                    </div>
                    <div className="p-2 bg-accent rounded">
                      <p className="text-xs text-muted-foreground">Опити</p>
                      <p className="text-sm font-medium">{profileData.appData.activation.data.activationAttempts}</p>
                    </div>
                  </div>
                  {profileData.appData.activation.data.lastError && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      <strong>Грешка:</strong> {profileData.appData.activation.data.lastError}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Funnel Sessions */}
            {profileData.appData.funnel && profileData.appData.funnel.totalSessions > 0 && (
              <Card className="border-l-4 border-l-violet-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-violet-600" />
                    Funnel Сесии
                  </CardTitle>
                  <CardDescription>{profileData.appData.funnel.totalSessions} сесии, {profileData.appData.funnel.events.length} събития</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.appData.funnel.sessions.slice(0, 5).map((session, i) => (
                      <div key={i} className="p-3 bg-accent rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={session.completed ? 'default' : 'secondary'} className={session.completed ? 'bg-green-600' : ''}>
                              {session.completed ? 'Завършен' : `Стъпка ${session.currentStep || session.maxStepReached}`}
                            </Badge>
                            {session.offerTier && (
                              <Badge variant="outline">{session.offerTier}</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleDateString('bg-BG')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Макс. стъпка: </span>
                            <span className="font-medium">{session.maxStepReached || 'N/A'}</span>
                          </div>
                          {session.exitStep && (
                            <div>
                              <span className="text-muted-foreground">Излязъл на: </span>
                              <span className="font-medium">Стъпка {session.exitStep}</span>
                            </div>
                          )}
                        </div>
                        {session.utmData && Object.keys(session.utmData).length > 0 && (
                          <div className="mt-2 pt-2 border-t text-xs">
                            <span className="text-muted-foreground">UTM: </span>
                            {session.utmData.source && <Badge variant="outline" className="text-xs mr-1">{session.utmData.source}</Badge>}
                            {session.utmData.medium && <Badge variant="outline" className="text-xs mr-1">{session.utmData.medium}</Badge>}
                            {session.utmData.campaign && <Badge variant="outline" className="text-xs">{session.utmData.campaign}</Badge>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Daily Progress Scores */}
            {profileData.appData.progressScores && profileData.appData.progressScores.total > 0 && (
              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    Дневен Прогрес Score
                  </CardTitle>
                  <CardDescription>Последните {profileData.appData.progressScores.total} дни</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1">
                    {profileData.appData.progressScores.scores.slice(0, 14).map((score, i) => (
                      <div key={i} className={`p-2 rounded text-center ${
                        score.score >= 81 ? 'bg-green-100' :
                        score.score >= 51 ? 'bg-amber-100' :
                        'bg-red-100'
                      }`}>
                        <p className="text-xs text-muted-foreground">{new Date(score.date).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' })}</p>
                        <p className={`text-lg font-bold ${
                          score.score >= 81 ? 'text-green-600' :
                          score.score >= 51 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>{score.score}</p>
                        <p className="text-xs">{score.completedTasks}/{score.totalTasks}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Calendar - Visual Grid */}
            {profileData.appData.dailyCompletion && profileData.appData.dailyCompletion.total > 0 && (
              <Card className="border-l-4 border-l-teal-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-teal-600" />
                    Календар на Активността
                  </CardTitle>
                  <CardDescription>
                    Последните {profileData.appData.dailyCompletion.total} дни |
                    <span className="ml-2 inline-flex items-center gap-3">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> 100%</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500"></span> 50-75%</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> 0-25%</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200"></span> Без данни</span>
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">{day}</div>
                    ))}
                    {(() => {
                      // Create a map for quick lookup
                      const completionMap = new Map(
                        profileData.appData.dailyCompletion.entries.map(e => [e.date, e])
                      );

                      // Get date range (last 35 days to show ~5 weeks)
                      const today = new Date();
                      const startDate = new Date(today);
                      startDate.setDate(today.getDate() - 34);

                      // Adjust to start on Monday
                      const dayOfWeek = startDate.getDay();
                      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                      startDate.setDate(startDate.getDate() + mondayOffset);

                      const days = [];
                      const current = new Date(startDate);

                      while (current <= today || days.length % 7 !== 0) {
                        const dateStr = current.toISOString().split('T')[0];
                        const entry = completionMap.get(dateStr);
                        const isFuture = current > today;

                        let bgColor = 'bg-gray-100';
                        let textColor = 'text-gray-400';

                        if (!isFuture && entry) {
                          const pct = entry.completionPercentage;
                          if (pct === 100) {
                            bgColor = 'bg-green-500';
                            textColor = 'text-white';
                          } else if (pct >= 75) {
                            bgColor = 'bg-green-300';
                            textColor = 'text-green-900';
                          } else if (pct >= 50) {
                            bgColor = 'bg-amber-400';
                            textColor = 'text-amber-900';
                          } else if (pct > 0) {
                            bgColor = 'bg-orange-400';
                            textColor = 'text-orange-900';
                          } else {
                            bgColor = 'bg-red-400';
                            textColor = 'text-white';
                          }
                        } else if (!isFuture && !entry) {
                          bgColor = 'bg-gray-200';
                          textColor = 'text-gray-500';
                        }

                        days.push(
                          <div
                            key={dateStr}
                            className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs ${bgColor} ${textColor} ${isFuture ? 'opacity-30' : ''}`}
                            title={entry ? `${dateStr}: ${entry.completionPercentage}% (Хранене: ${entry.nutritionCompleted ? 'Да' : 'Не'}, Тренировка: ${entry.workoutCompleted ? 'Да' : 'Не'}, Сън: ${entry.sleepCompleted ? 'Да' : 'Не'}, Добавки: ${entry.supplementCompleted ? 'Да' : 'Не'})` : `${dateStr}: Без данни`}
                          >
                            <span className="font-medium">{current.getDate()}</span>
                            {entry && <span className="text-[9px]">{entry.completionPercentage}%</span>}
                          </div>
                        );

                        current.setDate(current.getDate() + 1);
                        if (days.length > 42) break; // Max 6 weeks
                      }

                      return days;
                    })()}
                  </div>

                  {/* Detailed Table */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      Виж подробна таблица ({profileData.appData.dailyCompletion.entries.length} дни)
                    </summary>
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Дата</th>
                            <th className="text-center p-2">Хранене</th>
                            <th className="text-center p-2">Тренировка</th>
                            <th className="text-center p-2">Сън</th>
                            <th className="text-center p-2">Добавки</th>
                            <th className="text-center p-2">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profileData.appData.dailyCompletion.entries.slice(0, 30).map((entry, i) => (
                            <tr key={i} className="border-b">
                              <td className="p-2">{new Date(entry.date).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                              <td className="text-center p-2">{entry.nutritionCompleted ? <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}</td>
                              <td className="text-center p-2">{entry.workoutCompleted ? <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}</td>
                              <td className="text-center p-2">{entry.sleepCompleted ? <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}</td>
                              <td className="text-center p-2">{entry.supplementCompleted ? <CheckCircle className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}</td>
                              <td className="text-center p-2 font-medium">{entry.completionPercentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </CardContent>
              </Card>
            )}

            {/* Email Logs */}
            {profileData.appData.emailLogs && profileData.appData.emailLogs.total > 0 && (
              <Card className="border-l-4 border-l-rose-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-rose-600" />
                    Изпратени Имейли
                  </CardTitle>
                  <CardDescription>{profileData.appData.emailLogs.total} имейла</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profileData.appData.emailLogs.logs.slice(0, 10).map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-accent rounded text-sm">
                        <div className="flex-1">
                          <p className="font-medium truncate">{log.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.templateName && `Шаблон: ${log.templateName} | `}
                            {new Date(log.createdAt).toLocaleDateString('bg-BG')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            log.status === 'sent' ? 'default' :
                            log.status === 'failed' ? 'destructive' :
                            'secondary'
                          } className={log.status === 'sent' ? 'bg-green-600' : ''}>
                            {log.status}
                          </Badge>
                          {log.openedAt && <Eye className="h-3 w-3 text-blue-500" title="Отворен" />}
                          {log.clickedAt && <MousePointer className="h-3 w-3 text-purple-500" title="Кликнат" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full AI Coach Conversation */}
            {profileData.appData.coach && profileData.appData.coach.totalMessages > 0 && (
              <Card className="border-l-4 border-l-violet-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-violet-600" />
                    AI Coach - Пълна История
                  </CardTitle>
                  <CardDescription>
                    {profileData.appData.coach.totalMessages} съобщения |
                    {profileData.appData.coach.allMessages.filter(m => m.role === 'user').length} въпроса от потребителя
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {profileData.appData.coach.allMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-blue-50 border-l-4 border-l-blue-500 ml-4'
                            : 'bg-gray-50 border-l-4 border-l-gray-300 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium ${
                            msg.role === 'user' ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {msg.role === 'user' ? 'Потребител' : 'AI Coach'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleString('bg-BG', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className={`text-sm whitespace-pre-wrap ${
                          msg.role === 'user' ? 'font-medium text-blue-900' : 'text-gray-700'
                        }`}>
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                  {profileData.appData.coach.lastMessage && (
                    <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                      Последно съобщение: {new Date(profileData.appData.coach.lastMessage).toLocaleString('bg-BG')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Chat History */}
            {profileData.appData.chatHistory && profileData.appData.chatHistory.totalSessions > 0 && (
              <Card className="border-l-4 border-l-sky-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-sky-600" />
                    Chat История (Website)
                  </CardTitle>
                  <CardDescription>{profileData.appData.chatHistory.totalSessions} сесии, {profileData.appData.chatHistory.messages.length} съобщения</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.appData.chatHistory.sessions.map((session, i) => (
                      <div key={i} className="p-3 bg-accent rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">
                            Сесия от {new Date(session.createdAt).toLocaleDateString('bg-BG')}
                          </span>
                          {session.pdfFilename && (
                            <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {session.pdfFilename}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          {profileData.appData.chatHistory?.messages
                            .filter(m => m.sessionId === session.id)
                            .slice(0, 3)
                            .map((msg, j) => (
                              <div key={j} className={`text-xs p-2 rounded ${msg.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                <span className="font-medium">{msg.role === 'user' ? 'Потребител' : 'AI'}:</span> {msg.content}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score History */}
            {profileData.appData.scoreHistory && profileData.appData.scoreHistory.total > 0 && (
              <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-amber-600" />
                    История на Score-овете
                  </CardTitle>
                  <CardDescription>{profileData.appData.scoreHistory.total} записа</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profileData.appData.scoreHistory.history.map((score, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-accent rounded text-sm">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-muted-foreground text-xs">Ден {score.dayNumber}</span>
                            <p className="font-bold text-lg">{score.totalScore}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <p className="text-muted-foreground">Сън</p>
                              <p className="font-medium">{score.sleepScore}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground">Lifestyle</p>
                              <p className="font-medium">{score.lifestyleScore}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground">Категория</p>
                              <p className="font-medium">{score.categoryScore}</p>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {score.source}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* App Quiz Results with Answers */}
            {profileData.appData.appQuizResults && profileData.appData.appQuizResults.total > 0 && (
              <Card className="border-l-4 border-l-fuchsia-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-fuchsia-600" />
                    App Quiz Резултати (JSONB)
                  </CardTitle>
                  <CardDescription>{profileData.appData.appQuizResults.total} резултата</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.appData.appQuizResults.results.map((result, i) => (
                      <div key={i} className="p-3 bg-accent rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge>{result.category}</Badge>
                            <Badge variant="outline">{result.level}</Badge>
                            <span className="font-bold text-lg">{result.score}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.takenAt).toLocaleDateString('bg-BG')}
                          </span>
                        </div>
                        {result.answers && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Виж отговорите ({Object.keys(result.answers).length} въпроса)
                            </summary>
                            <div className="mt-2 p-2 bg-background rounded text-xs max-h-40 overflow-auto">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(result.answers, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quiz Leads */}
            {profileData.appData.quizLeads && profileData.appData.quizLeads.total > 0 && (
              <Card className="border-l-4 border-l-lime-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-lime-600" />
                    Quiz Leads
                  </CardTitle>
                  <CardDescription>{profileData.appData.quizLeads.total} lead записа</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profileData.appData.quizLeads.leads.map((lead, i) => (
                      <div key={i} className="p-3 bg-accent rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={lead.isCompleted ? 'default' : 'secondary'} className={lead.isCompleted ? 'bg-green-600' : ''}>
                              {lead.isCompleted ? 'Завършен' : 'Незавършен'}
                            </Badge>
                            {lead.category && <Badge variant="outline">{lead.category}</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(lead.startedAt).toLocaleDateString('bg-BG')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {lead.quizScore !== null && (
                            <div>
                              <span className="text-muted-foreground">Score: </span>
                              <span className="font-medium">{lead.quizScore}</span>
                            </div>
                          )}
                          {lead.assignedLevel && (
                            <div>
                              <span className="text-muted-foreground">Ниво: </span>
                              <span className="font-medium">{lead.assignedLevel}</span>
                            </div>
                          )}
                          {lead.utmSource && (
                            <div>
                              <span className="text-muted-foreground">Source: </span>
                              <span className="font-medium">{lead.utmSource}</span>
                            </div>
                          )}
                          {lead.landingPage && (
                            <div className="truncate">
                              <span className="text-muted-foreground">Page: </span>
                              <span className="font-medium">{lead.landingPage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Checkins */}
            {profileData.appData.checkins && profileData.appData.checkins.total > 0 && (
              <Card className="border-l-4 border-l-pink-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-pink-600" />
                    Checkin-и
                  </CardTitle>
                  <CardDescription>{profileData.appData.checkins.total} checkin-а</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {profileData.appData.checkins.entries.map((checkin, i) => (
                      <div key={i} className="p-2 bg-accent rounded text-center">
                        <p className="text-xs text-muted-foreground">Ден {checkin.dayNumber}</p>
                        <p className="text-sm font-medium">{checkin.feeling}</p>
                        <div className="flex justify-center gap-2 mt-1 text-xs">
                          <span title="Енергия">⚡{checkin.energyLevel}</span>
                          <span title="Настроение">😊{checkin.moodLevel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}


        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Хронология на Активността
            </CardTitle>
            <CardDescription>
              Всички действия на потребителя
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileData.timeline.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 sm:py-8">
                Няма записани активности
              </p>
            ) : (
              <div className="space-y-4">
                {profileData.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          event.type === "chat_session"
                            ? "bg-blue-100 text-blue-600"
                            : event.type === "funnel_session"
                              ? "bg-purple-100 text-purple-600"
                              : event.type === "purchase"
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getEventIcon(event.type, event.data.event_type)}
                      </div>
                      {index < profileData.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            {getEventTitle(event)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {getEventDescription(event)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatTime(event.timestamp)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative bg-background rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-pink-600" />
                <h3 className="text-lg font-semibold">Снимка за Прогрес</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  disabled={isDeletingPhoto}
                >
                  {isDeletingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Изтрий
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPhoto(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="flex items-center justify-center bg-accent/30 rounded-lg p-2">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={`Progress photo from ${selectedPhoto.date}`}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Дата</h4>
                  <p className="text-lg font-semibold">
                    {new Date(selectedPhoto.date).toLocaleDateString('bg-BG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {selectedPhoto.weight && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Тегло</h4>
                    <p className="text-2xl font-bold text-primary">{selectedPhoto.weight} kg</p>
                  </div>
                )}

                {selectedPhoto.bodyFatPct && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Телесна мазнина</h4>
                    <p className="text-2xl font-bold text-orange-500">{selectedPhoto.bodyFatPct}%</p>
                  </div>
                )}

                {selectedPhoto.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Бележки</h4>
                    <p className="text-base bg-accent/50 p-3 rounded-lg">{selectedPhoto.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Качена на</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedPhoto.createdAt).toLocaleString('bg-BG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(selectedPhoto.photoUrl, '_blank')}
                  >
                    <ZoomIn className="h-4 w-4 mr-2" />
                    Отвори в нов таб
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
