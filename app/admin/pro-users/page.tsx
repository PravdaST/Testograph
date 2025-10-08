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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Target,
  RefreshCw,
  Flame,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Calendar,
  Activity,
  Download,
  Filter,
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
type ComplianceFilter = 'all' | 'high' | 'medium' | 'low';
type ActivityFilter = 'all' | 'active' | 'inactive';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function ProUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<ProUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('complianceRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
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

  const exportToCSV = () => {
    if (sortedUsers.length === 0) return;

    const headers = [
      'Email',
      'Name',
      'Days on Protocol',
      'Current Streak',
      'Longest Streak',
      'Compliance %',
      'Total Entries',
      'Missed Days',
      'Avg Feeling',
      'Avg Energy',
      'Avg Compliance',
      'Start Weight (kg)',
      'Current Weight (kg)',
      'Weight Change (kg)',
      'Last Activity',
    ];

    const csvData = sortedUsers.map(user => [
      user.email,
      user.name || '',
      user.daysOnProtocol,
      user.currentStreak,
      user.longestStreak,
      user.complianceRate,
      user.totalEntries,
      user.missedDays,
      user.averageFeeling?.toFixed(1) || '',
      user.averageEnergy?.toFixed(1) || '',
      user.averageCompliance?.toFixed(1) || '',
      user.startWeight?.toFixed(1) || '',
      user.currentWeight?.toFixed(1) || '',
      user.weightChange?.toFixed(1) || '',
      user.lastActivityDate || '',
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `testograph-pro-users-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter users based on search, compliance, and activity
  let filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Compliance filter
    let matchesCompliance = true;
    if (complianceFilter === 'high') {
      matchesCompliance = user.complianceRate >= 80;
    } else if (complianceFilter === 'medium') {
      matchesCompliance = user.complianceRate >= 60 && user.complianceRate < 80;
    } else if (complianceFilter === 'low') {
      matchesCompliance = user.complianceRate < 60;
    }

    // Activity filter
    let matchesActivity = true;
    if (activityFilter === 'active') {
      const daysSinceActivity = user.lastActivityDate
        ? Math.floor((new Date().getTime() - new Date(user.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      matchesActivity = daysSinceActivity <= 3;
    } else if (activityFilter === 'inactive') {
      const daysSinceActivity = user.lastActivityDate
        ? Math.floor((new Date().getTime() - new Date(user.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      matchesActivity = daysSinceActivity > 3;
    }

    return matchesSearch && matchesCompliance && matchesActivity;
  });

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

  // Chart data
  const complianceDistribution = [
    { name: 'Високо (≥80%)', value: users.filter(u => u.complianceRate >= 80).length, color: '#10b981' },
    { name: 'Средно (60-79%)', value: users.filter(u => u.complianceRate >= 60 && u.complianceRate < 80).length, color: '#f59e0b' },
    { name: 'Ниско (<60%)', value: users.filter(u => u.complianceRate < 60).length, color: '#ef4444' },
  ];

  const streakDistribution = [
    { range: '0', count: users.filter(u => u.currentStreak === 0).length },
    { range: '1-5', count: users.filter(u => u.currentStreak >= 1 && u.currentStreak <= 5).length },
    { range: '6-10', count: users.filter(u => u.currentStreak >= 6 && u.currentStreak <= 10).length },
    { range: '11-20', count: users.filter(u => u.currentStreak >= 11 && u.currentStreak <= 20).length },
    { range: '20+', count: users.filter(u => u.currentStreak > 20).length },
  ];

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
        <div className="flex flex-col gap-4">
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
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={sortedUsers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
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

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by email or name..."
              className="w-full md:w-64"
            />
            <Select value={complianceFilter} onValueChange={(value: ComplianceFilter) => setComplianceFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Compliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Compliance</SelectItem>
                <SelectItem value="high">High (≥80%)</SelectItem>
                <SelectItem value="medium">Medium (60-79%)</SelectItem>
                <SelectItem value="low">Low (&lt;60%)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activityFilter} onValueChange={(value: ActivityFilter) => setActivityFilter(value)}>
              <SelectTrigger className="w-[160px]">
                <Activity className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active (≤3d)</SelectItem>
                <SelectItem value="inactive">Inactive (&gt;3d)</SelectItem>
              </SelectContent>
            </Select>
            {(complianceFilter !== 'all' || activityFilter !== 'all' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setComplianceFilter('all');
                  setActivityFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            )}
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

        {/* Charts */}
        {users.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Distribution */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Compliance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complianceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Streak Distribution */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Current Streak Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={streakDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Users', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

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
