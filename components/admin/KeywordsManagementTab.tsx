"use client";

import { useState, useEffect } from "react";
import { Target, TrendingUp, BarChart3, Link as LinkIcon, Sparkles, CheckCircle, ExternalLink } from "lucide-react";
import { KeywordsManager } from "./keywords/KeywordsManager";
import { GSCPerformance } from "./keywords/GSCPerformance";
import { TrendingQueries } from "./keywords/TrendingQueries";
import { AIKeywordSuggestions } from "./keywords/AIKeywordSuggestions";
import { adminFetch } from "@/lib/admin/api";

type TabMode = "keywords" | "performance" | "trending" | "ai-suggestions";

export function KeywordsManagementTab() {
  const [mode, setMode] = useState<TabMode>("keywords");
  const [gscConnected, setGscConnected] = useState(false);
  const [gscPropertyUrl, setGscPropertyUrl] = useState<string>("");
  const [connecting, setConnecting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkGSCStatus();

    // Check for OAuth callback result
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'connected') {
      // Refresh status after successful connection
      setTimeout(() => checkGSCStatus(), 1000);

      // Clean URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } else if (error) {
      console.error('[GSC OAuth] Error:', error);

      // Clean URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  async function checkGSCStatus() {
    try {
      setCheckingStatus(true);
      const response = await adminFetch('/api/admin/gsc/status');
      if (response.ok) {
        const data = await response.json();
        setGscConnected(data.connected);
        setGscPropertyUrl(data.propertyUrl || "");
      }
    } catch (error) {
      console.error('[GSC Status] Error:', error);
    } finally {
      setCheckingStatus(false);
    }
  }

  async function handleConnectGSC() {
    try {
      setConnecting(true);
      const response = await adminFetch('/api/admin/gsc/auth');
      if (response.ok) {
        const data = await response.json();
        if (data.authUrl) {
          // Redirect to Google OAuth
          window.location.href = data.authUrl;
        }
      }
    } catch (error) {
      console.error('[GSC Auth] Error:', error);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* GSC Connection Banner */}
      <div className={`glass-card p-4 border-l-4 ${gscConnected ? 'border-green-500' : 'border-blue-500'}`}>
        <div className="flex items-start gap-3">
          {gscConnected ? (
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
          ) : (
            <LinkIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Google Search Console</h4>
            <p className="text-sm text-zinc-400 mt-1">
              {gscConnected ? (
                <>Свързан с {gscPropertyUrl || 'GSC'}</>
              ) : (
                <>Свържи се с GSC за автоматично синхронизиране на keyword performance данни</>
              )}
            </p>
          </div>
          {!checkingStatus && !gscConnected && (
            <button
              onClick={handleConnectGSC}
              disabled={connecting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {connecting ? (
                <>Connecting...</>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Connect GSC
                </>
              )}
            </button>
          )}
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
