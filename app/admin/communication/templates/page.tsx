'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Mail,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Search,
  FileText,
  Copy
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_ID = 'e4ea078b-30b2-4347-801f-6d26a87318b6';
const ADMIN_EMAIL = 'admin@testograph.eu';

const CATEGORIES = [
  { value: 'general', label: 'Общи', color: 'bg-gray-600' },
  { value: 'welcome', label: 'Добре дошли', color: 'bg-blue-600' },
  { value: 'promo', label: 'Промоции', color: 'bg-purple-600' },
  { value: 'notification', label: 'Нотификации', color: 'bg-yellow-600' },
  { value: 'reminder', label: 'Напомняния', color: 'bg-orange-600' },
  { value: 'other', label: 'Други', color: 'bg-gray-500' },
];

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
  is_active: boolean;
  usage_count: number;
  creator_email: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
}

export default function TemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    checkAuth();
    fetchTemplates();
  }, [categoryFilter]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/admin');
      return;
    }
  };

  const fetchTemplates = async () => {
    try {
      const url = categoryFilter === 'all'
        ? '/api/admin/communication/templates'
        : `/api/admin/communication/templates?category=${categoryFilter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const extractVariables = (body: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = regex.exec(body)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast({
        title: 'Грешка',
        description: 'Моля попълнете всички задължителни полета',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/communication/templates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adminId: ADMIN_ID,
          adminEmail: ADMIN_EMAIL,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: data.message,
        });
        setCreateModal(false);
        resetForm();
        fetchTemplates();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно създаване на template',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedTemplate || !formData.name || !formData.subject || !formData.body) {
      toast({
        title: 'Грешка',
        description: 'Моля попълнете всички задължителни полета',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/communication/templates/${selectedTemplate.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adminId: ADMIN_ID,
          adminEmail: ADMIN_EMAIL,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: data.message,
        });
        setEditModal(false);
        setSelectedTemplate(null);
        resetForm();
        fetchTemplates();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно обновяване на template',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/communication/templates/${selectedTemplate.id}/delete?adminId=${ADMIN_ID}&adminEmail=${ADMIN_EMAIL}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успех!',
          description: data.message,
        });
        setDeleteModal(false);
        setSelectedTemplate(null);
        fetchTemplates();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно изтриване на template',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModal(true);
  };

  const openEditModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
      is_active: template.is_active,
      notes: template.notes || ''
    });
    setEditModal(true);
  };

  const openDeleteModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setDeleteModal(true);
  };

  const openPreviewModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewModal(true);
  };

  const cloneTemplate = (template: EmailTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      body: template.body,
      category: template.category,
      is_active: true,
      notes: template.notes || ''
    });
    setCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      category: 'general',
      is_active: true,
      notes: ''
    });
  };

  const getCategoryColor = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.color || 'bg-gray-600';
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const filteredTemplates = templates.filter(template =>
    searchQuery === '' ||
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Preview with sample data
  const renderPreview = (body: string) => {
    let preview = body;
    const sampleData: Record<string, string> = {
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      date: new Date().toLocaleDateString('bg-BG'),
      company: 'Testograph',
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });

    return preview;
  };

  const detectedVariables = extractVariables(formData.body);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Email Templates
          </h1>
          <p className="text-muted-foreground mt-2">
            Управление на reusable email шаблони
          </p>
        </div>

        {/* Actions Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Търси templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Нов Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Email Templates ({filteredTemplates.length})</CardTitle>
            <CardDescription>
              Създавайте и управлявайте reusable email templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Име</TableHead>
                    <TableHead>Тема</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Variables</TableHead>
                    <TableHead>Използвания</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Няма намерени templates
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(template.category)}>
                            {getCategoryLabel(template.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.slice(0, 3).map((variable) => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {`{{${variable}}}`}
                              </Badge>
                            ))}
                            {template.variables.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.variables.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{template.usage_count}</TableCell>
                        <TableCell>
                          <Badge variant={template.is_active ? 'default' : 'secondary'}>
                            {template.is_active ? 'Активен' : 'Неактивен'}
                          </Badge>
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
                              <DropdownMenuItem onClick={() => openPreviewModal(template)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditModal(template)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Редактирай
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => cloneTemplate(template)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Клонирай
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeleteModal(template)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Изтрий
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
      </div>

      {/* Create Template Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Създай Нов Template</DialogTitle>
            <DialogDescription>
              Създайте reusable email template. Използвайте {'{{variable}}'} за динамични данни.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Име *</Label>
                <Input
                  placeholder="Напр. Welcome Email"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Тема *</Label>
                <Input
                  placeholder="Email subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Категория</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Body (HTML) *</Label>
                <Textarea
                  placeholder="Email body with HTML. Use {{name}}, {{email}}, etc."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Бележки</Label>
                <Input
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Detected Variables</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                  {detectedVariables.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Няма намерени variables</span>
                  ) : (
                    detectedVariables.map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {`{{${variable}}}`}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className="p-4 border rounded-lg max-h-[400px] overflow-y-auto bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: renderPreview(formData.body) || '<p class="text-muted-foreground text-sm">Няма съдържание</p>' }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModal(false)}>
              Отказ
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Създаване...
                </>
              ) : (
                'Създай Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Modal */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирай Template</DialogTitle>
            <DialogDescription>
              Променете съдържанието на template-а
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Име *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Тема *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Категория</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Body (HTML) *</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Бележки</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Detected Variables</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                  {detectedVariables.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Няма намерени variables</span>
                  ) : (
                    detectedVariables.map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {`{{${variable}}}`}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className="p-4 border rounded-lg max-h-[400px] overflow-y-auto bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: renderPreview(formData.body) }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(false)}>
              Отказ
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Запазване...
                </>
              ) : (
                'Запази Промените'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изтрий Template</DialogTitle>
            <DialogDescription>
              Сигурни ли сте, че искате да изтриете template-а "{selectedTemplate?.name}"?
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && selectedTemplate.usage_count > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Внимание:</strong> Този template е бил използван {selectedTemplate.usage_count} пъти.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal(false)}>
              Отказ
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Изтриване...
                </>
              ) : (
                'Изтрий Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewModal} onOpenChange={setPreviewModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Sample email with test data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <div className="p-3 bg-gray-50 border rounded-lg mt-2">
                {selectedTemplate?.subject}
              </div>
            </div>
            <div>
              <Label>Body</Label>
              <div
                className="p-4 bg-gray-50 border rounded-lg mt-2 max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: selectedTemplate ? renderPreview(selectedTemplate.body) : '' }}
              />
            </div>
            <div>
              <Label>Variables Used</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTemplate?.variables.map((variable) => (
                  <Badge key={variable} variant="secondary">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewModal(false)}>Затвори</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
