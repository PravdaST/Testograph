"use client";

import { useState } from "react";
import { Target, TrendingUp, BarChart3, Link as LinkIcon, Sparkles } from "lucide-react";
import { KeywordsManager } from "./keywords/KeywordsManager";
import { GSCPerformance } from "./keywords/GSCPerformance";
import { TrendingQueries } from "./keywords/TrendingQueries";
import { AIKeywordSuggestions } from "./keywords/AIKeywordSuggestions";

type TabMode = "keywords" | "performance" | "trending" | "ai-suggestions";

export function KeywordsManagementTab() {
  const [mode, setMode] = useState<TabMode>("keywords");

  return (
    <div className="space-y-6">
      {/* GSC Connection Banner */}
      <div className="glass-card p-4 border-l-4 border-blue-500">
        <div className="flex items-start gap-3">
          <LinkIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Google Search Console</h4>
            <p className="text-sm text-zinc-400 mt-1">
              Свържи се с GSC за автоматично синхронизиране на keyword performance данни
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-zinc-800">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setMode("keywords")}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap hover:text-gray-900 ${
              mode === "keywords"
                ? "text-gray-900 border-b-2 border-accent-500"
                : "text-gray-600 border-b-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Target Keywords</span>
            </div>
          </button>

          <button
            onClick={() => setMode("performance")}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap hover:text-gray-900 ${
              mode === "performance"
                ? "text-gray-900 border-b-2 border-accent-500"
                : "text-gray-600 border-b-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>GSC Performance</span>
            </div>
          </button>

          <button
            onClick={() => setMode("trending")}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap hover:text-gray-900 ${
              mode === "trending"
                ? "text-gray-900 border-b-2 border-accent-500"
                : "text-gray-600 border-b-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Queries</span>
            </div>
          </button>

          <button
            onClick={() => setMode("ai-suggestions")}
            className={`px-6 py-3 font-medium transition-all relative whitespace-nowrap hover:text-gray-900 ${
              mode === "ai-suggestions"
                ? "text-gray-900 border-b-2 border-accent-500"
                : "text-gray-600 border-b-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Suggestions</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-200">
        {mode === "keywords" && <KeywordsManager />}
        {mode === "performance" && <GSCPerformance />}
        {mode === "trending" && <TrendingQueries />}
        {mode === "ai-suggestions" && <AIKeywordSuggestions />}
      </div>
    </div>
  );
}
