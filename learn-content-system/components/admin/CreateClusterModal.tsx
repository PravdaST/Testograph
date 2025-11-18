'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function CreateClusterModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('planets');
  const [mainTopic, setMainTopic] = useState('astrology');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedPillars, setSuggestedPillars] = useState<string[]>([]);
  const [categoryWarning, setCategoryWarning] = useState<{
    suggestedCategory: string;
    message: string;
  } | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Generate cluster with AI
      const response = await fetch('/api/admin/create-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          mainTopic,
          keywords,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle duplicate error (409 Conflict)
        if (response.status === 409 && errorData.duplicate && errorData.existingPost) {
          const duplicateUrl = errorData.existingPost.url;
          throw new Error(
            `${errorData.error}\n\nВиж съществуващата статия тук: ${window.location.origin}${duplicateUrl}`
          );
        }

        throw new Error(errorData.error || 'Failed to generate cluster');
      }

      const data = await response.json();

      // Handle category warning (AI suggests different category)
      if (data.warning && data.suggestedCategory) {
        setCategoryWarning({
          suggestedCategory: data.suggestedCategory,
          message: data.message
        });
        setSuggestedPillars(data.suggestedPillars);
        setIsLoading(false);
        return; // Stop here, user needs to confirm
      }

      setSuggestedPillars(data.suggested_pillars);

      // Step 2: Save cluster to database
      const { error: dbError } = await supabase
        .from('blog_posts')
        .insert([data.cluster]);

      if (dbError) throw dbError;

      // Success!
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create cluster');
      console.error('Cluster creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-zinc-50">Създай Cluster Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Заглавие на Cluster
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='напр. "Планети в астрологията - обзор"'
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Main Topic */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Основна Тема
            </label>
            <select
              value={mainTopic}
              onChange={(e) => setMainTopic(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="astrology">Астрология</option>
              <option value="tarot">Таро</option>
              <option value="numerology">Нумерология</option>
              <option value="crystals">Кристали</option>
              <option value="herbs">Билки</option>
              <option value="rituals">Ритуали</option>
            </select>
            <p className="text-xs text-zinc-500">
              URL ще бъде: /learn/{mainTopic}/{category}/...
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Подкатегория
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="guides">Guides (Общи теми)</option>
              <option value="planets">Planets (За астрология)</option>
              <option value="signs">Signs (За астрология)</option>
              <option value="houses">Houses (За астрология)</option>
              <option value="aspects">Aspects (За астрология)</option>
              <option value="cards">Cards (За таро)</option>
              <option value="spreads">Spreads (За таро)</option>
              <option value="numbers">Numbers (За нумерология)</option>
            </select>
            <p className="text-xs text-zinc-500">
              AI автоматично ще определи кои pillars са нужни
            </p>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Keywords (незадължително)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder='напр. "астрология, планети, хороскоп"'
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category Warning */}
          {categoryWarning && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-300 mb-2">⚠️ Предупреждение</h4>
              <p className="text-sm text-zinc-300 mb-3">{categoryWarning.message}</p>
              <p className="text-xs text-zinc-400 mb-3">
                Препоръчва се: <span className="font-semibold text-yellow-300">{categoryWarning.suggestedCategory}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setCategory(categoryWarning.suggestedCategory);
                    setCategoryWarning(null);
                  }}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                >
                  Промени категорията
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCategoryWarning(null)}
                >
                  Продължи с &quot;guides&quot;
                </Button>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h4 className="font-semibold text-blue-300 mb-2">Какво ще се случи?</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>✓ AI ще генерира cluster статия от 3,500 думи</li>
              <li>✓ AI ще определи кои {category === 'planets' ? '7' : category === 'signs' ? '12' : category === 'houses' ? '12' : category === 'aspects' ? '5' : '4-8'} pillars са нужни</li>
              <li>✓ Cluster ще съдържа placeholder линкове към pillars</li>
              <li>✓ След това можеш да създадеш pillars с 1 клик</li>
            </ul>
          </div>

          {/* Suggested Pillars Preview */}
          {suggestedPillars.length > 0 && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <h4 className="font-semibold text-green-300 mb-2">
                Предложени Pillars ({suggestedPillars.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestedPillars.map((pillar, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded bg-green-500/20 text-xs text-green-300"
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !title}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Създава се... (30-60 сек)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Генерирай Cluster
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Откажи
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
