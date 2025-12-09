"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Users as UsersIcon,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  MoreVertical,
  Shield,
  Key,
  Ban,
  CheckSquare,
  Edit,
  Trash2,
  AlertTriangle,
  MessageCircle,
  TrendingUp,
  ShoppingBag,
  Crown,
  User,
  Clock,
  Copy,
  Plus,
  Minus,
  Mail,
  X,
  Dumbbell,
  Utensils,
  Moon,
  Pill,
  Bot,
  ArrowRight,
  ClipboardList,
  CreditCard,
  FileText,
  CircleCheck,
  CircleDashed,
  AlertCircle,
} from "lucide-react";
import { exportToCSV } from "@/lib/utils/exportToCSV";
import { useToast } from "@/hooks/use-toast";

interface User {
  id?: string;
  email: string;
  firstName?: string;
  // Quiz data
  quizDate?: string;
  category?: 'energy' | 'libido' | 'muscle';
  level?: string;
  totalScore?: number;
  workoutLocation?: 'home' | 'gym';
  // Inventory
  capsulesRemaining?: number;
  // Activity counts (last 7 days)
  workoutCount?: number;
  mealCount?: number;
  sleepCount?: number;
  testoupCount?: number;
  coachMessages?: number;
  // Legacy
  chatSessions: number;
  lastActivity: string;
  purchasesCount: number;
  totalSpent: number;
  latestPurchase?: string;
  hasAppAccess?: boolean;
  // Payment status
  paymentStatus?: 'paid' | 'pending' | 'none';
  pendingOrderDate?: string;
  // Reminder tracking
  quizReminderSentAt?: string;
  // Admin fields
  banned?: boolean;
  name?: string;
  avatar?: string;
  userCreatedAt?: string;
  emailVerified?: boolean;
  protocolStartDatePro?: string | null;
  banInfo?: {
    reason: string;
    bannedAt: string;
    bannedBy: string;
  };
  activeApps?: string[];
}

