'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Database,
  Utensils,
  Moon,
  FlaskConical,
  Dumbbell,
  Loader2,
  Download,
  Search,
  RefreshCw
} from 'lucide-react';
import { exportToCSV } from '@/lib/utils/exportToCSV';

interface OverviewStats {
  mealPlans: { total: number; uniqueUsers: number };
  sleepLogs: { total: number; uniqueUsers: number };
  labResults: { total: number; uniqueUsers: number };
  exerciseLogs: { total: number; uniqueUsers: number };
  analyticsEvents: { total: number };
}

export default function AppDataPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [sleepLogs, setSleepLogs] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab !== 'overview') {
      fetchTabData(activeTab);
    }
  }, [activeTab]);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/app-data');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTabData = async (type: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/app-data?type=${type}&limit=100`);
      const data = await response.json();

      if (response.ok) {
        switch (type) {
          case 'meal_plans':
            setMealPlans(data.data || []);
            break;
          case 'sleep_logs':
            setSleepLogs(data.data || []);
            break;
          case 'lab_results':
            setLabResults(data.data || []);
            break;
          case 'exercise_logs':
            setExerciseLogs(data.data || []);
            break;
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'overview') {
      fetchOverview();
    } else {
      fetchTabData(activeTab);
    }
  };

  const handleExport = (dataType: string) => {
    let exportData: any[] = [];
    let filename = '';

    switch (dataType) {
      case 'meal_plans':
        exportData = mealPlans.map(plan => ({
          'User Email': plan.userEmail,
          'Plan Name': plan.plan_name || 'N/A',
          'Created At': new Date(plan.created_at).toLocaleString('bg-BG'),
        }));
        filename = 'meal-plans';
        break;
      case 'sleep_logs':
        exportData = sleepLogs.map(log => ({
          'User Email': log.userEmail,
          'Log Date': log.log_date,
          'Bedtime': log.bedtime || 'N/A',
          'Wake Time': log.waketime || 'N/A',
          'Quality': log.quality || 'N/A',
          'Notes': log.notes || 'N/A',
        }));
        filename = 'sleep-logs';
        break;
      case 'lab_results':
        exportData = labResults.map(result => ({
          'User Email': result.userEmail,
          'Test Date': result.test_date,
          'Total T': result.total_t || 'N/A',
          'Free T': result.free_t || 'N/A',
          'SHBG': result.shbg || 'N/A',
          'Notes': result.notes || 'N/A',
        }));
        filename = 'lab-results';
        break;
      case 'exercise_logs':
        exportData = exerciseLogs.map(log => ({
          'User Email': log.userEmail,
          'Exercise Type': log.exercise_type || 'N/A',
          'Duration': log.duration || 'N/A',
          'Intensity': log.intensity || 'N/A',
          'Created At': new Date(log.created_at).toLocaleString('bg-BG'),
        }));
        filename = 'exercise-logs';
        break;
    }

    exportToCSV(exportData, `${filename}-${new Date().toISOString().split('T')[0]}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter functions
  const filteredMealPlans = mealPlans.filter(plan =>
    searchQuery === '' ||
    plan.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.plan_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSleepLogs = sleepLogs.filter(log =>
    searchQuery === '' ||
    log.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLabResults = labResults.filter(result =>
    searchQuery === '' ||
    result.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExerciseLogs = exerciseLogs.filter(log =>
    searchQuery === '' ||
    log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.exercise_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8" />
              App Data Insights
            </h1>
            <p className="text-muted-foreground mt-2">
              Преглед на всички данни от Mini Apps (Meal Planner, Sleep, Lab Results, Exercise)
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обнови
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Database className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="meal_plans">
              <Utensils className="h-4 w-4 mr-2" />
              Meal Plans
            </TabsTrigger>
            <TabsTrigger value="sleep_logs">
              <Moon className="h-4 w-4 mr-2" />
              Sleep Logs
            </TabsTrigger>
            <TabsTrigger value="lab_results">
              <FlaskConical className="h-4 w-4 mr-2" />
              Lab Results
            </TabsTrigger>
            <TabsTrigger value="exercise_logs">
              <Dumbbell className="h-4 w-4 mr-2" />
              Exercise
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      Meal Plans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.mealPlans.total || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.mealPlans.uniqueUsers || 0} потребители
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Sleep Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.sleepLogs.total || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.sleepLogs.uniqueUsers || 0} потребители
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" />
                      Lab Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.labResults.total || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.labResults.uniqueUsers || 0} потребители
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      Exercise Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.exerciseLogs.total || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.exerciseLogs.uniqueUsers || 0} потребители
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Meal Plans Tab */}
          <TabsContent value="meal_plans">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Meal Plans</CardTitle>
                    <CardDescription>
                      Всички хранителни планове създадени от потребители
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Търси по email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('meal_plans')}
                      disabled={filteredMealPlans.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredMealPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Няма намерени планове' : 'Все още няма meal plans'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Email</TableHead>
                          <TableHead>Plan Name</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMealPlans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.userEmail}</TableCell>
                            <TableCell>{plan.plan_name || '—'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(plan.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sleep Logs Tab */}
          <TabsContent value="sleep_logs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sleep Logs</CardTitle>
                    <CardDescription>
                      Всички записи за сън от потребителите
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Търси по email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('sleep_logs')}
                      disabled={filteredSleepLogs.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredSleepLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Moon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Няма намерени записи' : 'Все още няма sleep logs'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Email</TableHead>
                          <TableHead>Log Date</TableHead>
                          <TableHead>Bedtime</TableHead>
                          <TableHead>Wake Time</TableHead>
                          <TableHead>Quality</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSleepLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.userEmail}</TableCell>
                            <TableCell>{log.log_date}</TableCell>
                            <TableCell>{log.bedtime || '—'}</TableCell>
                            <TableCell>{log.waketime || '—'}</TableCell>
                            <TableCell>
                              {log.quality ? (
                                <Badge variant="outline">{log.quality}/10</Badge>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="lab_results">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lab Results</CardTitle>
                    <CardDescription>
                      Всички лабораторни резултати от потребителите
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Търси по email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('lab_results')}
                      disabled={filteredLabResults.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredLabResults.length === 0 ? (
                  <div className="text-center py-12">
                    <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Няма намерени резултати' : 'Все още няма lab results'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Email</TableHead>
                          <TableHead>Test Date</TableHead>
                          <TableHead>Total T</TableHead>
                          <TableHead>Free T</TableHead>
                          <TableHead>SHBG</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLabResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.userEmail}</TableCell>
                            <TableCell>{result.test_date}</TableCell>
                            <TableCell>{result.total_t || '—'}</TableCell>
                            <TableCell>{result.free_t || '—'}</TableCell>
                            <TableCell>{result.shbg || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercise Logs Tab */}
          <TabsContent value="exercise_logs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Exercise Logs</CardTitle>
                    <CardDescription>
                      Всички записи за упражнения от потребителите
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Търси по email или тип..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('exercise_logs')}
                      disabled={filteredExerciseLogs.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredExerciseLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Няма намерени записи' : 'Все още няма exercise logs'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Email</TableHead>
                          <TableHead>Exercise Type</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Intensity</TableHead>
                          <TableHead>Created At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExerciseLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.userEmail}</TableCell>
                            <TableCell>{log.exercise_type || '—'}</TableCell>
                            <TableCell>{log.duration ? `${log.duration} min` : '—'}</TableCell>
                            <TableCell>
                              {log.intensity ? (
                                <Badge variant="outline">{log.intensity}</Badge>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(log.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
