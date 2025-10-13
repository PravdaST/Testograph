'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Mail,
  Send,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  FileText,
  Download
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Hardcoded admin credentials
const ADMIN_ID = 'e4ea078b-30b2-4347-801f-6d26a87318b6';
const ADMIN_EMAIL = 'caspere63@gmail.com';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
  is_active: boolean;
  usage_count: number;
}

export default function CommunicationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single');

  // Email logs state
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [emailStats, setEmailStats] = useState<any>({});
  const [logsPage, setLogsPage] = useState(1);
  const [logsPagination, setLogsPagination] = useState<any>({});
  const [logsFilters, setLogsFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  // Single email state
  const [singleTo, setSingleTo] = useState('');
  const [singleSubject, setSingleSubject] = useState('');
  const [singleMessage, setSingleMessage] = useState('');

  // Bulk email state
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Template state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    checkAuth();
    fetchUsers();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchEmailLogs();
    }
  }, [activeTab, logsPage, logsFilters]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/admin');
      return;
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/access/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/communication/templates?active_only=true');
      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: logsPage.toString(),
        limit: '20',
        ...(logsFilters.status && { status: logsFilters.status }),
        ...(logsFilters.search && { search: logsFilters.search }),
        ...(logsFilters.startDate && { start_date: logsFilters.startDate }),
        ...(logsFilters.endDate && { end_date: logsFilters.endDate }),
      });

      const response = await fetch(`/api/admin/communication/logs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEmailLogs(data.logs || []);
        setLogsPagination(data.pagination || {});
        setEmailStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  const loadTemplate = (templateId: string, target: 'single' | 'bulk') => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    if (target === 'single') {
      setSingleSubject(template.subject);
      setSingleMessage(template.body);
    } else {
      setBulkSubject(template.subject);
      setBulkMessage(template.body);
    }

    toast({
      title: 'Template зареден',
      description: `"${template.name}" е зареден успешно`,
    });
  };

  const handleSendSingle = async () => {
    if (!singleTo || !singleSubject || !singleMessage) {
      toast({
        title: 'Грешка',
        description: 'Моля попълнете всички полета',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/communication/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: singleTo,
          subject: singleSubject,
          message: singleMessage,
          isBulk: false,
          adminId: ADMIN_ID,
          adminEmail: ADMIN_EMAIL,
          templateId: selectedTemplate || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: data.message,
        });
        // Clear form
        setSingleTo('');
        setSingleSubject('');
        setSingleMessage('');
        setSelectedTemplate('');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно изпращане на email',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendBulk = async () => {
    if (selectedUsers.size === 0 || !bulkSubject || !bulkMessage) {
      toast({
        title: 'Грешка',
        description: 'Моля попълнете всички полета и изберете потребители',
        variant: 'destructive',
      });
      return;
    }

    const selectedEmails = users
      .filter(u => selectedUsers.has(u.id))
      .map(u => u.email);

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/communication/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedEmails,
          subject: bulkSubject,
          message: bulkMessage,
          isBulk: true,
          adminId: ADMIN_ID,
          adminEmail: ADMIN_EMAIL,
          templateId: selectedTemplate || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: data.message,
        });
        // Clear form
        setSelectedUsers(new Set());
        setBulkSubject('');
        setBulkMessage('');
        setSelectedTemplate('');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно изпращане на emails',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const filteredUsers = users.filter(user =>
    searchQuery === '' ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="h-8 w-8" />
              Комуникация
            </h1>
            <p className="text-muted-foreground mt-2">
              Изпращайте emails до потребители - единични или групови
            </p>
          </div>
          <Button
            onClick={() => router.push('/admin/communication/templates')}
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            Управление на Templates
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">
              <Mail className="h-4 w-4 mr-2" />
              Единичен Email
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <Users className="h-4 w-4 mr-2" />
              Bulk Email
            </TabsTrigger>
            <TabsTrigger value="history">
              <FileText className="h-4 w-4 mr-2" />
              Email History
            </TabsTrigger>
          </TabsList>

          {/* Single Email Tab */}
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Изпрати Email до Един Потребител</CardTitle>
                <CardDescription>
                  Попълнете формата за да изпратите персонализиран email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selector */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <Label className="text-blue-900 font-medium">Използвай Email Template</Label>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="flex-1 bg-white">
                        <SelectValue placeholder="Изберете template (опционално)" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => selectedTemplate && loadTemplate(selectedTemplate, 'single')}
                      disabled={!selectedTemplate}
                      variant="outline"
                      className="bg-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Зареди
                    </Button>
                  </div>
                  {selectedTemplate && templates.find(t => t.id === selectedTemplate)?.variables.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200">
                      <span className="text-xs text-blue-700 font-medium">Променливи:</span>
                      {templates.find(t => t.id === selectedTemplate)?.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="single-to">До (Email)</Label>
                  <Input
                    id="single-to"
                    type="email"
                    placeholder="user@example.com"
                    value={singleTo}
                    onChange={(e) => setSingleTo(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="single-subject">Тема</Label>
                  <Input
                    id="single-subject"
                    placeholder="Въведете тема на съобщението"
                    value={singleSubject}
                    onChange={(e) => setSingleSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="single-message">Съобщение</Label>
                  <Textarea
                    id="single-message"
                    placeholder="Въведете вашето съобщение тук..."
                    rows={10}
                    value={singleMessage}
                    onChange={(e) => setSingleMessage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Съобщението ще бъде изпратено с Testograph branding
                  </p>
                </div>

                <Button
                  onClick={handleSendSingle}
                  disabled={isLoading || !singleTo || !singleSubject || !singleMessage}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Изпращане...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Изпрати Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Email Tab */}
          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Email Кампания</CardTitle>
                <CardDescription>
                  Изберете потребители и изпратете email до всички наведнъж
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selector */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <Label className="text-blue-900 font-medium">Използвай Email Template</Label>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="flex-1 bg-white">
                        <SelectValue placeholder="Изберете template (опционално)" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => selectedTemplate && loadTemplate(selectedTemplate, 'bulk')}
                      disabled={!selectedTemplate}
                      variant="outline"
                      className="bg-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Зареди
                    </Button>
                  </div>
                  {selectedTemplate && templates.find(t => t.id === selectedTemplate)?.variables.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200">
                      <span className="text-xs text-blue-700 font-medium">Променливи:</span>
                      {templates.find(t => t.id === selectedTemplate)?.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-subject">Тема</Label>
                  <Input
                    id="bulk-subject"
                    placeholder="Въведете тема на съобщението"
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-message">Съобщение</Label>
                  <Textarea
                    id="bulk-message"
                    placeholder="Въведете вашето съобщение тук..."
                    rows={8}
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">
                      Избрани: {selectedUsers.size} потребители
                    </span>
                  </div>
                  <Button
                    onClick={handleSendBulk}
                    disabled={isLoading || selectedUsers.size === 0 || !bulkSubject || !bulkMessage}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Изпращане...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Изпрати до {selectedUsers.size}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Selection Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Изберете Потребители</CardTitle>
                    <CardDescription>
                      Кликнете върху checkbox-овете за да изберете получатели
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Търси потребители..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" onClick={selectAllUsers}>
                      {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                            onCheckedChange={selectAllUsers}
                          />
                        </TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Име</TableHead>
                        <TableHead className="text-right">Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Няма намерени потребители
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.has(user.id)}
                                onCheckedChange={() => toggleUserSelection(user.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>{user.name || '—'}</TableCell>
                            <TableCell className="text-right">
                              {selectedUsers.has(user.id) ? (
                                <Badge variant="default" className="bg-green-600">
                                  Избран
                                </Badge>
                              ) : (
                                <Badge variant="outline">—</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email History Tab */}
          <TabsContent value="history" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Изпратени</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.total_sent || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Успешно изпратени emails
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Неуспешни</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.total_failed || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Failed emails
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.success_rate || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Процент успех
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Общо</CardTitle>
                  <Mail className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(emailStats.total_sent || 0) + (emailStats.total_failed || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    Общо изпратени
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Търси по email..."
                      value={logsFilters.search}
                      onChange={(e) => setLogsFilters({ ...logsFilters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={logsFilters.status}
                    onValueChange={(v) => setLogsFilters({ ...logsFilters, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Всички</SelectItem>
                      <SelectItem value="sent">Изпратени</SelectItem>
                      <SelectItem value="failed">Неуспешни</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="bounced">Bounced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={logsFilters.startDate}
                    onChange={(e) => setLogsFilters({ ...logsFilters, startDate: e.target.value })}
                    placeholder="От дата"
                  />
                  <Input
                    type="date"
                    value={logsFilters.endDate}
                    onChange={(e) => setLogsFilters({ ...logsFilters, endDate: e.target.value })}
                    placeholder="До дата"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Email History ({logsPagination.total || 0})</CardTitle>
                <CardDescription>
                  История на всички изпратени emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Получател</TableHead>
                        <TableHead>Тема</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Изпратено от</TableHead>
                        <TableHead>Дата</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Няма намерени emails
                          </TableCell>
                        </TableRow>
                      ) : (
                        emailLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              {log.recipient_email}
                              {log.recipient_name && (
                                <div className="text-xs text-muted-foreground">{log.recipient_name}</div>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                            <TableCell>
                              {log.template_name ? (
                                <Badge variant="outline">{log.template_name}</Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  log.status === 'sent' ? 'default' :
                                  log.status === 'failed' ? 'destructive' :
                                  log.status === 'pending' ? 'secondary' :
                                  'outline'
                                }
                                className={
                                  log.status === 'sent' ? 'bg-green-600' :
                                  log.status === 'failed' ? 'bg-red-600' :
                                  ''
                                }
                              >
                                {log.status === 'sent' ? 'Изпратен' :
                                 log.status === 'failed' ? 'Неуспешен' :
                                 log.status === 'pending' ? 'Pending' :
                                 log.status}
                              </Badge>
                              {log.is_bulk && (
                                <Badge variant="outline" className="ml-2 text-xs">Bulk</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{log.sent_by_email}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(log.created_at).toLocaleString('bg-BG')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {logsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Страница {logsPagination.page} от {logsPagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLogsPage(prev => Math.max(1, prev - 1))}
                        disabled={logsPage === 1}
                      >
                        Предишна
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLogsPage(prev => Math.min(logsPagination.totalPages, prev + 1))}
                        disabled={logsPage === logsPagination.totalPages}
                      >
                        Следваща
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Важна Информация
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 text-sm space-y-2">
            <p>• Emails се изпращат чрез Resend с domain testograph.eu</p>
            <p>• Използвайте Email Templates за бързо зареждане на готови съобщения</p>
            <p>• Всички изпратени emails се записват в Audit Logs за проследяване</p>
            <p>• За bulk emails, процесът може да отнеме няколко секунди</p>
            <p>• Проверете историята на изпратени emails в Audit Logs таба</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
