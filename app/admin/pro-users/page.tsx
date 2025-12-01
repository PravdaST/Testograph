"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { SearchBar } from "@/components/admin/SearchBar";
import { SkeletonTable } from "@/components/admin/SkeletonCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  RefreshCw,
  Dumbbell,
  Utensils,
  Moon,
  Pill,
  Bot,
  ArrowUpDown,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  ShieldCheck,
  ShieldX,
  Package,
  Edit,
  ShoppingCart,
  DollarSign,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppUserData {
  id: string;
  email: string;
  name: string | null;
  // Shopify Order info
  shopifyOrderId: string | null;
  orderTotal: number | null;
  orderDate: string | null;
  paymentStatus: 'paid' | 'pending' | 'cancelled' | null;
  productType: string | null;
  orderedBottles: number;
  orderedCapsules: number;
  estimatedPrice: boolean;
  // Quiz info
  quizCompletedAt: string | null;
  quizCategory: string | null;
  quizScore: number | null;
  quizLevel: string | null;
  quizWorkoutLocation: string | null;
  // App registration
  isRegistered: boolean;
  registeredAt: string | null;
  hasActiveSubscription: boolean;
  subscriptionExpiresAt: string | null;
  currentDay: number | null;
  dietaryPreference: string | null;
  // Inventory & Access
  capsulesRemaining: number;
  totalCapsules: number;
  bottlesPurchased: number;
  lastPurchaseDate: string | null;
  hasAccess: boolean;
  accessStatus: 'full_access' | 'no_capsules' | 'no_quiz' | 'pending_payment' | 'none';
  // Engagement
  workoutsCount: number;
  mealsCount: number;
  sleepCount: number;
  testoUpDays: number;
  testoUpCompliance: number;
  coachMessages: number;
  measurementsCount: number;
  photosCount: number;
  // Activity
  lastWorkout: string | null;
  lastMeal: string | null;
  lastSleep: string | null;
  lastActivity: string | null;
}

interface Stats {
  totalUsers: number;
  // Order stats
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  pendingRevenue: number;
  // Quiz & Access stats
  totalQuizUsers: number;
  registeredUsers: number;
  activeSubscriptions: number;
  registrationRate: number;
  // Inventory stats
  usersWithCapsules: number;
  usersWithAccess: number;
  usersNoCapsules: number;
  usersNoQuiz: number;
  needsActivation: number;
  totalCapsulesInSystem: number;
  // Engagement stats
  avgWorkouts: number;
  avgTestoUpCompliance: number;
  totalWorkouts: number;
  totalMeals: number;
  totalSleep: number;
  totalCoachMessages: number;
}

type SortField = "email" | "orderDate" | "quizCompletedAt" | "registeredAt" | "workoutsCount" | "testoUpCompliance" | "lastActivity" | "capsulesRemaining";
type PaymentFilter = "all" | "paid" | "pending" | "no_order";
type ActivityFilter = "all" | "active" | "inactive";
type SubscriptionFilter = "all" | "active" | "expired";
type RegistrationFilter = "all" | "registered" | "notRegistered";
type AccessFilter = "all" | "full_access" | "no_capsules" | "no_quiz" | "pending_payment";

