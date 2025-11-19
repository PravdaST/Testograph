"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin/api";
import {
  TrendingUp,
  Loader2,
  RefreshCw,
  ArrowUp,
  Sparkles,
  Calendar,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TrendingQuery {
  keyword: string;
  current_clicks: number;
  current_impressions: number;
  previous_clicks: number;
  previous_impressions: number;
  clicks_change: number;
  impressions_change: number;
  trend_score: number;
  is_new: boolean;
}

export function TrendingQueries() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<TrendingQuery[]>([]);
  const [dateRanges, setDateRanges] = useState<any>(null);

  // Fetch trending queries
  const fetchTrending = async () => {
    setLoading(true);
    try {
      const response = await adminFetch("/api/admin/gsc/trending?limit=50");

      if (!response.ok) throw new Error("Failed to fetch trending queries");

      const data = await response.json();
      setTrending(data.trending || []);
      setDateRanges(data.date_ranges);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на trending queries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchTrending();
  }, []);

  // Calculate stats
  const newKeywords = trending.filter((q) => q.is_new).length;
  const avgTrendScore =
    trending.length > 0
      ? trending.reduce((sum, q) => sum + q.trend_score, 0) / trending.length
      : 0;
  const topKeyword = trending[0];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {trending.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Trending Keywords
              </CardDescription>
              <CardTitle className="text-3xl text-green-400">
                {trending.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">
                Последни 7 дни vs предишни 7 дни
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Нови Keywords
              </CardDescription>
              <CardTitle className="text-3xl text-purple-400">
                {newKeywords}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">
                Нови този период
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-blue-400" />
                Среден Trend Score
              </CardDescription>
              <CardTitle className="text-3xl text-blue-400">
                {avgTrendScore.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">
                Weighted average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Date Range Info */}
      {dateRanges && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <div className="flex items-center gap-2 text-zinc-300">
              <span>Текущ период:</span>
              <Badge variant="outline" className="bg-green-500/20 text-green-400">
                {dateRanges.current.start} - {dateRanges.current.end}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span>vs</span>
              <Badge variant="outline" className="bg-zinc-500/20 text-zinc-400">
                {dateRanges.previous.start} - {dateRanges.previous.end}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Trending Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Trending Search Queries
              </h3>
              <p className="text-sm text-zinc-400">
                Keywords с най-голям растеж в последните 7 дни
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrending}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {loading && trending.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-green-400" />
            <p className="text-zinc-400 mt-4">Анализиране на trends...</p>
          </div>
        ) : trending.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400">Няма trending queries</p>
            <p className="text-sm text-zinc-500 mt-2">
              Синхронизирай данни от GSC за да видиш trends
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Keyword</TableHead>
                  <TableHead className="text-zinc-400 text-center">Status</TableHead>
                  <TableHead className="text-zinc-400 text-right">
                    Clicks Change
                  </TableHead>
                  <TableHead className="text-zinc-400 text-right">
                    Impressions Change
                  </TableHead>
                  <TableHead className="text-zinc-400 text-right">
                    Current Clicks
                  </TableHead>
                  <TableHead className="text-zinc-400 text-right">
                    Current Impressions
                  </TableHead>
                  <TableHead className="text-zinc-400 text-right">
                    Trend Score
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trending.map((query, idx) => (
                  <TableRow key={idx} className="border-zinc-800">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {idx === 0 && (
                          <Sparkles className="w-4 h-4 text-yellow-400" />
                        )}
                        {query.keyword}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {query.is_new ? (
                        <Badge
                          variant="outline"
                          className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                        >
                          🆕 New
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-500/20 text-green-400 border-green-500/30"
                        >
                          📈 Growing
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ArrowUp className="w-3 h-3 text-green-400" />
                        <span
                          className={
                            query.clicks_change >= 100
                              ? "text-green-400 font-semibold"
                              : "text-green-300"
                          }
                        >
                          +{query.clicks_change.toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {query.previous_clicks} → {query.current_clicks}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ArrowUp className="w-3 h-3 text-blue-400" />
                        <span
                          className={
                            query.impressions_change >= 100
                              ? "text-blue-400 font-semibold"
                              : "text-blue-300"
                          }
                        >
                          +{query.impressions_change.toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {query.previous_impressions} →{" "}
                        {query.current_impressions}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className="bg-green-500/20 text-green-400 border-green-500/30"
                      >
                        {query.current_clicks}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                      >
                        {query.current_impressions}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          query.trend_score >= 100
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            : query.trend_score >= 50
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }
                      >
                        {query.trend_score.toFixed(0)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Top Trending Highlight */}
      {topKeyword && (
        <div className="glass-card p-6 border-l-4 border-purple-500">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                🔥 Top Trending Keyword
              </h4>
              <p className="text-2xl font-bold text-purple-400 mb-2">
                {topKeyword.keyword}
              </p>
              <div className="flex items-center gap-4 text-sm text-zinc-300">
                <div>
                  Clicks: <span className="text-green-400 font-semibold">
                    +{topKeyword.clicks_change.toFixed(0)}%
                  </span>
                </div>
                <div>
                  Impressions: <span className="text-blue-400 font-semibold">
                    +{topKeyword.impressions_change.toFixed(0)}%
                  </span>
                </div>
                <div>
                  Trend Score:{" "}
                  <span className="text-purple-400 font-semibold">
                    {topKeyword.trend_score.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Target className="w-4 h-4 mr-2" />
              Add to Target Keywords
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
