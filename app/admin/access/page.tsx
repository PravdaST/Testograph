'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, ShieldOff, Plus, Edit, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { SearchBar } from '@/components/admin/SearchBar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  email: string;
  name: string | null;
  protocol_start_date_pro: string | null;
}

interface Purchase {
  id: string;
  user_id: string;
  userEmail: string; // Changed from user_email to match API response
  userName?: string | null;
  product_name: string;
  product_type: string;
  apps_included: string[];
  amount: number;
  currency: string;
  status: string;
  purchased_at: string;
}

export default function AccessControlPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Purchases state
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseSearch, setPurchaseSearch] = useState('');

  // Modal states
  const [grantProModal, setGrantProModal] = useState(false);
  const [revokeProModal, setRevokeProModal] = useState(false);
  const [createPurchaseModal, setCreatePurchaseModal] = useState(false);
  const [editPurchaseModal, setEditPurchaseModal] = useState(false);

  // Selected items
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Form states
  const [proStartDate, setProStartDate] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Purchase form
  const [purchaseForm, setPurchaseForm] = useState({
    productName: '',
    productType: 'testograph-app',
    appsIncluded: [] as string[],
    amount: '',
    currency: 'BGN',
    status: 'completed'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (adminUser) {
      fetchUsers();
      fetchPurchases();
    }
  }, [adminUser]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/admin');
      return;
    }
    setAdminUser(user);
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/access/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/admin/purchases');
      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleGrantPro = async () => {
    if (!selectedUser || !proStartDate) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/access/grant-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          startDate: proStartDate,
          adminId: adminUser.id,
          adminEmail: adminUser.email
        })
      });

      if (!response.ok) throw new Error('Failed to grant PRO access');

      await fetchUsers();
      setGrantProModal(false);
      setProStartDate('');
      alert('✅ PRO достъп даден успешно!');
    } catch (error) {
      alert('❌ Грешка при даване на PRO достъп');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokePro = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/access/revoke-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason: revokeReason,
          adminId: adminUser.id,
          adminEmail: adminUser.email
        })
      });

      if (!response.ok) throw new Error('Failed to revoke PRO access');

      await fetchUsers();
      setRevokeProModal(false);
      setRevokeReason('');
      alert('✅ PRO достъп премахнат успешно!');
    } catch (error) {
      alert('❌ Грешка при премахване на PRO достъп');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePurchase = async () => {
    if (!selectedUser || !purchaseForm.productName || !purchaseForm.amount) {
      alert('Моля попълнете всички задължителни полета');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/access/create-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          ...purchaseForm,
          adminId: adminUser.id,
          adminEmail: adminUser.email
        })
      });

      if (!response.ok) throw new Error('Failed to create purchase');

      await fetchPurchases();
      setCreatePurchaseModal(false);
      setPurchaseForm({
        productName: '',
        productType: 'testograph-app',
        appsIncluded: [],
        amount: '',
        currency: 'BGN',
        status: 'completed'
      });
      alert('✅ Покупката е създадена успешно!');
    } catch (error) {
      alert('❌ Грешка при създаване на покупка');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    searchQuery === '' ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPurchases = purchases.filter(purchase =>
    purchaseSearch === '' ||
    purchase.user_email.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
    purchase.product_name.toLowerCase().includes(purchaseSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Access Control</h1>
          <p className="text-muted-foreground mt-2">
            Управление на PRO достъп и покупки
          </p>
        </div>

        {/* PRO Access Management */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">PRO Access Management</CardTitle>
                <CardDescription>
                  Управление на Testograph PRO достъп за потребители
                </CardDescription>
              </div>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Търси потребител..."
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Име</TableHead>
                    <TableHead>PRO Status</TableHead>
                    <TableHead>Начална Дата</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.name || '—'}</TableCell>
                      <TableCell>
                        {user.protocol_start_date_pro ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Активен
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Няма достъп
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.protocol_start_date_pro || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.protocol_start_date_pro ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setRevokeProModal(true);
                            }}
                          >
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Премахни PRO
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setProStartDate(new Date().toISOString().split('T')[0]);
                              setGrantProModal(true);
                            }}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Дай PRO
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Management */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Purchase Management</CardTitle>
                <CardDescription>
                  Управление на покупки и app достъп
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <SearchBar
                  value={purchaseSearch}
                  onChange={setPurchaseSearch}
                  placeholder="Търси покупка..."
                  className="w-64"
                />
                <Button
                  onClick={() => {
                    setSelectedUser(null);
                    setCreatePurchaseModal(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Нова Покупка
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Продукт</TableHead>
                    <TableHead>Apps</TableHead>
                    <TableHead>Сума</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map(purchase => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.userEmail}</TableCell>
                      <TableCell>{purchase.product_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {purchase.apps_included.slice(0, 2).map(app => (
                            <Badge key={app} variant="outline" className="text-xs">
                              {app}
                            </Badge>
                          ))}
                          {purchase.apps_included.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{purchase.apps_included.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{purchase.amount} {purchase.currency}</TableCell>
                      <TableCell>
                        <Badge
                          variant={purchase.status === 'completed' ? 'default' : 'secondary'}
                          className={purchase.status === 'completed' ? 'bg-green-600' : ''}
                        >
                          {purchase.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(purchase.purchased_at).toLocaleDateString('bg-BG')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPurchase(purchase);
                            setEditPurchaseModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Grant PRO Modal */}
        <Dialog open={grantProModal} onOpenChange={setGrantProModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Дай PRO Достъп</DialogTitle>
              <DialogDescription>
                Потребител: {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Начална Дата</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={proStartDate}
                  onChange={(e) => setProStartDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGrantProModal(false)}>
                Откажи
              </Button>
              <Button onClick={handleGrantPro} disabled={isSubmitting || !proStartDate}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  'Дай Достъп'
                )}
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
                Потребител: {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Причина (опционално)</Label>
                <Textarea
                  id="reason"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Напр.: Истекъл абонамент, Request от потребител..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRevokeProModal(false)}>
                Откажи
              </Button>
              <Button variant="destructive" onClick={handleRevokePro} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  'Премахни Достъп'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Purchase Modal */}
        <Dialog open={createPurchaseModal} onOpenChange={setCreatePurchaseModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Създай Ръчна Покупка</DialogTitle>
              <DialogDescription>
                Добави покупка за даване на app достъп
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Потребител Email</Label>
                <Input
                  placeholder="user@example.com"
                  value={selectedUser?.email || ''}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Име на Продукт</Label>
                <Input
                  placeholder="Testograph Apps Bundle"
                  value={purchaseForm.productName}
                  onChange={(e) => setPurchaseForm({...purchaseForm, productName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Сума</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="99.00"
                    value={purchaseForm.amount}
                    onChange={(e) => setPurchaseForm({...purchaseForm, amount: e.target.value})}
                    className="flex-1"
                  />
                  <Select
                    value={purchaseForm.currency}
                    onValueChange={(value) => setPurchaseForm({...purchaseForm, currency: value})}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BGN">BGN</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={purchaseForm.status}
                  onValueChange={(value) => setPurchaseForm({...purchaseForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreatePurchaseModal(false)}>
                Откажи
              </Button>
              <Button onClick={handleCreatePurchase} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Създаване...
                  </>
                ) : (
                  'Създай Покупка'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