export default function AppUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AppUserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("orderDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>("all");
  const [registrationFilter, setRegistrationFilter] = useState<RegistrationFilter>("all");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [editingUser, setEditingUser] = useState<AppUserData | null>(null);
  const [newCapsuleCount, setNewCapsuleCount] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAppUsers();
  }, []);

  const fetchAppUsers = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch("/api/admin/app-users");
      const data = await response.json();

      if (response.ok && data.success) {
        setUsers(data.users || []);
        setStats(data.stats || null);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching app users:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const updateCapsules = async () => {
    if (!editingUser) return;

    const capsules = parseInt(newCapsuleCount);
    if (isNaN(capsules) || capsules < 0) {
      alert("Моля въведете валидно число за капсулите");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/access-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editingUser.email,
          action: "grant",
          capsules: capsules,
        }),
      });

      if (response.ok) {
        // Update local state
        setUsers(users.map(u =>
          u.email === editingUser.email
            ? {
                ...u,
                capsulesRemaining: capsules,
                hasAccess: capsules > 0,
                accessStatus: capsules > 0 ? 'full_access' : 'no_capsules'
              }
            : u
        ));
        setEditingUser(null);
        setNewCapsuleCount("");
        // Refresh to get accurate stats
        fetchAppUsers(true);
      } else {
        const data = await response.json();
        alert(data.error || "Грешка при обновяването");
      }
    } catch (error) {
      console.error("Error updating capsules:", error);
      alert("Грешка при обновяването на капсулите");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "току-що";
    if (diffMins < 60) return `преди ${diffMins} мин`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `преди ${diffHours} ч`;

    return date.toLocaleDateString("bg-BG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysSinceActivity = (lastActivity: string | null): number => {
    if (!lastActivity) return 999;
    const diff = new Date().getTime() - new Date(lastActivity).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getActivityStatus = (lastActivity: string | null) => {
    const days = getDaysSinceActivity(lastActivity);
    if (days <= 3) return { label: "Активен", color: "bg-green-600" };
    if (days <= 7) return { label: "Скоро", color: "bg-yellow-600" };
    return { label: "Неактивен", color: "bg-gray-500" };
  };

  const exportToCSV = () => {
    if (sortedUsers.length === 0) return;

    const headers = [
      "Email",
      "Name",
      "Is Registered",
      "Quiz Completed At",
      "Registered At",
      "Access Status",
      "Capsules Remaining",
      "Total Capsules",
      "Bottles Purchased",
      "Last Purchase",
      "Subscription",
      "Category",
      "Level",
      "Workouts",
      "Meals",
      "Sleep",
      "TestoUP Days",
      "TestoUP %",
      "Coach Messages",
      "Last Activity",
    ];

    const csvData = sortedUsers.map((user) => [
      user.email,
      user.name || "",
      user.isRegistered ? "Yes" : "No",
      user.quizCompletedAt || "",
      user.registeredAt || "",
      user.accessStatus,
      user.capsulesRemaining,
      user.totalCapsules,
      user.bottlesPurchased,
      user.lastPurchaseDate || "",
      user.hasActiveSubscription ? "Active" : "Inactive",
      user.quizCategory || "",
      user.quizLevel || "",
      user.workoutsCount,
      user.mealsCount,
      user.sleepCount,
      user.testoUpDays,
      user.testoUpCompliance,
      user.coachMessages,
      user.lastActivity || "",
    ]);

    const csv = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `app-users-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter users
  let filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.shopifyOrderId?.toLowerCase().includes(searchQuery.toLowerCase());

    // Payment filter
    let matchesPayment = true;
    if (paymentFilter === "paid") {
      matchesPayment = user.paymentStatus === "paid";
    } else if (paymentFilter === "pending") {
      matchesPayment = user.paymentStatus === "pending";
    } else if (paymentFilter === "no_order") {
      matchesPayment = user.paymentStatus === null;
    }

    // Activity filter
    let matchesActivity = true;
    if (activityFilter === "active") {
      matchesActivity = getDaysSinceActivity(user.lastActivity) <= 7;
    } else if (activityFilter === "inactive") {
      matchesActivity = getDaysSinceActivity(user.lastActivity) > 7;
    }

    // Subscription filter
    let matchesSubscription = true;
    if (subscriptionFilter === "active") {
      matchesSubscription = user.hasActiveSubscription;
    } else if (subscriptionFilter === "expired") {
      matchesSubscription = !user.hasActiveSubscription;
    }

    // Registration filter
    let matchesRegistration = true;
    if (registrationFilter === "registered") {
      matchesRegistration = user.isRegistered;
    } else if (registrationFilter === "notRegistered") {
      matchesRegistration = !user.isRegistered;
    }

    // Access filter
    let matchesAccess = true;
    if (accessFilter !== "all") {
      matchesAccess = user.accessStatus === accessFilter;
    }

    return matchesSearch && matchesPayment && matchesActivity && matchesSubscription && matchesRegistration && matchesAccess;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (sortField === "orderDate" || sortField === "quizCompletedAt" || sortField === "registeredAt" || sortField === "lastActivity") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">App Users</h1>
            <p className="text-muted-foreground mt-1">Зареждане...</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Регистрирани потребители</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonTable rows={10} />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600" />
                Operations Management
              </h1>
              <p className="text-muted-foreground mt-1">
                {lastUpdated && `Последна актуализация: ${formatTimestamp(lastUpdated)}`}{" "}
                - {users.length} клиенти (Shopify + Quiz + App)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={sortedUsers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Експорт CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAppUsers(true)}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Обнови
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Търси по имейл, име или поръчка..."
              className="w-full md:w-64"
            />
            <Select
              value={paymentFilter}
              onValueChange={(value: PaymentFilter) => setPaymentFilter(value)}
            >
              <SelectTrigger className="w-[160px]">
                <ShoppingCart className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Плащане" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички</SelectItem>
                <SelectItem value="paid">Платени</SelectItem>
                <SelectItem value="pending">Чакащи</SelectItem>
                <SelectItem value="no_order">Без поръчка</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={activityFilter}
              onValueChange={(value: ActivityFilter) => setActivityFilter(value)}
            >
              <SelectTrigger className="w-[160px]">
                <Activity className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Активност" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички</SelectItem>
                <SelectItem value="active">Активни (7д)</SelectItem>
                <SelectItem value="inactive">Неактивни</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={subscriptionFilter}
              onValueChange={(value: SubscriptionFilter) => setSubscriptionFilter(value)}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Абонамент" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички</SelectItem>
                <SelectItem value="active">С абонамент</SelectItem>
                <SelectItem value="expired">Без абонамент</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={registrationFilter}
              onValueChange={(value: RegistrationFilter) => setRegistrationFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <CheckCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Регистрация" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички</SelectItem>
                <SelectItem value="registered">Регистрирани</SelectItem>
                <SelectItem value="notRegistered">Не регистрирани</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={accessFilter}
              onValueChange={(value: AccessFilter) => setAccessFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <ShieldCheck className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Достъп" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички</SelectItem>
                <SelectItem value="full_access">С достъп</SelectItem>
                <SelectItem value="no_capsules">Без капсули</SelectItem>
                <SelectItem value="no_quiz">Без Quiz</SelectItem>
                <SelectItem value="pending_payment">Чака плащане</SelectItem>
              </SelectContent>
            </Select>
            {(paymentFilter !== "all" || activityFilter !== "all" || subscriptionFilter !== "all" || registrationFilter !== "all" || accessFilter !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPaymentFilter("all");
                  setActivityFilter("all");
                  setSubscriptionFilter("all");
                  setRegistrationFilter("all");
                  setAccessFilter("all");
                  setSearchQuery("");
                }}
              >
                Изчисти филтри
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {/* Order Stats */}
            <Card className="shadow-sm bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Платени</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.paidOrders}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    ({stats.totalRevenue.toFixed(0)} лв)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">Чакащи</span>
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {stats.pendingOrders}
                  <span className="text-xs font-normal text-amber-500 italic ml-1">
                    (~{stats.pendingRevenue.toFixed(0)} лв)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Access Stats */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-medium">С достъп</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.usersWithAccess}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Нужна активация</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.needsActivation}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Без Quiz</span>
                </div>
                <div className="text-2xl font-bold text-red-500">
                  {stats.usersNoQuiz}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">С капсули</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.usersWithCapsules}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Pill className="h-4 w-4" />
                  <span className="font-medium">Общо капсули</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalCapsulesInSystem}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Dumbbell className="h-4 w-4" />
                  <span className="font-medium">Тренировки</span>
                </div>
                <div className="text-2xl font-bold">
                  {stats.totalWorkouts}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Клиенти</span>
              {(searchQuery || paymentFilter !== "all" || activityFilter !== "all" || subscriptionFilter !== "all" || registrationFilter !== "all" || accessFilter !== "all") && (
                <span className="text-sm text-muted-foreground font-normal">
                  Показвам {sortedUsers.length} от {users.length} клиенти
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Няма намерени клиенти"
                description={searchQuery ? `Няма клиенти за "${searchQuery}"` : "Все още няма клиенти"}
              />
            ) : (
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center gap-1">
                          Клиент
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("orderDate")}
                      >
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          Плащане
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="h-10">Quiz</TableHead>
                      <TableHead className="h-10">Категория</TableHead>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("capsulesRemaining")}
                      >
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Капсули
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="h-10">Достъп</TableHead>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("workoutsCount")}
                      >
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="h-10">
                        <Utensils className="h-3 w-3" />
                      </TableHead>
                      <TableHead className="h-10">
                        <Moon className="h-3 w-3" />
                      </TableHead>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("testoUpCompliance")}
                      >
                        <div className="flex items-center gap-1">
                          <Pill className="h-3 w-3" />
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="h-10">
                        <Bot className="h-3 w-3" />
                      </TableHead>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("lastActivity")}
                      >
                        <div className="flex items-center gap-1 justify-end">
                          Активност
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.map((user, index) => {
                      const activityStatus = getActivityStatus(user.lastActivity);
                      return (
                        <TableRow
                          key={user.id}
                          className={cn(
                            "h-12 cursor-pointer transition-colors hover:bg-muted/50",
                            index % 2 === 0 ? "" : "bg-muted/30"
                          )}
                          onClick={() =>
                            router.push(`/admin/users/${encodeURIComponent(user.email)}`)
                          }
                        >
                          <TableCell className="font-medium text-sm py-2">
                            <div>
                              <div>{user.name || user.email}</div>
                              {user.name && (
                                <div className="text-xs text-muted-foreground">
                                  {user.email}
                                </div>
                              )}
                              {user.shopifyOrderId && (
                                <div className="text-xs text-muted-foreground">
                                  #{user.shopifyOrderId}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            {user.paymentStatus === 'paid' ? (
                              <Badge className="bg-green-600 text-xs">Платено</Badge>
                            ) : user.paymentStatus === 'pending' ? (
                              <Badge className="bg-amber-500 text-xs">Чака</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">-</Badge>
                            )}
                            {user.orderTotal && user.orderTotal > 0 && (
                              <div className={cn(
                                "text-xs mt-0.5",
                                user.estimatedPrice ? "text-amber-600 italic" : "text-muted-foreground"
                              )}>
                                {user.estimatedPrice ? "~" : ""}{user.orderTotal.toFixed(0)} лв
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm py-2">
                            {user.quizCompletedAt ? (
                              <Badge className="bg-blue-600 text-xs">Да</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-red-500 border-red-500">Не</Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            {user.quizCategory ? (
                              <Badge variant="outline" className="text-xs capitalize">
                                {user.quizCategory}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-medium",
                                user.capsulesRemaining > 30 ? "text-green-600" :
                                user.capsulesRemaining > 0 ? "text-amber-600" : "text-red-500"
                              )}>
                                {user.capsulesRemaining}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingUser(user);
                                  setNewCapsuleCount(user.capsulesRemaining.toString());
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            {user.accessStatus === 'full_access' ? (
                              <Badge className="bg-green-600 text-xs">С достъп</Badge>
                            ) : user.accessStatus === 'pending_payment' ? (
                              <Badge className="bg-amber-500 text-xs">Чака плащане</Badge>
                            ) : user.accessStatus === 'no_capsules' ? (
                              <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">Без капсули</Badge>
                            ) : user.accessStatus === 'no_quiz' ? (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">Без Quiz</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">-</Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <span className={cn(
                              "font-medium",
                              user.workoutsCount > 0 ? "text-blue-600" : "text-muted-foreground"
                            )}>
                              {user.workoutsCount}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <span className={cn(
                              user.mealsCount > 0 ? "text-orange-600" : "text-muted-foreground"
                            )}>
                              {user.mealsCount}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <span className={cn(
                              user.sleepCount > 0 ? "text-indigo-600" : "text-muted-foreground"
                            )}>
                              {user.sleepCount}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            {user.testoUpDays > 0 ? (
                              <span className={cn(
                                "font-medium",
                                user.testoUpCompliance >= 80 ? "text-green-600" :
                                user.testoUpCompliance >= 60 ? "text-yellow-600" : "text-red-600"
                              )}>
                                {user.testoUpCompliance}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <span className={cn(
                              user.coachMessages > 0 ? "text-purple-600" : "text-muted-foreground"
                            )}>
                              {user.coachMessages}
                            </span>
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <Badge
                              className={cn("text-xs", activityStatus.color)}
                            >
                              {activityStatus.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Capsule Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактиране на капсули</DialogTitle>
            <DialogDescription>
              Промяна на броя капсули за {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capsules" className="text-right">
                Капсули
              </Label>
              <Input
                id="capsules"
                type="number"
                min="0"
                value={newCapsuleCount}
                onChange={(e) => setNewCapsuleCount(e.target.value)}
                className="col-span-3"
                placeholder="Въведи брой капсули..."
              />
            </div>
            {editingUser && (
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right text-sm text-muted-foreground">Текущи:</span>
                <span className="col-span-3 text-sm">
                  {editingUser.capsulesRemaining} капсули
                  {editingUser.bottlesPurchased > 0 && ` (${editingUser.bottlesPurchased} бутилки)`}
                </span>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewCapsuleCount("60")}
              >
                +1 бутилка (60)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewCapsuleCount("120")}
              >
                +2 бутилки (120)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewCapsuleCount("0")}
              >
                Изчисти
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Отказ
            </Button>
            <Button onClick={updateCapsules} disabled={isSaving}>
              {isSaving ? "Запазване..." : "Запази"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
