'use client';

import { adminFetch } from '@/lib/admin/api';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PublishScheduler } from '@/components/admin/PublishScheduler';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type GuideCategory =
  | 'testosterone'
  | 'potency'
  | 'fitness'
  | 'nutrition'
  | 'supplements'
  | 'lifestyle';

interface CreateClusterDialogProps {
  onClusterCreated?: () => void;
  triggerButton?: React.ReactNode;
}

export function CreateClusterDialog({
  onClusterCreated,
  triggerButton,
}: CreateClusterDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GuideCategory>('testosterone');
  const [keywords, setKeywords] = useState('');
  const [publishSettings, setPublishSettings] = useState({
    isPublished: false,
    publishedAt: null as string | null,
  });

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({
        title: 'Грешка',
        description: 'Моля въведи заглавие',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await adminFetch('/api/admin/learn-content/create-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          keywords,
          is_published: publishSettings.isPublished,
          published_at: publishSettings.publishedAt,
        }),
      });

      if (!response.ok) throw new Error('Неуспешно създаване на клъстер');

      const data = await response.json();

      toast({
        title: '✅ Клъстерът е създаден!',
        description: `"${data.guide.title}" е готов с ${data.suggested_pillars?.length || 0} предложения за пилъри`,
      });

      // Reset form and close dialog
      setTitle('');
      setKeywords('');
      setPublishSettings({ isPublished: false, publishedAt: null });
      setOpen(false);

      // Notify parent
      if (onClusterCreated) {
        onClusterCreated();
      }
    } catch (error: any) {
      console.error('Cluster error:', error);
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно създаване на клъстер',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Създай Cluster
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Създай Cluster Ръководство
          </DialogTitle>
          <DialogDescription>
            AI ще генерира обширно ръководство от 3,500 думи и ще предложи 6-8
            пилъра
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="cluster-title">
              Заглавие на Cluster
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="cluster-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='напр. "Тестостерон - Пълно ръководство за мъже"'
              className="bg-zinc-900/50 border-zinc-700"
            />
            <p className="text-xs text-zinc-500">
              Ясно, SEO-оптимизирано заглавие
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="cluster-category">
              Основна Тема
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as GuideCategory)}
            >
              <SelectTrigger className="bg-zinc-900/50 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testosterone">🧬 Тестостерон</SelectItem>
                <SelectItem value="potency">💪 Потенция</SelectItem>
                <SelectItem value="fitness">🏋️ Фитнес</SelectItem>
                <SelectItem value="nutrition">🥗 Хранене</SelectItem>
                <SelectItem value="supplements">💊 Добавки</SelectItem>
                <SelectItem value="lifestyle">🌿 Лайфстайл</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">
              URL ще бъде: /learn/{category}/...
            </p>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="cluster-keywords">Keywords (незадължително)</Label>
            <Textarea
              id="cluster-keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="тестостерон, хормони, мъжко здраве..."
              className="bg-zinc-900/50 border-zinc-700 h-20"
            />
            <p className="text-xs text-zinc-500">
              AI автоматично ще определи кои pillars са нужни
            </p>
          </div>

          {/* Publish Settings */}
          <PublishScheduler
            value={publishSettings}
            onChange={setPublishSettings}
          />

          {/* Info */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm font-semibold text-blue-600 mb-1">
              Какво ще се случи?
            </p>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li>✓ AI ще генерира cluster статия от 3,500 думи</li>
              <li>✓ AI ще определи кои 6-8 pillars са нужни</li>
              <li>✓ Cluster ще съдържа placeholder линкове към pillars</li>
              <li>✓ След това можеш да създадеш pillars с 1 клик</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отказ
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !title}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Генериране... (~15 sec)
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Генерирай Cluster
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
