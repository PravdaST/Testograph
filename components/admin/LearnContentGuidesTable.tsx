'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Eye,
  BookOpen,
  FileEdit,
  Loader2,
  MoreVertical,
  ExternalLink,
  Trash2,
  CheckCircle2,
  XCircle,
  Link2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale';
import { adminFetch } from '@/lib/admin/api';

interface Stats {
  total: number;
  published: number;
  drafts: number;
  total_views: number;
}

interface Guide {
  id: string;
  title: string;
  slug: string;
  guide_type: 'cluster' | 'pillar';
  guide_category: string;
  is_published: boolean;
  published_at: string | null;
  views: number;
  word_count: number;
  created_at: string;
}

export function LearnContentGuidesTable() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [updatingAllLinks, setUpdatingAllLinks] = useState(false);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const response = await adminFetch('/api/admin/learn-content/guides');
      if (!response.ok) throw new Error('Failed to fetch guides');

      const data = await response.json();
      setStats(data.stats);
      setGuides(data.guides);
    } catch (error) {
      console.error('Guides error:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно зареждане на guides',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handlePublishToggle = async (guide: Guide) => {
    setUpdatingId(guide.id);
    try {
      const response = await adminFetch('/api/admin/learn-content/guides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: guide.id,
          is_published: !guide.is_published,
        }),
      });

      if (!response.ok) throw new Error('Failed to update guide');

      toast({
        title: 'Успешно!',
        description: guide.is_published
          ? 'Статията е скрита'
          : 'Статията е публикувана',
      });

      fetchGuides();
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешна промяна на статуса',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (guideId: string) => {
    if (!confirm('Сигурен ли си, че искаш да изтриеш този guide?')) {
      return;
    }

    setDeletingId(guideId);
    try {
      const response = await adminFetch(
        `/api/admin/learn-content/guides?id=${guideId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete guide');

      toast({
        title: 'Успешно!',
        description: 'Статията е изтрита',
      });

      fetchGuides();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно изтриване',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateLinks = async (guideId: string) => {
    setLinkingId(guideId);
    try {
      const response = await adminFetch('/api/admin/learn-content/update-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guide_id: guideId }),
      });

      if (!response.ok) throw new Error('Failed to update links');

      const result = await response.json();

      toast({
        title: 'Успешно!',
        description: `Линковете са обновени за "${result.guide_slug}"`,
      });
    } catch (error) {
      console.error('Update links error:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно обновяване на линкове',
        variant: 'destructive',
      });
    } finally {
      setLinkingId(null);
    }
  };

  const handleUpdateAllLinks = async () => {
    if (
      !confirm(
        `Това ще обнови вътрешните линкове за всички ${stats?.total || 0} публикувани статии. Продължаваш?`
      )
    ) {
      return;
    }

    setUpdatingAllLinks(true);
    try {
      const response = await adminFetch('/api/admin/learn-content/update-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ update_all: true }),
      });

      if (!response.ok) throw new Error('Failed to update all links');

      const result = await response.json();

      toast({
        title: 'Успешно!',
        description: `Обновени ${result.updated_count} от ${result.total_guides} статии`,
      });
    } catch (error) {
      console.error('Update all links error:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно обновяване на всички линкове',
        variant: 'destructive',
      });
    } finally {
      setUpdatingAllLinks(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    const map: Record<string, string> = {
      testosterone: '🧬',
      potency: '💪',
      fitness: '🏋️',
      nutrition: '🥗',
      supplements: '💊',
      lifestyle: '🌿',
    };
    return map[category] || '📚';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всички Guides</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Общо статии</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Публикувани</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.published || 0}</div>
            <p className="text-xs text-muted-foreground">Активни статии</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Чернови</CardTitle>
            <FileEdit className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.drafts || 0}</div>
            <p className="text-xs text-muted-foreground">Непубликувани</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прегледи</CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_views.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Общо прегледи</p>
          </CardContent>
        </Card>
      </div>

      {/* Guides Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Всички Guides</CardTitle>
          <Button
            onClick={handleUpdateAllLinks}
            disabled={updatingAllLinks || guides.length === 0}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {updatingAllLinks ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Обновяване...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Обнови всички линкове
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Заглавие</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Публикувана</TableHead>
                  <TableHead className="text-right">Прегледи</TableHead>
                  <TableHead className="text-right">Думи</TableHead>
                  <TableHead>Създадена</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-zinc-600 mb-2" />
                      <p className="text-zinc-400">Все още няма създадени guides</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  guides.map((guide) => (
                    <TableRow key={guide.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{guide.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {getCategoryEmoji(guide.guide_category)}{' '}
                          {guide.guide_category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            guide.guide_type === 'cluster' ? 'default' : 'outline'
                          }
                        >
                          {guide.guide_type === 'cluster' ? 'Cluster' : 'Pillar'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {guide.is_published ? (
                          <Badge className="bg-green-500/20 text-green-400">
                            Публикуван
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Чернова</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {guide.published_at ? (
                          formatDistanceToNow(new Date(guide.published_at), {
                            addSuffix: true,
                            locale: bg,
                          })
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {guide.views?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {guide.word_count?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {formatDistanceToNow(new Date(guide.created_at), {
                          addSuffix: true,
                          locale: bg,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {guide.is_published && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/learn/${guide.guide_category}/${guide.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Виж статия
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handlePublishToggle(guide)}
                              disabled={updatingId === guide.id}
                            >
                              {updatingId === guide.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {guide.is_published ? 'Скриване...' : 'Публикуване...'}
                                </>
                              ) : (
                                <>
                                  {guide.is_published ? (
                                    <XCircle className="w-4 h-4 mr-2" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                  )}
                                  {guide.is_published ? 'Скрий' : 'Публикувай'}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateLinks(guide.id)}
                              disabled={linkingId === guide.id}
                            >
                              {linkingId === guide.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Обновяване линкове...
                                </>
                              ) : (
                                <>
                                  <Link2 className="w-4 h-4 mr-2" />
                                  Обнови линкове
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(guide.id)}
                              disabled={deletingId === guide.id}
                              className="text-red-600"
                            >
                              {deletingId === guide.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Изтриване...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Изтрий
                                </>
                              )}
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
  );
}
