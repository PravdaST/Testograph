'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Users as UsersIcon, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/lib/utils/exportToCSV';

interface User {
  email: string;
  firstName?: string;
  chatSessions: number;
  funnelAttempts: number;
  converted: boolean;
  lastActivity: string;
}

interface UsersResponse {
  users: User[];
  total: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

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
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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
    }));

    exportToCSV(exportData, `users-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-2">
            Преглед на всички потребители и тяхната активност
          </p>
        </div>

        {/* Stats Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <TableHead className="text-center">Конвертирал</TableHead>
                      <TableHead>Последна Активност</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.email}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => router.push(`/admin/users/${encodeURIComponent(user.email)}`)}
                      >
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {user.firstName || (
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
                          {user.converted ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.lastActivity)}
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
    </AdminLayout>
  );
}
