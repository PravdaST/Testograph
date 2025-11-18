'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getCurrentAdminUser } from '@/lib/admin/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Minus
} from 'lucide-react';
import { exportToCSV } from '@/lib/utils/exportToCSV';
import { useToast } from '@/hooks/use-toast';

interface User {
  id?: string;
  email: string;
  firstName?: string;
  chatSessions: number;
  funnelAttempts: number;
  converted: boolean;
  lastActivity: string;
  purchasesCount: number;
  totalSpent: number;
  latestPurchase?: string;
  banned?: boolean;
  name?: string;
  avatar?: string;
  // New fields from enhanced API
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
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Admin user authentication
  const [adminId, setAdminId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailModal, setUserDetailModal] = useState(false);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [grantProModal, setGrantProModal] = useState(false);
  const [revokeProModal, setRevokeProModal] = useState(false);
  const [addAppModal, setAddAppModal] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [banUserModal, setBanUserModal] = useState(false);
  const [unbanUserModal, setUnbanUserModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [deleteUserModal, setDeleteUserModal] = useState(false);

  // Form states
  const [proStartDate, setProStartDate] = useState('');
  const [revokeProReason, setRevokeProReason] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [appAmount, setAppAmount] = useState('0');
  const [newPassword, setNewPassword] = useState('');
  const [banReason, setBanReason] = useState('');
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  // Fetch admin user on mount
  useEffect(() => {
    const fetchAdminUser = async () => {
      const { adminUser, userId, email } = await getCurrentAdminUser();
      if (adminUser) {
        setAdminId(userId);
        setAdminEmail(email);
      } else {
        // Not authenticated as admin - redirect to login
        router.push('/admin/login');
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
  }, [userDetailModal, selectedUser]);

  const fetchUserPurchases = async (email: string) => {
    setLoadingPurchases(true);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}`);
      const data = await response.json();

      if (response.ok && data.purchases) {
        setUserPurchases(data.purchases);

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
      console.error('Error fetching user purchases:', error);
      toast({
        title: 'Грешка',
        description: 'Не успя да се заредят покупките',
        variant: 'destructive',
      });
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/users?${params}`);
      const data: UsersResponse = await response.json();

      if (response.ok) {
        // Fetch full user details (including userId and banned status)
        const usersWithDetails = await Promise.all(
          data.users.map(async (user) => {
            try {
              const detailsRes = await fetch(`/api/admin/users/${encodeURIComponent(user.email)}`);
              const details = await detailsRes.json();
              return {
                ...user,
                id: details.userId,
                banned: details.banned || false,
                name: details.profile?.name,
                avatar: details.profile?.avatar
              };
            } catch (error) {
              console.error(`Error fetching details for ${user.email}:`, error);
              return user;
            }
          })
        );
        setUsers(usersWithDetails);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Грешка',
        description: 'Не успя да се заредят потребителите',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Сега';
    if (diffMins < 60) return `Преди ${diffMins} мин`;
    if (diffHours < 24) return `Преди ${diffHours} час${diffHours === 1 ? '' : 'а'}`;
    if (diffDays < 30) return `Преди ${diffDays} ден${diffDays === 1 ? '' : 'и'}`;
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
      title: 'Копирано',
      description: 'Текстът е копиран в клипборда',
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleExport = () => {
    const exportData = users.map((user) => ({
      Email: user.email,
      'First Name': user.firstName || 'N/A',
      'Chat Sessions': user.chatSessions,
      'Funnel Attempts': user.funnelAttempts,
      'Converted': user.converted ? 'Yes' : 'No',
      'Last Activity': formatDate(user.lastActivity),
      'Banned': user.banned ? 'Yes' : 'No',
    }));

    exportToCSV(exportData, `users-${new Date().toISOString().split('T')[0]}`);
  };

  const openGrantProModal = (user: User) => {
    setSelectedUser(user);
    setProStartDate(new Date().toISOString().split('T')[0]);
    setGrantProModal(true);
  };

  const handleGrantPro = async () => {
    if (!selectedUser?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/access/grant-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          title: 'Успех',
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
        title: 'Грешка',
        description: error.message || 'Неуспешно даване на PRO достъп',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokePro = async () => {
    if (!selectedUser?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/access/revoke-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          title: 'Успех',
          description: data.message,
        });
        setRevokeProModal(false);
        setRevokeProReason('');
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
        title: 'Грешка',
        description: error.message || 'Неуспешно премахване на PRO достъп',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAppAccess = async () => {
    if (!selectedUser?.id || !selectedApp) return;

    const appNames: Record<string, string> = {
      'meal-planner': 'Meal Planner',
      'sleep-protocol': 'Sleep Protocol',
      'supplement-timing': 'Supplement Timing Guide',
      'exercise-guide': 'Exercise Reference Guide',
      'lab-testing': 'Lab Testing Guide',
    };

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/access/create-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          productName: appNames[selectedApp] || selectedApp,
          productType: 'digital',
          appsIncluded: [selectedApp],
          amount: parseFloat(appAmount),
          currency: 'BGN',
          status: 'completed',
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех',
          description: data.message,
        });
        setAddAppModal(false);
        setSelectedApp('');
        setAppAmount('0');
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
        title: 'Грешка',
        description: error.message || 'Неуспешно добавяне на достъп до приложение',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser?.id || !newPassword) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          title: 'Успех',
          description: data.message,
        });
        setResetPasswordModal(false);
        setNewPassword('');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешна промяна на парола',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          title: 'Успех',
          description: data.message,
        });
        setBanUserModal(false);
        setBanReason('');
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно блокиране на потребител',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUser?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех',
          description: data.message,
        });
        setUnbanUserModal(false);
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно разблокиране на потребител',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (!selectedUser?.id) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/edit-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
          title: 'Успех',
          description: data.message,
        });
        setEditProfileModal(false);
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно редактиране на профил',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?.id || !deleteConfirmEmail) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
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
          title: 'Успех',
          description: data.message,
        });
        setDeleteUserModal(false);
        setDeleteConfirmEmail('');
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно изтриване на потребител',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Потребители</h1>
          <p className="text-muted-foreground mt-2">
            Преглед на всички потребители и тяхната активност
          </p>
        </div>

        {/* Stats Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Общо Потребители
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Конвертирали
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.converted).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  С Chat Сесии
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.chatSessions > 0).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  През Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.funnelAttempts > 0).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  С Покупки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.purchasesCount > 0).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Общо Приходи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {users.reduce((sum, u) => sum + (u.totalSpent || 0), 0).toFixed(2)} лв
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Всички Потребители</CardTitle>
                <CardDescription>
                  Общо {users.length} {users.length === 1 ? 'потребител' : 'потребители'}
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
                  disabled={users.length === 0}
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
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {search ? 'Няма намерени потребители' : 'Още няма потребители'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {users.map((user) => (
                  <Card
                    key={user.email}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      setSelectedUser(user);
                      setUserDetailModal(true);
                    }}
                  >
                    <CardContent className="p-4">
                      {/* User Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {user.name || user.firstName || user.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Services Badges */}
                      <div className="space-y-2 mb-3">
                        {/* Chat Sessions */}
                        {user.chatSessions > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-blue-500" />
                              <span className="text-muted-foreground">Chat</span>
                            </div>
                            <Badge variant="secondary">{user.chatSessions}</Badge>
                          </div>
                        )}

                        {/* Funnel Attempts */}
                        {user.funnelAttempts > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-orange-500" />
                              <span className="text-muted-foreground">Funnel</span>
                            </div>
                            <Badge variant="secondary">{user.funnelAttempts}</Badge>
                          </div>
                        )}

                        {/* Purchases */}
                        {user.purchasesCount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-green-500" />
                              <span className="text-muted-foreground">Покупки</span>
                            </div>
                            <Badge variant="default" className="bg-green-600">
                              {user.purchasesCount} ({user.totalSpent.toFixed(2)} лв)
                            </Badge>
                          </div>
                        )}

                        {/* PRO Access - TODO: Add hasPro check */}
                        {/* {user.hasPro && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-yellow-500" />
                              <span className="text-muted-foreground">PRO</span>
                            </div>
                            <Badge variant="default" className="bg-yellow-600">Active</Badge>
                          </div>
                        )} */}
                      </div>

                      {/* Status & Last Activity */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {getRelativeTime(user.lastActivity)}
                        </div>
                        {user.banned ? (
                          <Badge variant="destructive" className="text-xs">BANNED</Badge>
                        ) : user.converted ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
                <option value="supplement-timing">Supplement Timing Guide</option>
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
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
              <Label htmlFor="new-password">Нова Парола (минимум 8 символа)</Label>
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
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
              Това действие е необратимо! Всички данни на потребителя ще бъдат изтрити.
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
                Потвърдете като въведете: <span className="font-mono">{selectedUser?.email}</span>
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
              disabled={actionLoading || deleteConfirmEmail !== selectedUser?.email}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
                  {selectedUser?.name || selectedUser?.firstName || selectedUser?.email.split('@')[0]}
                </p>
                <p className="text-sm text-muted-foreground font-normal">
                  {selectedUser?.email}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Преглед на подробна информация за потребителя и управление на достъпа
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{selectedUser.chatSessions}</p>
                        <p className="text-xs text-muted-foreground">Chat Сесии</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-2xl font-bold">{selectedUser.funnelAttempts}</p>
                        <p className="text-xs text-muted-foreground">Funnel Опити</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{selectedUser.purchasesCount}</p>
                        <p className="text-xs text-muted-foreground">Покупки</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {selectedUser.totalSpent.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Общо (лв)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status & Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <div className="flex items-center gap-2">
                    {selectedUser.banned ? (
                      <Badge variant="destructive">🚫 BANNED</Badge>
                    ) : selectedUser.converted ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Конвертирал
                      </Badge>
                    ) : (
                      <Badge variant="outline">Не е конвертирал</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Последна Активност</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedUser.lastActivity)}
                  </p>
                </div>
              </div>

              {/* User Info Section */}
              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">Информация за потребителя</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">User ID</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
                        {selectedUser.id || 'N/A'}
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
                    <Label className="text-xs text-muted-foreground">Създаден на</Label>
                    <p className="text-sm">
                      {selectedUser.userCreatedAt ? formatDate(selectedUser.userCreatedAt) : 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Email Verified</Label>
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
                    <Label className="text-base font-semibold">PRO Status</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserDetailModal(false);
                        setRevokeProReason('');
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
                            <Badge variant="default" className="bg-yellow-600">Active</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            28-дневна програма за оптимизация на тестостерона
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Започнат на</Label>
                          <p className="text-sm font-medium">
                            {new Date(selectedUser.protocolStartDatePro).toLocaleDateString('bg-BG')}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Дни изминали</Label>
                          <p className="text-sm font-medium text-primary">
                            {calculateProDays(selectedUser.protocolStartDatePro).daysElapsed} дни
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Остават</Label>
                          <p className="text-sm font-medium">
                            {calculateProDays(selectedUser.protocolStartDatePro).daysRemaining} дни
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Apps Access Section */}
              {selectedUser.activeApps && selectedUser.activeApps.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Достъп до приложения ({selectedUser.activeApps.length})</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserDetailModal(false);
                        setSelectedApp('');
                        setAppAmount('0');
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
                                {app === 'meal-planner' && 'Meal Planner'}
                                {app === 'sleep-protocol' && 'Sleep Protocol'}
                                {app === 'supplement-timing' && 'Supplement Timing'}
                                {app === 'exercise-guide' && 'Exercise Guide'}
                                {app === 'lab-testing' && 'Lab Testing'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{app}</p>
                            </div>
                            <Badge variant="default" className="bg-green-600 flex-shrink-0">
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
                  <Label className="text-base font-semibold mb-3 block">Ban Information</Label>
                  <Card className="border-red-500/30 bg-red-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Причина</Label>
                            <p className="text-sm">{selectedUser.banInfo.reason}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Блокиран на</Label>
                              <p className="text-sm">{formatDate(selectedUser.banInfo.bannedAt)}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Блокиран от</Label>
                              <p className="text-sm">{selectedUser.banInfo.bannedBy}</p>
                            </div>
                          </div>
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
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : userPurchases.length > 0 ? (
                    <div className="space-y-3">
                      {userPurchases.map((purchase) => (
                        <Card key={purchase.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <ShoppingBag className="w-4 h-4 text-green-600" />
                                  <h4 className="font-semibold">{purchase.productName}</h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {purchase.productType}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-medium">Сума:</span>{' '}
                                    <span className="text-green-600 font-semibold">
                                      {purchase.amount} {purchase.currency}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Статус:</span>{' '}
                                    <Badge
                                      variant={purchase.status === 'completed' ? 'default' : 'outline'}
                                      className={purchase.status === 'completed' ? 'bg-green-600' : ''}
                                    >
                                      {purchase.status}
                                    </Badge>
                                  </div>
                                  {purchase.appsIncluded && purchase.appsIncluded.length > 0 && (
                                    <div className="col-span-2">
                                      <span className="font-medium">Apps:</span>{' '}
                                      {purchase.appsIncluded.join(', ')}
                                    </div>
                                  )}
                                  <div className="col-span-2">
                                    <span className="font-medium">Дата:</span>{' '}
                                    {formatDate(purchase.purchasedAt)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">Няма данни за покупки</p>
                  )}
                </div>
              )}

              {/* Admin Actions */}
              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">Admin Действия</Label>
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
                      setNewPassword('');
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
                        setBanReason('');
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
                      setEditName(selectedUser.name || selectedUser.firstName || '');
                      setEditAvatar(selectedUser.avatar || '');
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
                      setDeleteConfirmEmail('');
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
    </AdminLayout>
  );
}
