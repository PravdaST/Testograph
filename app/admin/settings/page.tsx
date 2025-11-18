'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getCurrentAdminUser } from '@/lib/admin/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings as SettingsIcon,
  Shield,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  Search,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Admin {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'viewer';
  permissions: string[];
  created_at: string;
  created_by: string | null;
  last_active_at: string | null;
  notes: string | null;
}

interface User {
  id: string;
  email: string;
}

const ALL_PERMISSIONS = [
  { value: 'manage_users', label: 'Управление на потребители' },
  { value: 'manage_purchases', label: 'Управление на покупки' },
  { value: 'view_analytics', label: 'Преглед на анализи' },
  { value: 'send_emails', label: 'Изпращане на emails' },
  { value: 'manage_pro_access', label: 'Управление на PRO достъп' },
  { value: 'manage_admins', label: 'Управление на админи' },
  { value: 'view_audit_logs', label: 'Преглед на audit logs' },
  { value: 'manage_app_data', label: 'Управление на app данни' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Admin user authentication
  const [adminId, setAdminId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Add Admin Modal
  const [addAdminModal, setAddAdminModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'viewer'>('admin');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [adminNotes, setAdminNotes] = useState('');

  // Edit Role Modal
  const [editRoleModal, setEditRoleModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [newRole, setNewRole] = useState<'superadmin' | 'admin' | 'viewer'>('admin');

  // Edit Permissions Modal
  const [editPermissionsModal, setEditPermissionsModal] = useState(false);
  const [newPermissions, setNewPermissions] = useState<Set<string>>(new Set());

  // Remove Admin Modal
  const [removeAdminModal, setRemoveAdminModal] = useState(false);

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
      fetchAdmins();
      fetchAllUsers();
    }
  }, [adminId, adminEmail]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/settings/admins');
      const data = await response.json();

      if (response.ok) {
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/admin/access/users');
      const data = await response.json();

      if (response.ok) {
        setAllUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedUserId || selectedPermissions.size === 0) {
      toast({
        title: 'Грешка',
        description: 'Моля изберете потребител и поне 1 permission',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings/admins/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
          permissions: Array.from(selectedPermissions),
          notes: adminNotes || undefined,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: data.message,
        });
        setAddAdminModal(false);
        setSelectedUserId('');
        setSelectedRole('admin');
        setSelectedPermissions(new Set());
        setAdminNotes('');
        fetchAdmins();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно добавяне на админ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = async () => {
    if (!editingAdmin) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings/admins/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingAdmin.id,
          role: newRole,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: data.message,
        });
        setEditRoleModal(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешна промяна на роля',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPermissions = async () => {
    if (!editingAdmin || newPermissions.size === 0) {
      toast({
        title: 'Грешка',
        description: 'Изберете поне 1 permission',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings/admins/update-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingAdmin.id,
          permissions: Array.from(newPermissions),
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: data.message,
        });
        setEditPermissionsModal(false);
        setEditingAdmin(null);
        setNewPermissions(new Set());
        fetchAdmins();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешна промяна на permissions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!editingAdmin) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings/admins/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingAdmin.id,
          adminId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: data.message,
        });
        setRemoveAdminModal(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно премахване на админ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditRoleModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setNewRole(admin.role);
    setEditRoleModal(true);
  };

  const openEditPermissionsModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setNewPermissions(new Set(admin.permissions));
    setEditPermissionsModal(true);
  };

  const openRemoveAdminModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setRemoveAdminModal(true);
  };

  const togglePermission = (permission: string) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permission)) {
      newSet.delete(permission);
    } else {
      newSet.add(permission);
    }
    setSelectedPermissions(newSet);
  };

  const toggleEditPermission = (permission: string) => {
    const newSet = new Set(newPermissions);
    if (newSet.has(permission)) {
      newSet.delete(permission);
    } else {
      newSet.add(permission);
    }
    setNewPermissions(newSet);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-600';
      case 'admin': return 'bg-blue-600';
      case 'viewer': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const filteredAdmins = admins.filter(admin =>
    searchQuery === '' ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter out users who are already admins
  const availableUsers = allUsers.filter(user =>
    !admins.some(admin => admin.id === user.id)
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Настройки
          </h1>
          <p className="text-muted-foreground mt-2">
            Управление на админ потребители и permissions
          </p>
        </div>

        {/* Admin Management Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Админ Потребители</CardTitle>
                <CardDescription>
                  Управление на админ достъп и permissions
                </CardDescription>
              </div>
              <Button onClick={() => setAddAdminModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Добави Админ
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Търси админи..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Admins Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Роля</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Последна активност</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Няма намерени админи
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-600" />
                            {admin.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(admin.role)}>
                            {admin.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {admin.permissions.slice(0, 3).map((perm) => (
                              <Badge key={perm} variant="outline" className="text-xs">
                                {ALL_PERMISSIONS.find(p => p.value === perm)?.label || perm}
                              </Badge>
                            ))}
                            {admin.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{admin.permissions.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {admin.last_active_at
                            ? new Date(admin.last_active_at).toLocaleString('bg-BG')
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Действия</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEditRoleModal(admin)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Промени Роля
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditPermissionsModal(admin)}>
                                <Shield className="h-4 w-4 mr-2" />
                                Промени Permissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openRemoveAdminModal(admin)}
                                className="text-red-600"
                                disabled={admin.id === adminId}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Премахни Админ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Важна Информация за Roles и Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 text-sm space-y-2">
            <p><strong>Superadmin:</strong> Пълен достъп, включително управление на други админи</p>
            <p><strong>Admin:</strong> Може да управлява потребители, покупки, изпраща emails</p>
            <p><strong>Viewer:</strong> Само преглед на данни в админ панела</p>
            <p className="pt-2">• Superadmin има автоматично всички permissions</p>
            <p>• Не можете да промените вашата собствена роля или permissions</p>
            <p>• Не можете да премахнете последния superadmin</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Admin Modal */}
      <Dialog open={addAdminModal} onOpenChange={setAddAdminModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добави Нов Админ</DialogTitle>
            <DialogDescription>
              Изберете потребител и конфигурирайте неговия достъп
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Потребител</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете потребител" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Роля</Label>
              <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                {ALL_PERMISSIONS.map((perm) => (
                  <div key={perm.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedPermissions.has(perm.value)}
                      onCheckedChange={() => togglePermission(perm.value)}
                    />
                    <label className="text-sm cursor-pointer">
                      {perm.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Бележки (опционално)</Label>
              <Input
                placeholder="Напр. Временен достъп за проект X"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdminModal(false)}>
              Отказ
            </Button>
            <Button onClick={handleAddAdmin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Добавяне...
                </>
              ) : (
                'Добави Админ'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={editRoleModal} onOpenChange={setEditRoleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Промени Роля</DialogTitle>
            <DialogDescription>
              Променете ролята на {editingAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Нова Роля</Label>
              <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleModal(false)}>
              Отказ
            </Button>
            <Button onClick={handleEditRole} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Запазване...
                </>
              ) : (
                'Запази'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Modal */}
      <Dialog open={editPermissionsModal} onOpenChange={setEditPermissionsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Промени Permissions</DialogTitle>
            <DialogDescription>
              Променете permissions на {editingAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg max-h-96 overflow-y-auto">
              {ALL_PERMISSIONS.map((perm) => (
                <div key={perm.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={newPermissions.has(perm.value)}
                    onCheckedChange={() => toggleEditPermission(perm.value)}
                  />
                  <label className="text-sm cursor-pointer">
                    {perm.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPermissionsModal(false)}>
              Отказ
            </Button>
            <Button onClick={handleEditPermissions} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Запазване...
                </>
              ) : (
                'Запази'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Admin Modal */}
      <Dialog open={removeAdminModal} onOpenChange={setRemoveAdminModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Премахни Админ</DialogTitle>
            <DialogDescription>
              Сигурни ли сте, че искате да премахнете админ достъпа на {editingAdmin?.email}?
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Внимание:</strong> Това действие ще премахне всички админ права на потребителя.
              Той няма да има достъп до админ панела.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveAdminModal(false)}>
              Отказ
            </Button>
            <Button variant="destructive" onClick={handleRemoveAdmin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Премахване...
                </>
              ) : (
                'Премахни Админ'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
