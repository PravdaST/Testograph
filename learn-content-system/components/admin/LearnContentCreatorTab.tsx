'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Sparkles, Eye, Save, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type GuideType = 'cluster' | 'pillar';
type GuideCategory = 'guides' | 'planets' | 'signs' | 'houses' | 'aspects';

export function LearnContentCreatorTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GuideType>('cluster');
  const [category, setCategory] = useState<GuideCategory>('guides');
  const [keywords, setKeywords] = useState('');
  const [targetWords, setTargetWords] = useState(3500);

  // Auto-update target words based on type
  const handleTypeChange = (newType: GuideType) => {
    setType(newType);
    setTargetWords(newType === 'cluster' ? 3500 : 5500);
  };
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedMeta, setGeneratedMeta] = useState<any>(null);

  const handleGenerate = async () => {
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
      const response = await fetch('/api/admin/generate-learn-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          category,
          keywords,
          targetWords,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate guide');
      }

      const data = await response.json();

      setGeneratedContent(data.content);
      setGeneratedMeta(data.meta);
      setPreview(true);

      toast({
        title: 'Успешно!',
        description: `Guide генериран: ${data.meta.wordCount} думи`,
      });
    } catch (error) {
      console.error('Generate error:', error);
      toast({
        title: 'Грешка',
        description: 'Не успях да генерирам guide',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) {
      toast({
        title: 'Грешка',
        description: 'Няма генериран content',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/save-learn-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: generatedContent,
          category,
          type,
          meta: generatedMeta,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save guide');
      }

      const data = await response.json();

      toast({
        title: 'Публикувано!',
        description: `Guide е публикуван: ${data.slug}`,
      });

      // Reset form
      setTitle('');
      setKeywords('');
      setGeneratedContent('');
      setGeneratedMeta(null);
      setPreview(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Грешка',
        description: 'Не успях да запиша guide',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!preview ? (
        /* Create Form */
        <div className="glass-card p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-zinc-50">Създай нов Guide</h3>
            <p className="text-sm text-zinc-400">
              Използвай AI за да генерираш високо-качествено образователно съдържание
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Заглавие</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. Как да четеш натална карта за начинаещи"
              className="bg-zinc-900/50 border-zinc-700"
            />
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Тип</Label>
            <RadioGroup value={type} onValueChange={(v) => handleTypeChange(v as GuideType)}>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`flex items-center space-x-2 p-4 rounded-lg border ${
                    type === 'cluster'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-zinc-700 bg-zinc-900/50'
                  }`}
                >
                  <RadioGroupItem value="cluster" id="cluster" />
                  <div className="flex-1">
                    <Label htmlFor="cluster" className="cursor-pointer">
                      <div className="font-semibold">Cluster Guide</div>
                      <div className="text-xs text-zinc-500">3,000-4,000 думи</div>
                    </Label>
                  </div>
                </div>
                <div
                  className={`flex items-center space-x-2 p-4 rounded-lg border ${
                    type === 'pillar'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-zinc-700 bg-zinc-900/50'
                  }`}
                >
                  <RadioGroupItem value="pillar" id="pillar" />
                  <div className="flex-1">
                    <Label htmlFor="pillar" className="cursor-pointer">
                      <div className="font-semibold">Pillar Guide</div>
                      <div className="text-xs text-zinc-500">5,000-6,000 думи</div>
                    </Label>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Категория</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as GuideCategory)}>
              <SelectTrigger className="bg-zinc-900/50 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planets">🪐 Планети (Слънце, Луна, Меркурий...)</SelectItem>
                <SelectItem value="signs">♈ Зодиакални знаци (Овен, Телец...)</SelectItem>
                <SelectItem value="houses">🏠 Домове (1-ва къща, 2-ра къща...)</SelectItem>
                <SelectItem value="aspects">🔗 Аспекти (Конюнкция, Тригон...)</SelectItem>
                <SelectItem value="guides">📚 Общи теми (Ритуали, Медитации...)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500 mt-1">
              {category === 'planets' && '💡 За теми свързани с конкретни планети'}
              {category === 'signs' && '💡 За теми свързани със зодиакални знаци'}
              {category === 'houses' && '💡 За теми свързани с астрологични домове'}
              {category === 'aspects' && '💡 За теми свързани с планетарни аспекти'}
              {category === 'guides' && '💡 За общи теми (НЕ специфични планети/знаци)'}
            </p>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (незадължително)</Label>
            <Textarea
              id="keywords"
              value={keywords}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setKeywords(e.target.value)}
              placeholder="натална карта, астрология, зодия, планети..."
              className="bg-zinc-900/50 border-zinc-700 min-h-[80px]"
            />
          </div>

          {/* Target Words */}
          <div className="space-y-2">
            <Label htmlFor="targetWords">Целеви брой думи</Label>
            <Input
              id="targetWords"
              type="number"
              value={targetWords}
              onChange={(e) => setTargetWords(parseInt(e.target.value))}
              min={1000}
              max={10000}
              step={500}
              className="bg-zinc-900/50 border-zinc-700"
            />
            <p className="text-xs text-zinc-500">
              Препоръчано: Cluster (3,000-4,000), Pillar (5,000-6,000)
            </p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !title}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Генериране...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Генерирай Guide
              </>
            )}
          </Button>
        </div>
      ) : (
        /* Preview */
        <div className="space-y-6">
          {/* Meta Info */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-50">{title}</h3>
              <Badge variant="secondary">{type === 'cluster' ? 'Cluster' : 'Pillar'}</Badge>
            </div>

            {generatedMeta && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-zinc-500">Думи</div>
                  <div className="text-zinc-50 font-semibold">{generatedMeta.wordCount}</div>
                </div>
                <div>
                  <div className="text-zinc-500">Четене</div>
                  <div className="text-zinc-50 font-semibold">{generatedMeta.readingTime} мин</div>
                </div>
                <div>
                  <div className="text-zinc-500">Категория</div>
                  <div className="text-zinc-50 font-semibold capitalize">{category}</div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => setPreview(false)} variant="outline" className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                Редактирай
              </Button>
              <Button onClick={handleSave} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Публикуване...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Публикувай
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content Preview */}
          <div className="glass-card p-6">
            <div className="prose prose-invert prose-zinc max-w-none">
              <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
