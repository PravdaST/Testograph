'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ClusterSuggestion = {
  clusterTitle: string;
  category: string;
  description: string;
  suggestedPillars: string[];
  keywords: string;
  seoValue: 'high' | 'medium';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  confidence: number;
};

export function ClusterSuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<ClusterSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingCluster, setCreatingCluster] = useState<string | null>(null);
  const supabase = createClient();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await fetch('/api/admin/suggest-all-clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err: any) {
      setError(err.message || 'Failed to get AI suggestions');
      console.error('AI suggestion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCluster = async (suggestion: ClusterSuggestion) => {
    setCreatingCluster(suggestion.clusterTitle);
    setError(null);

    try {
      // Call API to generate cluster
      const response = await fetch('/api/admin/create-cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: suggestion.clusterTitle,
          category: suggestion.category,
          keywords: suggestion.keywords,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create cluster');
      }

      const data = await response.json();

      // Save to database
      const { error: dbError } = await supabase
        .from('blog_posts')
        .insert([data.cluster]);

      if (dbError) throw dbError;

      // Success - refresh page
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create cluster');
      console.error('Cluster creation error:', err);
    } finally {
      setCreatingCluster(null);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      planets: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      signs: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      houses: 'bg-green-500/20 text-green-300 border-green-500/30',
      aspects: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      guides: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    };

    return colors[category] || 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      beginner: 'Начинаещи',
      intermediate: 'Средно',
      advanced: 'Напреднали',
    };
    return labels[difficulty] || difficulty;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-zinc-50">AI Cluster Suggestions</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Анализирай сайта и получи AI предложения за нови cluster теми
            </p>
          </div>
          <Button
            onClick={handleGetSuggestions}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Анализирам...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Генерирай Предложения
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card p-4 border-red-500/20 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Suggestions Grid */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="glass-card p-6 hover:border-purple-500/30 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-50 mb-2">
                    {suggestion.clusterTitle}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    {suggestion.description}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getCategoryBadge(suggestion.category)}>
                  {suggestion.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    suggestion.seoValue === 'high'
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  }
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  SEO: {suggestion.seoValue === 'high' ? 'Високо' : 'Средно'}
                </Badge>
                <Badge variant="outline" className="bg-zinc-500/20 text-zinc-300 border-zinc-500/30">
                  <Target className="w-3 h-3 mr-1" />
                  {getDifficultyLabel(suggestion.difficulty)}
                </Badge>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {Math.round(suggestion.confidence * 100)}% AI Confidence
                </Badge>
              </div>

              {/* Suggested Pillars */}
              <div className="mb-4">
                <div className="text-xs font-medium text-zinc-500 mb-2">
                  Предложени Pillars ({suggestion.suggestedPillars.length}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggestion.suggestedPillars.slice(0, 6).map((pillar, pidx) => (
                    <span
                      key={pidx}
                      className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300"
                    >
                      {pillar}
                    </span>
                  ))}
                  {suggestion.suggestedPillars.length > 6 && (
                    <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
                      +{suggestion.suggestedPillars.length - 6} още
                    </span>
                  )}
                </div>
              </div>

              {/* Keywords */}
              <div className="mb-4">
                <div className="text-xs font-medium text-zinc-500 mb-1">SEO Keywords:</div>
                <div className="text-xs text-zinc-400">{suggestion.keywords}</div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handleCreateCluster(suggestion)}
                disabled={creatingCluster !== null}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {creatingCluster === suggestion.clusterTitle ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Създава се...
                  </>
                ) : (
                  'Генерирай този Cluster'
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && suggestions.length === 0 && !error && (
        <div className="glass-card p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400">Кликни &quot;Генерирай Предложения&quot; за AI анализ</p>
          <p className="text-sm text-zinc-500 mt-2">
            AI ще анализира твоя сайт и ще предложи 8-10 нови cluster теми
          </p>
        </div>
      )}
    </div>
  );
}
