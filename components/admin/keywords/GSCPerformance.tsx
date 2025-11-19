"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  BarChart3,
  Loader2,
  RefreshCw,
  Download,
  Link as LinkIcon,
  Calendar,
  TrendingUp,
  MousePointerClick,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface KeywordPerformance {
  keyword: string;
  total_clicks: number;
  total_impressions: number;
  avg_ctr: number;
  avg_position: number;
}

export function GSCPerformance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [keywords, setKeywords] = useState<KeywordPerformance[]>([]);
  const [days, setDays] = useState("28");
  const [sortBy, setSortBy] = useState("clicks");
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(
    null
  );

  // Check GSC connection status
  const checkConnection = async () => {
    try {
      const response = await adminFetch("/api/admin/gsc/performance?days=1");
      setIsConnected(response.ok);
    } catch (error) {
      setIsConnected(false);
    }
  };

  // Sync data from GSC
  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await adminFetch("/api/admin/gsc/sync", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Sync failed");
      }

      const data = await response.json();

      toast({
        title: "✅ Синхронизацията завърши!",
        description: `Синхронизирани ${data.synced} записа от GSC`,
      });

      // Refresh performance data
      fetchPerformance();
    } catch (error: any) {
      console.error("Sync error:", error);

      if (error.message.includes("Not connected")) {
        toast({
          title: "Не си свързан с GSC",
          description: "Кликни на 'Свържи с Google Search Console' за да започнеш",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Грешка при синхронизация",
          description: error.message || "Неуспешна синхронизация",
          variant: "destructive",
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  // Fetch performance data
  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const response = await adminFetch(
        `/api/admin/gsc/performance?days=${days}&sortBy=${sortBy}&limit=100`
      );

      if (!response.ok) throw new Error("Failed to fetch performance");

      const data = await response.json();
      setKeywords(data.keywords || []);
      setDateRange(data.date_range);
      setIsConnected(true);
    } catch (error: any) {
      console.error("Fetch error:", error);
      setIsConnected(false);
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на данни",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Connect to GSC
  const handleConnect = async () => {
    setLoading(true);
    try {
      // Use adminFetch to get the auth URL with proper authentication
      const response = await adminFetch("/api/admin/gsc/auth");

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth');
      }

      // The endpoint should return the OAuth URL
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error: any) {
      console.error('[GSC Connect Error]', error);
      setLoading(false);
      toast({
        title: "Грешка при свързване",
        description: error.message || "Неуспешна инициализация на OAuth",
        variant: "destructive",
      });
    }
  };

  // Load on mount and when filters change
  useEffect(() => {
    checkConnection();
    fetchPerformance();
  }, [days, sortBy]);

  // Calculate totals
  const totals = keywords.reduce(
    (acc, kw) => ({
      clicks: acc.clicks + kw.total_clicks,
      impressions: acc.impressions + kw.total_impressions,
    }),
    { clicks: 0, impressions: 0 }
  );

  const avgCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      {!isConnected && (
        <div className="glass-card p-6 border-l-4 border-yellow-500">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <LinkIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  Не си свързан с Google Search Console
                </h4>
                <p className="text-sm text-zinc-400">
                  Свържи се с GSC за да видиш реални performance данни за keywords
                </p>
              </div>
            </div>
            <Button
              onClick={handleConnect}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Свържи с GSC
            </Button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-green-400" />
                Total Clicks
              </CardDescription>
              <CardTitle className="text-3xl text-green-400">
                {totals.clicks.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">
                {dateRange && `${dateRange.start} - ${dateRange.end}`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Total Impressions
              </CardDescription>
              <CardTitle className="text-3xl text-blue-400">
                {totals.impressions.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">
                {keywords.length} keywords
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Average CTR
              </CardDescription>
              <CardTitle className="text-3xl text-purple-400">
                {avgCTR.toFixed(2)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">
                Click-through rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Keyword Performance
              </h3>
              <p className="text-sm text-zinc-400">
                Google Search Console данни
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing || !isConnected}
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sync...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync GSC Data
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchPerformance}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-[150px] bg-zinc-900/50 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Последни 7 дни</SelectItem>
                <SelectItem value="28">Последни 28 дни</SelectItem>
                <SelectItem value="90">Последни 90 дни</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] bg-zinc-900/50 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clicks">По clicks</SelectItem>
                <SelectItem value="impressions">По impressions</SelectItem>
                <SelectItem value="ctr">По CTR</SelectItem>
                <SelectItem value="position">По position</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="glass-card overflow-hidden">
        {loading && keywords.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-400" />
            <p className="text-zinc-400 mt-4">Зареждане...</p>
          </div>
        ) : keywords.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400">Няма данни</p>
            <p className="text-sm text-zinc-500 mt-2">
              {isConnected
                ? "Кликни 'Sync GSC Data' за да заредиш данни"
                : "Свържи се с Google Search Console"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Keyword</TableHead>
                <TableHead className="text-zinc-400 text-right">Clicks</TableHead>
                <TableHead className="text-zinc-400 text-right">
                  Impressions
                </TableHead>
                <TableHead className="text-zinc-400 text-right">CTR</TableHead>
                <TableHead className="text-zinc-400 text-right">
                  Avg Position
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((kw, idx) => (
                <TableRow key={idx} className="border-zinc-800">
                  <TableCell className="font-medium text-foreground">
                    {kw.keyword}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className="bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      {kw.total_clicks.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                    >
                      {kw.total_impressions.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-zinc-300">
                    {kw.avg_ctr.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        kw.avg_position <= 3
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : kw.avg_position <= 10
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                      }
                    >
                      {kw.avg_position.toFixed(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
