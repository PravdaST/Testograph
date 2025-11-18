'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Clock, TrendingUp, Target, ExternalLink, BookOpen, CheckCircle, XCircle, Calendar, Save, Loader2 } from 'lucide-react';
import { DeleteBlogPostButton } from '@/components/admin/DeleteBlogPostButton';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface LearnGuide {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  guide_type: string | null;
  guide_category: string | null;
  main_topic: string | null;
  status: string;
  view_count: number | null;
  word_count: number | null;
  reading_time: number | null;
  ai_generated: boolean;
  created_at: string;
  published_at: string | null;
  scheduled_for: string | null;
  content: string;
}

interface LearnContentManagementTabProps {
  guides: LearnGuide[];
}

export function LearnContentManagementTab({ guides: initialGuides }: LearnContentManagementTabProps) {
  const [guides, setGuides] = useState(initialGuides);
  const [editingGuide, setEditingGuide] = useState<LearnGuide | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const supabase = createClient();

  const stats = {
    total: guides.length,
    published: guides.filter((g) => g.status === 'published').length,
    draft: guides.filter((g) => g.status === 'draft').length,
    totalViews: guides.reduce((sum, g) => sum + (g.view_count || 0), 0),
  };

  const guideTypeLabels = {
    cluster: 'Cluster (3-4k)',
    pillar: 'Pillar (5-6k)',
  };

  const categoryLabels = {
    guides: 'General Guides',
    planets: 'Planets',
    signs: 'Zodiac Signs',
    houses: 'Houses',
    aspects: 'Aspects',
  };

  const statusLabels = {
    draft: 'Чернова',
    published: 'Публикувана',
    archived: 'Архивирана',
  };

  const statusColors = {
    draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    published: 'bg-green-500/10 text-green-400 border-green-500/20',
    archived: 'bg-zinc-600/10 text-zinc-400 border-zinc-600/20',
  };

  const handleDelete = (guideId: string) => {
    setGuides(guides.filter((g) => g.id !== guideId));
  };

  const handleToggleStatus = async (guide: LearnGuide) => {
    setTogglingStatus(guide.id);

    try {
      const newStatus = guide.status === 'published' ? 'draft' : 'published';
      const updates: any = {
        status: newStatus,
      };

      // If publishing, set published_at and clear scheduled_for
      if (newStatus === 'published') {
        updates.published_at = new Date().toISOString();
        updates.scheduled_for = null;
      } else {
        // If unpublishing, clear published_at
        updates.published_at = null;
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', guide.id);

      if (error) throw error;

      // Update local state
      setGuides(guides.map(g =>
        g.id === guide.id
          ? { ...g, ...updates }
          : g
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Грешка при промяна на статуса');
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleOpenEdit = (guide: LearnGuide) => {
    setEditingGuide(guide);
    setEditContent(guide.content);
  };

  const handleSaveEdit = async () => {
    if (!editingGuide) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ content: editContent })
        .eq('id', editingGuide.id);

      if (error) throw error;

      // Update local state
      setGuides(guides.map(g =>
        g.id === editingGuide.id
          ? { ...g, content: editContent }
          : g
      ));

      setEditingGuide(null);
      setEditContent('');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Грешка при запазване');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-zinc-50">{stats.total}</div>
              <div className="text-sm text-zinc-400">Всички guides</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-zinc-50">{stats.published}</div>
              <div className="text-sm text-zinc-400">Публикувани</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-zinc-50">{stats.draft}</div>
              <div className="text-sm text-zinc-400">Чернови</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-zinc-50">
                {stats.totalViews.toLocaleString('bg-BG')}
              </div>
              <div className="text-sm text-zinc-400">Прегледи</div>
            </div>
          </div>
        </div>
      </div>

      {/* Guides Table */}
      <div className="glass-card p-6">
        <div className="overflow-x-auto">
          {guides.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zinc-300 mb-2">
                Няма създадени guides
              </h3>
              <p className="text-zinc-500 mb-6">
                Започни да създаваш образователно съдържание в AI Guide Creator таба
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">
                    Заглавие
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">
                    Категория
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">
                    Тип
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">
                    Статус
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">
                    График
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-400">
                    Прегледи
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-400">
                    Думи
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">
                    Създадена
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-400">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {guides.map((guide) => (
                  <tr
                    key={guide.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="max-w-md">
                        <div className="font-semibold text-zinc-100 mb-1 line-clamp-1">
                          {guide.title}
                        </div>
                        {guide.excerpt && (
                          <div className="text-sm text-zinc-500 line-clamp-1">
                            {guide.excerpt}
                          </div>
                        )}
                        {guide.ai_generated && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              AI Generated
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-zinc-300">
                        {guide.category ? categoryLabels[guide.category as keyof typeof categoryLabels] : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {guide.guide_type ? guideTypeLabels[guide.guide_type as keyof typeof guideTypeLabels] : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          guide.status ? statusColors[guide.status as keyof typeof statusColors] : statusColors.draft
                        }`}
                      >
                        {guide.status ? statusLabels[guide.status as keyof typeof statusLabels] : 'Чернова'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {guide.scheduled_for ? (
                        <div className="flex items-center gap-1 text-xs text-orange-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(guide.scheduled_for).toLocaleDateString('bg-BG', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Eye className="w-3 h-3 text-zinc-500" />
                        <span className="text-sm text-zinc-300">
                          {(guide.view_count || 0).toLocaleString('bg-BG')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm text-zinc-300">
                        {guide.word_count || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-zinc-400">
                        {new Date(guide.created_at).toLocaleDateString('bg-BG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* View on site */}
                        {guide.status === 'published' && (
                          <Link
                            href={`/learn/${guide.main_topic}/${guide.guide_category}/${guide.slug}`}
                            target="_blank"
                            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                            title="Виж в сайта"
                          >
                            <ExternalLink className="w-4 h-4 text-zinc-400" />
                          </Link>
                        )}

                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(guide)}
                          disabled={togglingStatus === guide.id}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                          title={guide.status === 'published' ? 'Скрий (draft)' : 'Публикувай'}
                        >
                          {togglingStatus === guide.id ? (
                            <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                          ) : guide.status === 'published' ? (
                            <XCircle className="w-4 h-4 text-orange-400" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(guide)}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Редактирай съдържание"
                        >
                          <Pencil className="w-4 h-4 text-zinc-400" />
                        </button>

                        {/* Delete */}
                        <DeleteBlogPostButton
                          postId={guide.id}
                          postTitle={guide.title}
                          onDelete={handleDelete}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingGuide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-50">
                  Редактирай съдържание
                </h2>
                <p className="text-sm text-zinc-400 mt-1">{editingGuide.title}</p>
              </div>
              <button
                onClick={() => setEditingGuide(null)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full min-h-[400px] bg-zinc-900 border border-zinc-700 rounded p-4 text-zinc-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="HTML съдържание..."
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 flex items-center justify-between">
              <div className="text-sm text-zinc-500">
                {editContent.length} символа
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditingGuide(null)}
                  disabled={isSaving}
                >
                  Отказ
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Запазва се...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Запази промените
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
