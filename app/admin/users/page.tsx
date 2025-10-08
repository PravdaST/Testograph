'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  AlertTriangle
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
}

interface UsersResponse {
  users: User[];
  total: number;
}

// Hardcoded admin credentials (should come from auth session in production)
const ADMIN_ID = 'e4ea078b-30b2-4347-801f-6d26a87318b6';
const ADMIN_EMAIL = 'admin@testograph.eu';

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [grantProModal, setGrantProModal] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [banUserModal, setBanUserModal] = useState(false);
  const [unbanUserModal, setUnbanUserModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [deleteUserModal, setDeleteUserModal] = useState(false);

  // Form states
  const [proStartDate, setProStartDate] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [banReason, setBanReason] = useState('');
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

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
          adminId: ADMIN_ID,
          adminEmail: ADMIN_EMAIL,
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
          adminId: ADMIN_ID,
          adminEmail: ADMIN_EMAIL,
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
          adminId: ADMIN_ID,
          adminEmail: ADMIN_EMAIL,
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
          adminId: ADMIN_ID,
          adminEmail: ADMIN_EMAIL,
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
          adminId: ADMIN_ID,
          adminEmail: ADMIN_EMAIL,
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
          adminId: ADMIN_ID,
          adminEmail: ADMIN_EMAIL,
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Име</TableHead>
                      <TableHead className="text-center">Chat Сесии</TableHead>
                      <TableHead className="text-center">Funnel Опити</TableHead>
                      <TableHead className="text-center">Покупки</TableHead>
                      <TableHead className="text-right">Общо Платено</TableHead>
                      <TableHead className="text-center">Статус</TableHead>
                      <TableHead>Последна Активност</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.email}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {user.firstName || user.name || (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{user.chatSessions}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{user.funnelAttempts}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={user.purchasesCount > 0 ? "default" : "outline"}
                            className={user.purchasesCount > 0 ? "bg-green-600" : ""}
                          >
                            {user.purchasesCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={user.totalSpent > 0 ? "font-semibold text-green-600" : "text-muted-foreground"}>
                            {user.totalSpent > 0 ? `${user.totalSpent.toFixed(2)} лв` : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {user.banned ? (
                            <Badge variant="destructive">BANNED</Badge>
                          ) : user.converted ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.lastActivity)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Действия</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openGrantProModal(user)}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Дай PRO Достъп
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewPassword('');
                                  setResetPasswordModal(true);
                                }}
                              >
                                <Key className="h-4 w-4 mr-2" />
                                Промени Парола
                              </DropdownMenuItem>
                              {user.banned ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setUnbanUserModal(true);
                                  }}
                                >
                                  <CheckSquare className="h-4 w-4 mr-2" />
                                  Разблокирай
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setBanReason('');
                                    setBanUserModal(true);
                                  }}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Блокирай
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditName(user.name || user.firstName || '');
                                  setEditAvatar(user.avatar || '');
                                  setEditProfileModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Редактирай Профил
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteConfirmEmail('');
                                  setDeleteUserModal(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Изтрий Потребител
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
    </AdminLayout>
  );
}
