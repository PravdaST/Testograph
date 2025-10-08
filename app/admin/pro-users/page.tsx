'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { SearchBar } from '@/components/admin/SearchBar';
import { SkeletonTable } from '@/components/admin/SkeletonCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Target,
  RefreshCw,
  Flame,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Calendar,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProUserData {
  userId: string;
  email: string;
  name: string | null;
  protocolStartDate: string;
  daysOnProtocol: number;
  currentStreak: number;
  longestStreak: number;
  complianceRate: number;
  totalEntries: number;
  missedDays: number;
  averageFeeling: number | null;
  averageEnergy: number | null;
  averageCompliance: number | null;
  weightChange: number | null;
  startWeight: number | null;
  currentWeight: number | null;
  lastActivityDate: string | null;
}

type SortField = 'email' | 'daysOnProtocol' | 'currentStreak' | 'complianceRate' | 'weightChange';
type SortDirection = 'asc' | 'desc';

export default function ProUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<ProUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('complianceRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchProUsers();
  }, []);

  const fetchProUsers = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch('/api/admin/pro-users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching PRO users:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'току-що';
    if (diffMins < 60) return `преди ${diffMins} мин`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `преди ${diffHours} ч`;

    return date.toLocaleDateString('bg-BG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatus = (rate: number) => {
    if (rate >= 80) return { label: 'Отлично', variant: 'default' as const };
    if (rate >= 60) return { label: 'Добре', variant: 'secondary' as const };
    return { label: 'Ниско', variant: 'destructive' as const };
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    searchQuery === '' ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null) return 1;
    if (bValue === null) return -1;

    if (sortDirection === 'asc') {
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
            <h1 className="text-3xl font-bold">Testograph PRO Users</h1>
            <p className="text-muted-foreground mt-1">Зареждане...</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>PRO Users Progress</CardTitle>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-purple-600" />
              Testograph PRO Users
            </h1>
            <p className="text-muted-foreground mt-1">
              {lastUpdated && `Last updated: ${formatTimestamp(lastUpdated)}`} • {users.length} active users
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by email or name..."
              className="w-full md:w-64"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProUsers(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="font-medium">Total PRO Users</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Flame className="h-4 w-4" />
                <span className="font-medium">Avg Streak</span>
              </div>
              <div className="text-2xl font-bold">
                {users.length > 0
                  ? Math.round(users.reduce((sum, u) => sum + u.currentStreak, 0) / users.length)
                  : 0}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Activity className="h-4 w-4" />
                <span className="font-medium">Avg Compliance</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {users.length > 0
                  ? Math.round(users.reduce((sum, u) => sum + u.complianceRate, 0) / users.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Avg Days Active</span>
              </div>
              <div className="text-2xl font-bold">
                {users.length > 0
                  ? Math.round(users.reduce((sum, u) => sum + u.daysOnProtocol, 0) / users.length)
                  : 0}d
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PRO Users Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>PRO Users Progress</span>
              {searchQuery && (
                <span className="text-sm text-muted-foreground font-normal">
                  Showing {sortedUsers.length} of {users.length} users
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedUsers.length === 0 ? (
              searchQuery ? (
                <EmptyState
                  icon={Target}
                  title="No matching users"
                  description={`No PRO users found for "${searchQuery}"`}
                />
              ) : (
                <EmptyState
                  icon={Target}
                  title="No PRO users yet"
                  description="PRO users will appear here once they start their protocol"
                />
              )
            ) : (
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center gap-1">
                          User
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('daysOnProtocol')}
                      >
                        <div className="flex items-center gap-1">
                          Days
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('currentStreak')}
                      >
                        <div className="flex items-center gap-1">
                          Streak
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('complianceRate')}
                      >
                        <div className="flex items-center gap-1">
                          Compliance
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="h-10 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('weightChange')}
                      >
                        <div className="flex items-center gap-1">
                          Weight Δ
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="h-10">Status</TableHead>
                      <TableHead className="h-10 text-right">Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.map((user, index) => {
                      const status = getComplianceStatus(user.complianceRate);
                      return (
                        <TableRow
                          key={user.userId}
                          className={cn(
                            'h-12 cursor-pointer transition-colors',
                            index % 2 === 0 ? '' : 'bg-muted/30'
                          )}
                          onClick={() => router.push(`/admin/users/${encodeURIComponent(user.email)}`)}
                        >
                          <TableCell className="font-medium text-sm py-2">
                            <div>
                              <div>{user.name || user.email}</div>
                              {user.name && (
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm py-2">
                            {user.daysOnProtocol}d
                          </TableCell>
                          <TableCell className="py-2">
                            {user.currentStreak > 0 ? (
                              <div className="flex items-center gap-1">
                                <Flame className="h-4 w-4 text-orange-500" />
                                <span className="font-semibold">{user.currentStreak}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <span className={cn('font-semibold text-sm', getComplianceColor(user.complianceRate))}>
                                {user.complianceRate}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            {user.weightChange !== null ? (
                              <div className="flex items-center gap-1">
                                {user.weightChange > 0 ? (
                                  <TrendingUp className="h-4 w-4 text-red-500" />
                                ) : user.weightChange < 0 ? (
                                  <TrendingDown className="h-4 w-4 text-green-500" />
                                ) : null}
                                <span className={cn(
                                  'font-semibold text-sm',
                                  user.weightChange > 0 ? 'text-red-500' : user.weightChange < 0 ? 'text-green-500' : ''
                                )}>
                                  {user.weightChange > 0 ? '+' : ''}{user.weightChange} kg
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant={status.variant} className="text-xs">
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground py-2">
                            {user.lastActivityDate || 'N/A'}
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
    </AdminLayout>
  );
}