interface UsersResponse {
  users: User[];
  total: number;
}

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'withQuiz' | 'withoutQuiz' | 'withPurchases' | 'pendingPayment' | 'active'>('all');
  const [actionLoading, setActionLoading] = useState(false);

  // Admin user authentication
  const [adminId, setAdminId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailModal, setUserDetailModal] = useState(false);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [userInventory, setUserInventory] = useState<{
    capsulesRemaining: number;
    totalBottles: number;
    lastPurchaseDate: string | null;
  } | null>(null);
  const [userQuizData, setUserQuizData] = useState<{
    category: string;
    level: string;
    totalScore: number;
    workoutLocation: string;
    dietaryPreference: string;
    quizDate: string;
    firstName: string;
    breakdown: {
      symptoms: number;
      nutrition: number;
      training: number;
      sleepRecovery: number;
      context: number;
    };
    responses?: Array<{
      question_id: string;
      answer: string;
      points: number;
    }>;
  } | null>(null);

  // Funnel journey state
  const [userFunnelJourney, setUserFunnelJourney] = useState<{
    quizCompleted: boolean;
    quizCompletedAt: string | null;
    orderPlaced: boolean;
    firstOrderAt: string | null;
    paymentCompleted: boolean;
    firstPaymentAt: string | null;
    pendingOrders: Array<{
      id: string;
      orderId: string;
      orderNumber: string;
      status: string;
      totalPrice: number;
      currency: string;
      createdAt: string;
      paidAt: string | null;
      products: Array<{
        title: string;
        quantity: number;
        sku?: string;
        type?: 'trial' | 'full';
        capsules?: number;
        totalCapsules?: number;
      }>;
      customerName?: string;
      shippingAddress?: any;
      phone?: string;
    }>;
    currentStep: 'not_started' | 'quiz_completed' | 'pending_payment' | 'paid';
  } | null>(null);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [grantProModal, setGrantProModal] = useState(false);
  const [revokeProModal, setRevokeProModal] = useState(false);
  const [addAppModal, setAddAppModal] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [banUserModal, setBanUserModal] = useState(false);
  const [unbanUserModal, setUnbanUserModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [deleteUserModal, setDeleteUserModal] = useState(false);
  const [sendReminderModal, setSendReminderModal] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  // Form states
  const [proStartDate, setProStartDate] = useState("");
  const [revokeProReason, setRevokeProReason] = useState("");
  const [selectedApp, setSelectedApp] = useState("");
  const [appAmount, setAppAmount] = useState("0");
  const [newPassword, setNewPassword] = useState("");
  const [banReason, setBanReason] = useState("");
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");

  // Capsule editing states
  const [editingCapsules, setEditingCapsules] = useState(false);
  const [newCapsuleCount, setNewCapsuleCount] = useState(0);
  const [capsuleReason, setCapsuleReason] = useState("");

  // New: Coach messages and activity data
  const [userCoachMessages, setUserCoachMessages] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<{
    workouts: any[];
    meals: any[];
    sleep: any[];
    testoup: any[];
  } | null>(null);
  const [userCredentialsInfo, setUserCredentialsInfo] = useState<{
    hasReceivedCredentials: boolean;
    credentialsEmailDate: string | null;
    programDay: number | null;
  } | null>(null);

  // Fetch admin user on mount
  useEffect(() => {
    const fetchAdminUser = async () => {
      const { adminUser, userId, email } = await getCurrentAdminUser();
      if (adminUser) {
        setAdminId(userId);
        setAdminEmail(email);
      } else {
        // Not authenticated as admin - redirect to login
        router.push("/admin");
      }
    };
    fetchAdminUser();
  }, [router]);

  useEffect(() => {
    if (adminId && adminEmail) {
      fetchUsers();
    }
  }, [search, adminId, adminEmail]);

  useEffect(() => {
    if (userDetailModal && selectedUser) {
      fetchUserPurchases(selectedUser.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetailModal, selectedUser?.email]);

  const fetchUserPurchases = async (email: string) => {
    setLoadingPurchases(true);
    setUserInventory(null);
    setUserQuizData(null);
    setUserCoachMessages([]);
    setUserActivity(null);
    setUserCredentialsInfo(null);
    setUserFunnelJourney(null);
    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(email)}`,
      );
      const data = await response.json();

      if (response.ok && data.purchases) {
        setUserPurchases(data.purchases);

        // Save inventory data
        if (data.inventory) {
          setUserInventory(data.inventory);
        }

        // Save quiz data
        if (data.quizData) {
          setUserQuizData(data.quizData);
        }

        // Save coach messages
        if (data.coachMessages) {
          setUserCoachMessages(data.coachMessages);
        }

        // Save activity data
        if (data.activity) {
          setUserActivity(data.activity);
        }

        // Save funnel journey
        if (data.funnelJourney) {
          setUserFunnelJourney(data.funnelJourney);
        }

        // Save credentials info
        setUserCredentialsInfo({
          hasReceivedCredentials: data.hasReceivedCredentials || false,
          credentialsEmailDate: data.credentialsEmailDate || null,
          programDay: data.programDay || null,
        });

        // Update selectedUser with enhanced data from API
        if (selectedUser) {
          setSelectedUser({
            ...selectedUser,
            id: data.userId,
            userCreatedAt: data.userCreatedAt,
            emailVerified: data.emailVerified,
            banned: data.banned,
            banInfo: data.banInfo,
            protocolStartDatePro: data.profile?.protocolStartDatePro,
            name: data.profile?.name || selectedUser.name,
            avatar: data.profile?.avatar || selectedUser.avatar,
            activeApps: data.stats?.activeApps || [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user purchases:", error);
      toast({
        title: "Грешка",
        description: "Не успя да се заредят покупките",
        variant: "destructive",
      });
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleUpdateCapsules = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(selectedUser.email)}/inventory`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            capsules: newCapsuleCount,
            reason: capsuleReason || "Admin adjustment",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update capsules");

      // Update local state
      setUserInventory((prev) =>
        prev
          ? { ...prev, capsulesRemaining: newCapsuleCount }
          : { capsulesRemaining: newCapsuleCount, totalBottles: 0, lastPurchaseDate: null }
      );

      toast({
        title: "Успех",
        description: `Капсулите са обновени на ${newCapsuleCount}`,
      });

      setEditingCapsules(false);
      setCapsuleReason("");
    } catch (error) {
      console.error("Error updating capsules:", error);
      toast({
        title: "Грешка",
        description: "Не успя да се обновят капсулите",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/admin/users?${params}`);
      const data: UsersResponse = await response.json();

      if (response.ok) {
        // Use data directly from API - don't fetch individual user details (causes N+1 problem)
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Грешка",
        description: "Не успя да се заредят потребителите",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("bg-BG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Сега";
    if (diffMins < 60) return `Преди ${diffMins} мин`;
    if (diffHours < 24)
      return `Преди ${diffHours} час${diffHours === 1 ? "" : "а"}`;
    if (diffDays < 30)
      return `Преди ${diffDays} ден${diffDays === 1 ? "" : "и"}`;
    return formatDate(dateString);
  };

  const calculateProDays = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffMs = now.getTime() - start.getTime();
    const daysElapsed = Math.floor(diffMs / 86400000);
    const daysRemaining = Math.max(0, 28 - daysElapsed);
    return { daysElapsed, daysRemaining };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Копирано",
      description: "Текстът е копиран в клипборда",
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleExport = () => {
    const exportData = filteredUsers.map((user) => ({
      Email: user.email,
      "First Name": user.firstName || "N/A",
      Category: user.category || "N/A",
      Level: user.level || "N/A",
      "Quiz Date": user.quizDate ? formatDate(user.quizDate) : "N/A",
      "Capsules Remaining": user.capsulesRemaining || 0,
      "Purchases Count": user.purchasesCount,
      "Total Spent (BGN)": user.totalSpent?.toFixed(2) || "0.00",
      "Workouts (7d)": user.workoutCount || 0,
      "Meals (7d)": user.mealCount || 0,
      "Sleep (7d)": user.sleepCount || 0,
      "TestoUP (7d)": user.testoupCount || 0,
      "Coach Messages": user.coachMessages || 0,
      "Quiz Reminder Sent": user.quizReminderSentAt ? formatDate(user.quizReminderSentAt) : "Not sent",
      "Has App Access": user.hasAppAccess ? "Yes" : "No",
      Banned: user.banned ? "Yes" : "No",
    }));

    exportToCSV(exportData, `users-${new Date().toISOString().split("T")[0]}`);
  };

  const openGrantProModal = (user: User) => {
    setSelectedUser(user);
    setProStartDate(new Date().toISOString().split("T")[0]);
    setGrantProModal(true);
  };

  const handleGrantPro = async () => {
    if (!selectedUser?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/access/grant-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          startDate: proStartDate,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успех",
          description: data.message,
        });
        setGrantProModal(false);
        fetchUsers();
        // Refresh user detail
        if (selectedUser.email) {
          fetchUserPurchases(selectedUser.email);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно даване на PRO достъп",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokePro = async () => {
    if (!selectedUser?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/access/revoke-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason: revokeProReason,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успех",
          description: data.message,
        });
        setRevokeProModal(false);
        setRevokeProReason("");
        fetchUsers();
        // Refresh user detail
        if (selectedUser.email) {
          fetchUserPurchases(selectedUser.email);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно премахване на PRO достъп",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAppAccess = async () => {
    if (!selectedUser?.id || !selectedApp) return;

    const appNames: Record<string, string> = {
      "meal-planner": "Meal Planner",
      "sleep-protocol": "Sleep Protocol",
      "supplement-timing": "Supplement Timing Guide",
      "exercise-guide": "Exercise Reference Guide",
      "lab-testing": "Lab Testing Guide",
    };

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/access/create-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          productName: appNames[selectedApp] || selectedApp,
          productType: "digital",
          appsIncluded: [selectedApp],
          amount: parseFloat(appAmount),
          currency: "BGN",
          status: "completed",
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успех",
          description: data.message,
        });
        setAddAppModal(false);
        setSelectedApp("");
        setAppAmount("0");
        fetchUsers();
        // Refresh user detail
        if (selectedUser.email) {
          fetchUserPurchases(selectedUser.email);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Грешка",
        description:
          error.message || "Неуспешно добавяне на достъп до приложение",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser?.id || !newPassword) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успех",
          description: data.message,
        });
        setResetPasswordModal(false);
        setNewPassword("");
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message || "Неуспешна промяна на парола",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason: banReason,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успех",
          description: data.message,
        });
        setBanUserModal(false);
        setBanReason("");
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно блокиране на потребител",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUser?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users/unban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успех",
          description: data.message,
        });
        setUnbanUserModal(false);
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно разблокиране на потребител",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (!selectedUser?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users/edit-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          updates: {
            name: editName,
            avatar: editAvatar || null,
          },
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успех",
          description: data.message,
        });
        setEditProfileModal(false);
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно редактиране на профил",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?.id || !deleteConfirmEmail) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          confirmEmail: deleteConfirmEmail,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Успех",
          description: data.message,
        });
        setDeleteUserModal(false);
        setDeleteConfirmEmail("");
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно изтриване на потребител",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendQuizReminder = async () => {
    if (!selectedUser?.email || !adminId || !adminEmail) return;

    setSendingReminder(true);
    try {
      const firstName = selectedUser.firstName || '';
      const quizUrl = 'https://app.testograph.eu/quiz';

      const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Testograph</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Персонализирана програма за тестостерон</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">Здравей${firstName ? ` ${firstName}` : ''},</h2>

            <p style="color: #4b5563; line-height: 1.7; font-size: 16px; margin: 0 0 20px 0;">
              Забелязахме, че все още не си завършил своя <strong>Quiz</strong> в Testograph.
            </p>

            <p style="color: #4b5563; line-height: 1.7; font-size: 16px; margin: 0 0 25px 0;">
              Quiz-ът отнема само <strong>2-3 минути</strong> и е първата стъпка към персонализираната ти програма за оптимизация на тестостерона.
            </p>

            <!-- Benefits Box -->
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;">
              <p style="color: #374151; font-weight: 600; margin: 0 0 15px 0; font-size: 16px;">След като го завършиш, ще получиш:</p>
              <table style="width: 100%;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;">
                    <span style="color: #7c3aed; margin-right: 10px;">&#10003;</span> Персонализиран план за хранене
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;">
                    <span style="color: #7c3aed; margin-right: 10px;">&#10003;</span> Индивидуална тренировъчна програма
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;">
                    <span style="color: #7c3aed; margin-right: 10px;">&#10003;</span> Препоръки за сън и възстановяване
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 15px;">
                    <span style="color: #7c3aed; margin-right: 10px;">&#10003;</span> Достъп до AI Coach асистента
                  </td>
                </tr>
              </table>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${quizUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                Започни Quiz-а сега
              </a>
            </div>

            <p style="color: #6b7280; line-height: 1.6; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
              Ако имаш въпроси, просто отговори на този имейл.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 25px 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">Поздрави,<br><strong style="color: #6b7280;">Екипът на Testograph</strong></p>
            <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
              <a href="https://testograph.eu" style="color: #7c3aed; text-decoration: none;">testograph.eu</a>
            </p>
          </div>
        </div>
      `;

      const response = await fetch("/api/admin/communication/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedUser.email,
          subject: "Завърши своя Quiz в Testograph",
          message: "Quiz напомняне",
          html: htmlContent,
          isBulk: false,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const now = new Date().toISOString();
        // Update local state to reflect the sent reminder
        setUsers(prev => prev.map(u =>
          u.email === selectedUser.email
            ? { ...u, quizReminderSentAt: now }
            : u
        ));
        setSelectedUser(prev => prev ? { ...prev, quizReminderSentAt: now } : prev);

        toast({
          title: "Успех",
          description: `Напомнянето е изпратено до ${selectedUser.email}`,
        });
        setSendReminderModal(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно изпращане на напомняне",
        variant: "destructive",
      });
    } finally {
      setSendingReminder(false);
    }
  };

  // Filtered users based on status filter
  const filteredUsers = users.filter((user) => {
    switch (statusFilter) {
      case 'withQuiz':
        return !!user.quizDate;
      case 'withoutQuiz':
        return !user.quizDate;
      case 'withPurchases':
        return user.purchasesCount > 0;
      case 'pendingPayment':
        return user.paymentStatus === 'pending';
      case 'active':
        return (user.workoutCount || 0) > 0 ||
          (user.mealCount || 0) > 0 ||
          (user.sleepCount || 0) > 0 ||
          (user.testoupCount || 0) > 0;
      default:
        return true;
    }
  });

  return (
    <AdminLayout>
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold">
            Потребители
          </h1>
          <p className="text-muted-foreground mt-2">
            Преглед на всички потребители и тяхната активност
          </p>
        </div>

        {/* Stats Cards - Clickable Filters */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Всички
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold">
                  {users.length}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'withQuiz' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter('withQuiz')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  С Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-primary">
                  {users.filter((u) => u.quizDate).length}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'withoutQuiz' ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => setStatusFilter('withoutQuiz')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Без Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-red-600">
                  {users.filter((u) => !u.quizDate).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  App Потребители
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-green-600">
                  {users.filter((u) => u.hasAppAccess).length}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'active' ? 'ring-2 ring-orange-500' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Активни (7д)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-orange-600">
                  {users.filter((u) =>
                    (u.workoutCount || 0) > 0 ||
                    (u.mealCount || 0) > 0 ||
                    (u.sleepCount || 0) > 0 ||
                    (u.testoupCount || 0) > 0
                  ).length}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'withPurchases' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setStatusFilter('withPurchases')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  С Покупки
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-green-600">
                  {users.filter((u) => u.purchasesCount > 0).length}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'pendingPayment' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setStatusFilter('pendingPayment')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Чакащи Плащания
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-yellow-600">
                  {users.filter((u) => u.paymentStatus === 'pending').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Общо Приходи
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-green-600">
                  {users.reduce((sum, u) => sum + (u.totalSpent || 0), 0).toFixed(0)} лв
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {statusFilter === 'all' ? 'Всички Потребители' :
                   statusFilter === 'withQuiz' ? 'Потребители с Quiz' :
                   statusFilter === 'withoutQuiz' ? 'Потребители без Quiz' :
                   statusFilter === 'withPurchases' ? 'Потребители с покупки' :
                   statusFilter === 'pendingPayment' ? 'Чакащи плащания' :
                   'Активни потребители (7д)'}
                  {statusFilter !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setStatusFilter('all')}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Изчисти
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {filteredUsers.length} от {users.length}{" "}
                  {users.length === 1 ? "потребител" : "потребители"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Търси по email или име..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={filteredUsers.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {search || statusFilter !== 'all'
                    ? "Няма намерени потребители"
                    : "Още няма потребители"}
                </p>
                {statusFilter !== 'all' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setStatusFilter('all')}
                  >
                    Покажи всички
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-medium">Потребител</th>
                      <th className="text-center p-2 font-medium">Quiz</th>
                      <th className="text-center p-2 font-medium">Плащане</th>
                      <th className="text-center p-2 font-medium">Категория</th>
                      <th className="text-center p-2 font-medium">Капсули</th>
                      <th className="text-center p-2 font-medium">Покупки</th>
                      <th className="text-center p-2 font-medium" title="Тренировки (7 дни)"><Dumbbell className="w-4 h-4 mx-auto text-muted-foreground" /></th>
                      <th className="text-center p-2 font-medium" title="Хранене (7 дни)"><Utensils className="w-4 h-4 mx-auto text-muted-foreground" /></th>
                      <th className="text-center p-2 font-medium" title="Сън (7 дни)"><Moon className="w-4 h-4 mx-auto text-muted-foreground" /></th>
                      <th className="text-center p-2 font-medium" title="TestoUP (7 дни)"><Pill className="w-4 h-4 mx-auto text-muted-foreground" /></th>
                      <th className="text-center p-2 font-medium" title="AI Coach съобщения"><Bot className="w-4 h-4 mx-auto text-muted-foreground" /></th>
                      <th className="text-center p-2 font-medium" title="Quiz напомняне"><Mail className="w-4 h-4 mx-auto text-muted-foreground" /></th>
                      <th className="text-center p-2 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.email}
                        className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedUser(user);
                          setUserDetailModal(true);
                        }}
                      >
                        {/* User Info */}
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[160px]">
                                {user.firstName || user.email.split("@")[0]}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Quiz Date */}
                        <td className="p-2 text-center">
                          {user.quizDate ? (
                            <span className="text-xs text-green-600 font-medium">
                              {new Date(user.quizDate).toLocaleDateString("bg-BG", { day: "2-digit", month: "short" })}
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium text-xs">НЕ</span>
                          )}
                        </td>

                        {/* Payment Status */}
                        <td className="p-2 text-center">
                          {user.paymentStatus === 'paid' ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              Платено
                            </Badge>
                          ) : user.paymentStatus === 'pending' ? (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                              Чакащо
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="p-2 text-center">
                          {user.category ? (
                            <Badge
                              variant="outline"
                              className={
                                user.category === "energy"
                                  ? "border-yellow-500 text-yellow-600 text-xs"
                                  : user.category === "libido"
                                  ? "border-pink-500 text-pink-600 text-xs"
                                  : "border-blue-500 text-blue-600 text-xs"
                              }
                            >
                              {user.category === "energy" ? "Енергия" : user.category === "libido" ? "Либидо" : "Мускул"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* Capsules */}
                        <td className="p-2 text-center">
                          {(user.capsulesRemaining || 0) > 0 ? (
                            <Badge variant="secondary" className="font-mono text-xs">
                              {user.capsulesRemaining}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>

                        {/* Purchases */}
                        <td className="p-2 text-center">
                          {user.purchasesCount > 0 ? (
                            <div className="flex flex-col items-center">
                              <Badge variant="default" className="bg-green-600 font-mono text-xs">
                                {user.purchasesCount}
                              </Badge>
                              <span className="text-xs text-green-600">{user.totalSpent?.toFixed(0)}лв</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* Workout (7 days) */}
                        <td className="p-2 text-center">
                          {(user.workoutCount || 0) > 0 ? (
                            <Badge variant="outline" className="border-orange-500 text-orange-600 font-mono text-xs">
                              {user.workoutCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* Meal (7 days) */}
                        <td className="p-2 text-center">
                          {(user.mealCount || 0) > 0 ? (
                            <Badge variant="outline" className="border-green-500 text-green-600 font-mono text-xs">
                              {user.mealCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* Sleep (7 days) */}
                        <td className="p-2 text-center">
                          {(user.sleepCount || 0) > 0 ? (
                            <Badge variant="outline" className="border-purple-500 text-purple-600 font-mono text-xs">
                              {user.sleepCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* TestoUP (7 days) */}
                        <td className="p-2 text-center">
                          {(user.testoupCount || 0) > 0 ? (
                            <Badge variant="outline" className="border-blue-500 text-blue-600 font-mono text-xs">
                              {user.testoupCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* Coach Messages */}
                        <td className="p-2 text-center">
                          {(user.coachMessages || 0) > 0 ? (
                            <Badge variant="secondary" className="font-mono text-xs">
                              {user.coachMessages}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* Quiz Reminder Sent */}
                        <td className="p-2 text-center">
                          {user.quizReminderSentAt ? (
                            <span className="text-xs text-green-600 font-medium" title={`Изпратено на ${new Date(user.quizReminderSentAt).toLocaleString('bg-BG')}`}>
                              {new Date(user.quizReminderSentAt).toLocaleDateString("bg-BG", { day: "2-digit", month: "short" })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-2 text-center">
                          {user.banned ? (
                            <Badge variant="destructive" className="text-xs">BAN</Badge>
                          ) : user.hasAppAccess ? (
                            <Badge variant="default" className="bg-green-600 text-xs">App</Badge>
                          ) : user.quizDate ? (
                            <Badge variant="secondary" className="text-xs">Quiz</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">-</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grant PRO Modal */}
      <Dialog open={grantProModal} onOpenChange={setGrantProModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Дай PRO Достъп</DialogTitle>
            <DialogDescription>
              Дайте PRO достъп на {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pro-start-date">Начална Дата</Label>
              <Input
                id="pro-start-date"
                type="date"
                value={proStartDate}
                onChange={(e) => setProStartDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGrantProModal(false)}
              disabled={actionLoading}
            >
              Отказ
            </Button>
            <Button onClick={handleGrantPro} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Дай PRO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke PRO Modal */}
      <Dialog open={revokeProModal} onOpenChange={setRevokeProModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Премахни PRO Достъп</DialogTitle>
            <DialogDescription>
              Премахнете PRO достъпа на {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="revoke-pro-reason">Причина (опционално)</Label>
              <Textarea
                id="revoke-pro-reason"
                value={revokeProReason}
                onChange={(e) => setRevokeProReason(e.target.value)}
                placeholder="Въведете причина за премахване на PRO достъп..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevokeProModal(false)}
              disabled={actionLoading}
            >
              Отказ
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokePro}
              disabled={actionLoading}
            >
              {actionLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Премахни PRO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add App Access Modal */}
      <Dialog open={addAppModal} onOpenChange={setAddAppModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добави App Достъп</DialogTitle>
            <DialogDescription>
              Добавете достъп до приложение за {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="app-select">Изберете Приложение</Label>
              <select
                id="app-select"
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">-- Изберете --</option>
                <option value="meal-planner">Meal Planner</option>
                <option value="sleep-protocol">Sleep Protocol</option>
                <option value="supplement-timing">
                  Supplement Timing Guide
                </option>
                <option value="exercise-guide">Exercise Reference Guide</option>
                <option value="lab-testing">Lab Testing Guide</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-amount">Сума (BGN)</Label>
              <Input
                id="app-amount"
                type="number"
                min="0"
                step="0.01"
                value={appAmount}
                onChange={(e) => setAppAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddAppModal(false)}
              disabled={actionLoading}
            >
              Отказ
            </Button>
            <Button
              onClick={handleAddAppAccess}
              disabled={actionLoading || !selectedApp}
            >
              {actionLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Добави Достъп
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetPasswordModal} onOpenChange={setResetPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Промени Парола</DialogTitle>
            <DialogDescription>
              Променете паролата на {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">
                Нова Парола (минимум 8 символа)
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Въведете нова парола"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordModal(false)}
              disabled={actionLoading}
            >
              Отказ
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={actionLoading || newPassword.length < 8}
            >
              {actionLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Промени Парола
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Modal */}
      <Dialog open={banUserModal} onOpenChange={setBanUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Блокирай Потребител</DialogTitle>
            <DialogDescription>
              Блокирайте достъпа на {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Причина (опционално)</Label>
              <Textarea
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Въведете причина за блокиране..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBanUserModal(false)}
              disabled={actionLoading}
            >
              Отказ
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={actionLoading}
            >
              {actionLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Блокирай
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban User Modal */}
      <Dialog open={unbanUserModal} onOpenChange={setUnbanUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Разблокирай Потребител</DialogTitle>
            <DialogDescription>
              Разблокирайте достъпа на {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Сигурни ли сте, че искате да разблокирате този потребител?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnbanUserModal(false)}
              disabled={actionLoading}
            >
              Отказ
            </Button>
            <Button onClick={handleUnbanUser} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Разблокирай
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={editProfileModal} onOpenChange={setEditProfileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирай Профил</DialogTitle>
            <DialogDescription>
              Редактирайте профила на {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Име</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Въведете име"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-avatar">Avatar URL (опционално)</Label>
              <Input
                id="edit-avatar"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditProfileModal(false)}
              disabled={actionLoading}
            >
              Отказ
            </Button>
            <Button onClick={handleEditProfile} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Запази
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={deleteUserModal} onOpenChange={setDeleteUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Изтрий Потребител
            </DialogTitle>
            <DialogDescription>
              Това действие е необратимо! Всички данни на потребителя ще бъдат
              изтрити.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Въведете email на потребителя за потвърждение:
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                placeholder={selectedUser?.email}
              />
              <p className="text-xs text-muted-foreground">
                Потвърдете като въведете:{" "}
                <span className="font-mono">{selectedUser?.email}</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteUserModal(false)}
              disabled={actionLoading}
            >
              Отказ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={
                actionLoading || deleteConfirmEmail !== selectedUser?.email
              }
            >
              {actionLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Изтрий Завинаги
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Modal */}
      <Dialog open={userDetailModal} onOpenChange={setUserDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold">
                  {selectedUser?.name ||
                    selectedUser?.firstName ||
                    selectedUser?.email.split("@")[0]}
                </p>
                <p className="text-sm text-muted-foreground font-normal">
                  {selectedUser?.email}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Преглед на подробна информация за потребителя и управление на
              достъпа
            </DialogDescription>

            {/* Credentials Status Badge */}
            {userCredentialsInfo && (
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {userCredentialsInfo.hasReceivedCredentials ? (
                  <Badge className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Credentials изпратени
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600 border-orange-400">
                    <Clock className="w-3 h-3 mr-1" />
                    Без credentials имейл
                  </Badge>
                )}
                {userCredentialsInfo.programDay && (
                  <Badge variant="secondary">
                    Ден {userCredentialsInfo.programDay} от програмата
                  </Badge>
                )}
                {userCredentialsInfo.credentialsEmailDate && (
                  <span className="text-xs text-muted-foreground">
                    Регистриран: {new Date(userCredentialsInfo.credentialsEmailDate).toLocaleDateString("bg-BG")}
                  </span>
                )}
              </div>
            )}
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-3 sm:space-y-4 md:space-y-6 py-4">
              {/* Funnel Journey Section */}
              {userFunnelJourney && (
                <Card className="border-l-4 border-l-indigo-400 bg-indigo-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <ClipboardList className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-semibold text-indigo-700">Funnel Journey</h4>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      {/* Step 1: Quiz */}
                      <div className={`flex-1 p-3 rounded-lg text-center ${
                        userFunnelJourney.quizCompleted
                          ? 'bg-green-100 border border-green-300'
                          : 'bg-gray-100 border border-gray-200'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          userFunnelJourney.quizCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {userFunnelJourney.quizCompleted
                            ? <CircleCheck className="w-5 h-5 text-white" />
                            : <CircleDashed className="w-5 h-5 text-gray-500" />
                          }
                        </div>
                        <p className="text-xs font-medium">Quiz</p>
                        {userFunnelJourney.quizCompletedAt && (
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(userFunnelJourney.quizCompletedAt).toLocaleDateString("bg-BG")}
                          </p>
                        )}
                      </div>

                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                      {/* Step 2: Order */}
                      <div className={`flex-1 p-3 rounded-lg text-center ${
                        userFunnelJourney.orderPlaced
                          ? 'bg-green-100 border border-green-300'
                          : 'bg-gray-100 border border-gray-200'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          userFunnelJourney.orderPlaced ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {userFunnelJourney.orderPlaced
                            ? <CircleCheck className="w-5 h-5 text-white" />
                            : <CircleDashed className="w-5 h-5 text-gray-500" />
                          }
                        </div>
                        <p className="text-xs font-medium">Поръчка</p>
                        {userFunnelJourney.firstOrderAt && (
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(userFunnelJourney.firstOrderAt).toLocaleDateString("bg-BG")}
                          </p>
                        )}
                      </div>

                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                      {/* Step 3: Payment */}
                      <div className={`flex-1 p-3 rounded-lg text-center ${
                        userFunnelJourney.paymentCompleted
                          ? 'bg-green-100 border border-green-300'
                          : userFunnelJourney.currentStep === 'pending_payment'
                          ? 'bg-yellow-100 border border-yellow-300'
                          : 'bg-gray-100 border border-gray-200'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          userFunnelJourney.paymentCompleted
                            ? 'bg-green-500'
                            : userFunnelJourney.currentStep === 'pending_payment'
                            ? 'bg-yellow-500'
                            : 'bg-gray-300'
                        }`}>
                          {userFunnelJourney.paymentCompleted
                            ? <CircleCheck className="w-5 h-5 text-white" />
                            : userFunnelJourney.currentStep === 'pending_payment'
                            ? <AlertCircle className="w-5 h-5 text-white" />
                            : <CircleDashed className="w-5 h-5 text-gray-500" />
                          }
                        </div>
                        <p className="text-xs font-medium">Плащане</p>
                        {userFunnelJourney.firstPaymentAt ? (
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(userFunnelJourney.firstPaymentAt).toLocaleDateString("bg-BG")}
                          </p>
                        ) : userFunnelJourney.currentStep === 'pending_payment' && (
                          <p className="text-[10px] text-yellow-600 font-medium">Чакащо</p>
                        )}
                      </div>
                    </div>

                    {/* Pending Orders Details */}
                    {userFunnelJourney.pendingOrders && userFunnelJourney.pendingOrders.length > 0 && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <span className="text-base font-semibold text-yellow-700">
                            Чакащи плащания ({userFunnelJourney.pendingOrders.length})
                          </span>
                        </div>
                        <div className="space-y-3">
                          {userFunnelJourney.pendingOrders.map((order) => (
                            <div key={order.id} className="bg-white p-3 rounded-lg border border-yellow-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-800">
                                  Поръчка #{order.orderNumber}
                                </span>
                                <Badge className="bg-yellow-500 text-white text-sm px-3 py-1">
                                  {order.totalPrice} {order.currency}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                Дата: {new Date(order.createdAt).toLocaleDateString("bg-BG", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </div>
                              {/* Products List */}
                              {order.products && Array.isArray(order.products) && order.products.length > 0 && (
                                <div className="border-t pt-2 mt-2">
                                  <p className="text-xs font-medium text-gray-600 mb-1">Поръчани продукти:</p>
                                  <div className="space-y-1">
                                    {order.products.map((product: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">💊</span>
                                          <div>
                                            <span className="font-medium">{product.title || product.name || 'TestoUP'}</span>
                                            {product.quantity && product.quantity > 1 && (
                                              <Badge variant="secondary" className="text-xs ml-2">
                                                x{product.quantity}
                                              </Badge>
                                            )}
                                            {product.capsules && (
                                              <span className="text-xs text-muted-foreground ml-2">
                                                ({product.type === 'trial' ? 'Проба' : 'Пълен'} - {product.capsules} капс.)
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {product.totalCapsules && (
                                          <Badge className="bg-cyan-500 text-white">
                                            {product.totalCapsules} капсули
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  {/* Total capsules */}
                                  {order.products.some((p: any) => p.totalCapsules) && (
                                    <div className="mt-2 flex items-center justify-between text-sm font-semibold bg-cyan-50 p-2 rounded border border-cyan-200">
                                      <span>Общо капсули:</span>
                                      <span className="text-cyan-700">
                                        {order.products.reduce((sum: number, p: any) => sum + (p.totalCapsules || 0), 0)} капсули
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quiz Info Section */}
              {loadingPurchases ? (
                <Card className="border-l-4 border-l-muted">
                  <CardContent className="p-4 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : userQuizData ? (
                <Card className="border-l-4 border-l-primary bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">Quiz Резултат</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(userQuizData.quizDate).toLocaleDateString("bg-BG", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-primary">{userQuizData.totalScore}</p>
                        <p className="text-xs text-muted-foreground">от 100 точки</p>
                      </div>
                    </div>

                    {/* Category and Level */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Категория</Label>
                        <Badge
                          className={
                            userQuizData.category === "energy"
                              ? "bg-yellow-500 mt-1 text-base px-3 py-1"
                              : userQuizData.category === "libido"
                              ? "bg-pink-500 mt-1 text-base px-3 py-1"
                              : "bg-blue-500 mt-1 text-base px-3 py-1"
                          }
                        >
                          {userQuizData.category === "energy"
                            ? "Енергия"
                            : userQuizData.category === "libido"
                            ? "Либидо"
                            : "Мускули"}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Ниво</Label>
                        <p className="font-semibold text-lg capitalize">
                          {userQuizData.level === "low" ? "Ниско"
                            : userQuizData.level === "moderate" ? "Умерено"
                            : userQuizData.level === "good" ? "Добро"
                            : "Оптимално"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Локация</Label>
                        <p className="font-semibold text-lg">
                          {userQuizData.workoutLocation === "home" ? "Вкъщи" : "Фитнес"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Диета</Label>
                        <p className="font-semibold text-lg capitalize">
                          {userQuizData.dietaryPreference || "Омнивор"}
                        </p>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    {userQuizData.breakdown && (
                      <div className="border-t pt-3">
                        <Label className="text-xs text-muted-foreground mb-2 block">Breakdown по категории</Label>
                        <div className="grid grid-cols-5 gap-2">
                          <div className="text-center p-2 bg-red-50 rounded">
                            <p className="text-lg font-bold text-red-600">{userQuizData.breakdown.symptoms || 0}</p>
                            <p className="text-xs text-muted-foreground">Симптоми</p>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <p className="text-lg font-bold text-green-600">{userQuizData.breakdown.nutrition || 0}</p>
                            <p className="text-xs text-muted-foreground">Хранене</p>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded">
                            <p className="text-lg font-bold text-orange-600">{userQuizData.breakdown.training || 0}</p>
                            <p className="text-xs text-muted-foreground">Трениране</p>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <p className="text-lg font-bold text-purple-600">{userQuizData.breakdown.sleepRecovery || 0}</p>
                            <p className="text-xs text-muted-foreground">Сън</p>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <p className="text-lg font-bold text-blue-600">{userQuizData.breakdown.context || 0}</p>
                            <p className="text-xs text-muted-foreground">Контекст</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quiz Responses - Individual Answers */}
                    {userQuizData.responses && userQuizData.responses.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Всички отговори от Quiz-a ({userQuizData.responses.length})
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6"
                            onClick={() => {
                              const el = document.getElementById('quiz-responses-list');
                              if (el) el.classList.toggle('hidden');
                            }}
                          >
                            Покажи/Скрий
                          </Button>
                        </div>
                        <div id="quiz-responses-list" className="hidden space-y-1 max-h-64 overflow-y-auto">
                          {userQuizData.responses.map((response, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                            >
                              <div className="flex-1">
                                <span className="text-muted-foreground text-xs font-mono">
                                  {response.question_id}
                                </span>
                                <p className="font-medium truncate">{response.answer}</p>
                              </div>
                              <Badge variant="outline" className="ml-2 shrink-0">
                                {response.points} т.
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-l-4 border-l-orange-400 bg-orange-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-700">Няма попълнен Quiz</h4>
                          <p className="text-sm text-muted-foreground">
                            Потребителят не е завършил Quiz-a за персонализирана програма
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-orange-400 text-orange-700 hover:bg-orange-100"
                        onClick={() => setSendReminderModal(true)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Изпрати напомняне
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Capsules Section with Edit */}
              <Card className="border-2 border-cyan-300 bg-cyan-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center">
                        <span className="text-2xl">💊</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">TestoUP Капсули</p>
                        {editingCapsules ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setNewCapsuleCount(Math.max(0, newCapsuleCount - 10))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              value={newCapsuleCount}
                              onChange={(e) => setNewCapsuleCount(parseInt(e.target.value) || 0)}
                              className="w-20 text-center font-bold text-xl"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setNewCapsuleCount(newCapsuleCount + 10)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-3xl font-bold text-cyan-700">
                            {loadingPurchases ? "..." : (userInventory?.capsulesRemaining || 0)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {editingCapsules ? (
                        <>
                          <Input
                            placeholder="Причина (опционално)"
                            value={capsuleReason}
                            onChange={(e) => setCapsuleReason(e.target.value)}
                            className="w-48"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleUpdateCapsules}
                              disabled={actionLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Запази"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCapsules(false)}
                            >
                              Отказ
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewCapsuleCount(userInventory?.capsulesRemaining || 0);
                            setEditingCapsules(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Редактирай
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Stats (Last 7 days) - Compact */}
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <p className="text-lg font-bold text-orange-600">{selectedUser.workoutCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Workout</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{selectedUser.mealCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Meal</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-600">{selectedUser.sleepCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Sleep</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{selectedUser.testoupCount || 0}</p>
                  <p className="text-xs text-muted-foreground">TestoUP</p>
                </div>
                <div className="text-center p-2 bg-indigo-50 rounded-lg">
                  <p className="text-lg font-bold text-indigo-600">{selectedUser.coachMessages || 0}</p>
                  <p className="text-xs text-muted-foreground">Coach</p>
                </div>
              </div>

              {/* Purchase History */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-green-500" />
                    История на покупките
                    {selectedUser.purchasesCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedUser.purchasesCount} поръчки • {selectedUser.totalSpent?.toFixed(2)} лв
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPurchases ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : userPurchases.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">Дата</th>
                            <th className="text-left p-2 font-medium">Продукт</th>
                            <th className="text-center p-2 font-medium">Капсули</th>
                            <th className="text-right p-2 font-medium">Сума</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userPurchases.map((purchase) => (
                            <tr key={purchase.id} className="border-b hover:bg-muted/30">
                              <td className="p-2">
                                {new Date(purchase.purchasedAt).toLocaleDateString("bg-BG", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="p-2">
                                <Badge variant={purchase.productType === "full" ? "default" : "secondary"}>
                                  {purchase.productName}
                                </Badge>
                              </td>
                              <td className="p-2 text-center font-mono">+{purchase.capsules}</td>
                              <td className="p-2 text-right font-semibold text-green-600">
                                {purchase.amount?.toFixed(2)} лв
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      Няма покупки
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* AI Coach Conversation Section */}
              {userCoachMessages.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-indigo-500" />
                      AI Coach разговори
                      <Badge variant="secondary" className="ml-2">
                        {userCoachMessages.length} съобщения
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                      {userCoachMessages.slice(0, 50).map((msg, index) => (
                        <div
                          key={msg.id || index}
                          className={`p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-blue-50 border-l-4 border-l-blue-500 ml-4"
                              : "bg-gray-50 border-l-4 border-l-indigo-500 mr-4"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={msg.role === "user" ? "default" : "secondary"}
                              className={`text-xs ${msg.role === "user" ? "bg-blue-600" : "bg-indigo-600"}`}
                            >
                              {msg.role === "user" ? "Потребител" : "AI Coach"}
                            </Badge>
                            {msg.is_proactive && (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-400">
                                Proactive
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(msg.created_at).toLocaleString("bg-BG", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap line-clamp-4">
                            {msg.content}
                          </p>
                        </div>
                      ))}
                      {userCoachMessages.length > 50 && (
                        <p className="text-center text-sm text-muted-foreground py-2">
                          ... и още {userCoachMessages.length - 50} съобщения
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activity Calendar (Last 90 Days) */}
              {userActivity && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Календар на активността (90 дни)
                    </CardTitle>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>Тренировка</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Хранене</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span>Сън</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>TestoUP</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Create date maps for quick lookup
                      const workoutDates = new Set(userActivity.workouts.map(w => w.date));
                      const mealDates = new Set(userActivity.meals.map(m => m.date));
                      const sleepDates = new Set(userActivity.sleep.map(s => s.date));
                      const testoupDates = new Set(userActivity.testoup.filter(t => t.morning_taken || t.evening_taken).map(t => t.date));

                      // Generate last 90 days
                      const days: { date: Date; dateStr: string }[] = [];
                      for (let i = 89; i >= 0; i--) {
                        const d = new Date();
                        d.setHours(0, 0, 0, 0);
                        d.setDate(d.getDate() - i);
                        days.push({
                          date: d,
                          dateStr: d.toISOString().split('T')[0]
                        });
                      }

                      // Group by weeks (7 days each row)
                      const weeks: typeof days[] = [];
                      for (let i = 0; i < days.length; i += 7) {
                        weeks.push(days.slice(i, i + 7));
                      }

                      return (
                        <div className="space-y-1">
                          {/* Day of week headers */}
                          <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground text-center mb-1">
                            <span>Пн</span>
                            <span>Вт</span>
                            <span>Ср</span>
                            <span>Чт</span>
                            <span>Пт</span>
                            <span>Сб</span>
                            <span>Нд</span>
                          </div>
                          {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="grid grid-cols-7 gap-1">
                              {week.map(({ date, dateStr }) => {
                                const hasWorkout = workoutDates.has(dateStr);
                                const hasMeal = mealDates.has(dateStr);
                                const hasSleep = sleepDates.has(dateStr);
                                const hasTestoup = testoupDates.has(dateStr);
                                const hasAny = hasWorkout || hasMeal || hasSleep || hasTestoup;
                                const isToday = dateStr === new Date().toISOString().split('T')[0];

                                return (
                                  <div
                                    key={dateStr}
                                    className={`relative p-1 rounded text-center min-h-[36px] flex flex-col items-center justify-center ${
                                      isToday ? 'ring-2 ring-primary' : ''
                                    } ${hasAny ? 'bg-muted/50' : 'bg-muted/20'}`}
                                    title={`${date.toLocaleDateString("bg-BG", { day: "2-digit", month: "short" })}
${hasWorkout ? '✓ Тренировка' : ''}
${hasMeal ? '✓ Хранене' : ''}
${hasSleep ? '✓ Сън' : ''}
${hasTestoup ? '✓ TestoUP' : ''}`}
                                  >
                                    <span className="text-[10px] text-muted-foreground">
                                      {date.getDate()}
                                    </span>
                                    {hasAny && (
                                      <div className="flex gap-[2px] mt-[2px]">
                                        {hasWorkout && <div className="w-[6px] h-[6px] rounded-full bg-orange-500"></div>}
                                        {hasMeal && <div className="w-[6px] h-[6px] rounded-full bg-green-500"></div>}
                                        {hasSleep && <div className="w-[6px] h-[6px] rounded-full bg-purple-500"></div>}
                                        {hasTestoup && <div className="w-[6px] h-[6px] rounded-full bg-blue-500"></div>}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Summary stats */}
                    <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{userActivity.workouts.length}</div>
                        <div className="text-[10px] text-muted-foreground">Тренировки</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{userActivity.meals.length}</div>
                        <div className="text-[10px] text-muted-foreground">Хранения</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{userActivity.sleep.length}</div>
                        <div className="text-[10px] text-muted-foreground">Сън дни</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{userActivity.testoup.filter(t => t.morning_taken || t.evening_taken).length}</div>
                        <div className="text-[10px] text-muted-foreground">TestoUP дни</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Status */}
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Статус</Label>
                  <div className="mt-1">
                    {selectedUser.banned ? (
                      <Badge variant="destructive">BANNED</Badge>
                    ) : selectedUser.hasAppAccess ? (
                      <Badge className="bg-green-600">App User</Badge>
                    ) : selectedUser.quizDate ? (
                      <Badge variant="secondary">Quiz User</Badge>
                    ) : (
                      <Badge variant="outline">Visitor</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Последна Активност</Label>
                  <p className="text-sm font-medium mt-1">{formatDate(selectedUser.lastActivity)}</p>
                </div>
                {userInventory?.lastPurchaseDate && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Последна покупка</Label>
                    <p className="text-sm font-medium mt-1">
                      {new Date(userInventory.lastPurchaseDate).toLocaleDateString("bg-BG")}
                    </p>
                  </div>
                )}
              </div>

              {/* User Info Section */}
              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">
                  Информация за потребителя
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      User ID
                    </Label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
                        {selectedUser.id || "N/A"}
                      </code>
                      {selectedUser.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard(selectedUser.id!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Създаден на
                    </Label>
                    <p className="text-sm">
                      {selectedUser.userCreatedAt
                        ? formatDate(selectedUser.userCreatedAt)
                        : "N/A"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Email Verified
                    </Label>
                    <div>
                      {selectedUser.emailVerified ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="w-3 h-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PRO Status Section */}
              {selectedUser.protocolStartDatePro && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">
                      PRO Status
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserDetailModal(false);
                        setRevokeProReason("");
                        setRevokeProModal(true);
                      }}
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Премахни PRO
                    </Button>
                  </div>
                  <Card className="border-yellow-500/30 bg-yellow-500/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Crown className="w-8 h-8 text-yellow-500" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">Testograph PRO</h4>
                            <Badge variant="default" className="bg-yellow-600">
                              Active
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            28-дневна програма за оптимизация на тестостерона
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Започнат на
                          </Label>
                          <p className="text-sm font-medium">
                            {new Date(
                              selectedUser.protocolStartDatePro,
                            ).toLocaleDateString("bg-BG")}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Дни изминали
                          </Label>
                          <p className="text-sm font-medium text-primary">
                            {
                              calculateProDays(
                                selectedUser.protocolStartDatePro,
                              ).daysElapsed
                            }{" "}
                            дни
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Остават
                          </Label>
                          <p className="text-sm font-medium">
                            {
                              calculateProDays(
                                selectedUser.protocolStartDatePro,
                              ).daysRemaining
                            }{" "}
                            дни
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Apps Access Section */}
              {selectedUser.activeApps &&
                selectedUser.activeApps.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-semibold">
                        Достъп до приложения ({selectedUser.activeApps.length})
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUserDetailModal(false);
                          setSelectedApp("");
                          setAppAmount("0");
                          setAddAppModal(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Добави App
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedUser.activeApps.map((app) => (
                        <Card key={app} className="border-green-500/30">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {app === "meal-planner" && "Meal Planner"}
                                  {app === "sleep-protocol" && "Sleep Protocol"}
                                  {app === "supplement-timing" &&
                                    "Supplement Timing"}
                                  {app === "exercise-guide" && "Exercise Guide"}
                                  {app === "lab-testing" && "Lab Testing"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {app}
                                </p>
                              </div>
                              <Badge
                                variant="default"
                                className="bg-green-600 flex-shrink-0"
                              >
                                Active
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {/* Ban Details Section */}
              {selectedUser.banned && selectedUser.banInfo && (
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold mb-3 block">
                    Ban Information
                  </Label>
                  <Card className="border-red-500/30 bg-red-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Причина
                            </Label>
                            <p className="text-sm">
                              {selectedUser.banInfo.reason}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Блокиран на
                              </Label>
                              <p className="text-sm">
                                {formatDate(selectedUser.banInfo.bannedAt)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Блокиран от
                              </Label>
                              <p className="text-sm">
                                {selectedUser.banInfo.bannedBy}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Inventory Summary */}
              {userInventory && (
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold mb-3 block">
                    Текущ баланс (Inventory)
                  </Label>
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {userInventory.capsulesRemaining}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Капсули (остават)
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {userInventory.totalBottles}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Бутилки (общо)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {userInventory.lastPurchaseDate
                              ? formatDate(userInventory.lastPurchaseDate)
                              : "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Последна покупка
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Purchases History */}
              {selectedUser.purchasesCount > 0 && (
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold mb-3 block">
                    История на покупките ({selectedUser.purchasesCount})
                  </Label>

                  {loadingPurchases ? (
                    <div className="flex items-center justify-center py-6 sm:py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : userPurchases.length > 0 ? (
                    <div className="space-y-3">
                      {userPurchases.map((purchase) => (
                        <Card
                          key={purchase.id}
                          className="border-l-4 border-l-green-500"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <ShoppingBag className="w-4 h-4 text-green-600" />
                                  <h4 className="font-semibold">
                                    {purchase.productName}
                                  </h4>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {purchase.productType}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-medium">Сума:</span>{" "}
                                    <span className="text-green-600 font-semibold">
                                      {purchase.amount} лв
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Бутилки:</span>{" "}
                                    <span className="font-semibold">
                                      {purchase.bottles || 0}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Капсули:</span>{" "}
                                    <span className="font-semibold text-blue-600">
                                      {purchase.capsules || 0}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Статус:</span>{" "}
                                    <Badge
                                      variant="default"
                                      className="bg-green-600"
                                    >
                                      {purchase.status === "paid" ? "Платено" : purchase.status}
                                    </Badge>
                                  </div>
                                  <div className="col-span-2 sm:col-span-4">
                                    <span className="font-medium">Дата:</span>{" "}
                                    {formatDate(purchase.purchasedAt)}
                                    {purchase.orderId && (
                                      <span className="ml-2 text-xs text-gray-400">
                                        (Order: {purchase.orderId})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      Няма данни за покупки
                    </p>
                  )}
                </div>
              )}

              {/* Admin Actions */}
              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">
                  Admin Действия
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUserDetailModal(false);
                      openGrantProModal(selectedUser);
                    }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Дай PRO Достъп
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUserDetailModal(false);
                      setNewPassword("");
                      setResetPasswordModal(true);
                    }}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Промени Парола
                  </Button>

                  {selectedUser.banned ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserDetailModal(false);
                        setUnbanUserModal(true);
                      }}
                    >
                      <CheckSquare className="w-4 w-4 mr-2" />
                      Разблокирай
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserDetailModal(false);
                        setBanReason("");
                        setBanUserModal(true);
                      }}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Блокирай
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUserDetailModal(false);
                      setEditName(
                        selectedUser.name || selectedUser.firstName || "",
                      );
                      setEditAvatar(selectedUser.avatar || "");
                      setEditProfileModal(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Редактирай Профил
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setUserDetailModal(false);
                      setDeleteConfirmEmail("");
                      setDeleteUserModal(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Изтрий Потребител
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Quiz Reminder Modal */}
      <Dialog open={sendReminderModal} onOpenChange={setSendReminderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-600" />
              Изпрати Quiz напомняне
            </DialogTitle>
            <DialogDescription>
              Ще изпратим email с напомняне на потребителя да завърши Quiz-a.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800 mb-2">
                <strong>Получател:</strong> {selectedUser?.email}
              </p>
              <p className="text-sm text-orange-800 mb-2">
                <strong>Тема:</strong> Напомняне: Завърши своя Quiz в Testograph
              </p>
              <p className="text-xs text-muted-foreground">
                Съобщението включва линк към Quiz-a и информация за ползите от персонализираната програма.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSendReminderModal(false)}
              disabled={sendingReminder}
            >
              Отказ
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleSendQuizReminder}
              disabled={sendingReminder}
            >
              {sendingReminder ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Изпращане...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Изпрати напомняне
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
