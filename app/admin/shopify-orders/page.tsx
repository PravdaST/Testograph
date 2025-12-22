"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  ShoppingCart,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
  ExternalLink,
  TrendingUp,
  User,
  Mail,
  Calendar,
  CreditCard,
  Eye,
  Pill,
  MapPin,
  Phone,
  CloudDownload,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Truck,
  Copy,
  PackageCheck,
  PackageX,
  AlertCircle,
  RotateCcw,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Product {
  sku: string;
  type: string;
  title?: string;
  capsules: number;
  quantity: number;
  totalCapsules: number;
}

interface ShippingAddress {
  first_name?: string;
  last_name?: string;
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
}

interface EcontTrackingEvent {
  destinationType: string;
  officeName?: string;
  cityName?: string;
  time: string;
  officeCode?: string;
}

interface ShopifyOrder {
  id: string;
  shopify_order_id: string;
  shopify_order_number: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: ShippingAddress | null;
  products: Product[];
  total_price: string;
  currency: string;
  status: string;
  is_paid: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  tracking_number: string | null;
  tracking_url: string | null;
  tracking_company: string | null;
  fulfillment_status: string | null;
  // Econt tracking data
  econt_status?: string;
  econt_status_en?: string;
  econt_delivery_time?: string;
  econt_events?: EcontTrackingEvent[];
  econt_error?: string;
  is_delivered?: boolean;
}

interface Summary {
  total: number;
  paid: number;
  pending: number;
  totalRevenue: number;
  pendingRevenue: number;
  // Tracking stats
  withTracking: number;
  delivered: number;
  inTransit: number;
  returned: number;
  noTracking: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export default function ShopifyOrdersPage() {
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced?: number; fixed?: number; namesFixed?: number; trackingUpdated?: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [trackingFilter, setTrackingFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ShopifyOrder | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<string>("all"); // all, today, week, month
  const [exportMonth, setExportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncingDelivery, setIsSyncingDelivery] = useState(false);
  const [deliverySyncProgress, setDeliverySyncProgress] = useState<{
    current: number;
    total: number;
    batchNumber: number;
  } | null>(null);
  const [deliverySyncResult, setDeliverySyncResult] = useState<{
    synced: number;
    alreadySynced: number;
    failed: number;
    noFulfillment: number;
    total: number;
  } | null>(null);
  // Single order check state
  const [checkingOrderId, setCheckingOrderId] = useState<string | null>(null);
  const [singleCheckResult, setSingleCheckResult] = useState<{
    success: boolean;
    message: string;
    synced?: boolean;
    alreadySynced?: boolean;
  } | null>(null);

  // Generate last 12 months for export dropdown
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('bg-BG', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

  // Export returned orders as CSV
  const exportReturnedOrders = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/admin/export-returned-orders?month=${exportMonth}`);
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to export');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `returned_orders_${exportMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export returned orders');
    } finally {
      setIsExporting(false);
    }
  };

  // Sync delivered orders to Shopify (batch processing)
  const syncDeliveryToShopify = async () => {
    setIsSyncingDelivery(true);
    setDeliverySyncResult(null);
    setDeliverySyncProgress(null);

    let offset = 0;
    const batchSize = 25;
    let batchNumber = 0;
    let totalSynced = 0;
    let totalAlreadySynced = 0;
    let totalFailed = 0;
    let totalNoFulfillment = 0;
    let totalDelivered = 0;

    try {
      while (true) {
        batchNumber++;

        const response = await fetch('/api/admin/sync-delivery-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dryRun: false, batchSize, offset }),
        });
        const data = await response.json();

        if (!response.ok) {
          alert(data.error || 'Failed to sync delivery status');
          break;
        }

        // Accumulate results
        totalSynced += data.summary?.synced || 0;
        totalAlreadySynced += data.summary?.alreadySynced || 0;
        totalFailed += data.summary?.failed || 0;
        totalNoFulfillment += data.summary?.noFulfillment || 0;
        totalDelivered = data.batch?.totalDelivered || totalDelivered;

        // Update progress
        const currentProcessed = offset + (data.batch?.processed || 0);
        setDeliverySyncProgress({
          current: currentProcessed,
          total: totalDelivered,
          batchNumber,
        });

        // Check if we're done
        if (data.batch?.isComplete) {
          break;
        }

        // Move to next batch
        offset = data.batch?.nextOffset || (offset + batchSize);

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setDeliverySyncResult({
        synced: totalSynced,
        alreadySynced: totalAlreadySynced,
        failed: totalFailed,
        noFulfillment: totalNoFulfillment,
        total: totalDelivered,
      });
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync delivery status to Shopify');
    } finally {
      setIsSyncingDelivery(false);
      setDeliverySyncProgress(null);
    }
  };

  // Check single order delivery status in Econt
  const checkSingleOrderDelivery = async (orderId: string, showAlert: boolean = false) => {
    setCheckingOrderId(orderId);
    if (!showAlert) setSingleCheckResult(null);

    try {
      const response = await fetch('/api/admin/sync-delivery-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: false, testOrderId: orderId }),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data.error || 'Failed to check delivery status';
        if (showAlert) {
          alert(`❌ ${message}`);
        } else {
          setSingleCheckResult({ success: false, message });
        }
        return;
      }

      // Check the result
      const summary = data.summary || {};
      let resultMessage = '';
      let synced = false;
      let alreadySynced = false;

      if (summary.synced > 0) {
        resultMessage = 'Поръчката е маркирана като доставена и платена!';
        synced = true;
        // Refresh orders to show updated status
        await fetchOrders();
        // Update selected order if it's the one we checked
        if (selectedOrder && selectedOrder.shopify_order_id === orderId) {
          const updatedOrder = orders.find(o => o.shopify_order_id === orderId);
          if (updatedOrder) {
            setSelectedOrder(updatedOrder);
          }
        }
      } else if (summary.alreadySynced > 0) {
        resultMessage = 'Поръчката вече е синхронизирана.';
        alreadySynced = true;
      } else if (data.orders && data.orders.length === 0) {
        resultMessage = 'Поръчката не е намерена или няма tracking.';
      } else {
        resultMessage = 'Пратката още не е доставена в Econt.';
      }

      if (showAlert) {
        alert(synced ? `✅ ${resultMessage}` : `ℹ️ ${resultMessage}`);
      } else {
        setSingleCheckResult({ success: true, message: resultMessage, synced, alreadySynced });
      }
    } catch (error) {
      console.error('Single order check error:', error);
      const message = 'Грешка при проверка на статуса';
      if (showAlert) {
        alert(`❌ ${message}`);
      } else {
        setSingleCheckResult({ success: false, message });
      }
    } finally {
      setCheckingOrderId(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [statusFilter, trackingFilter, searchQuery, dateFilter]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, trackingFilter, currentPage, searchQuery, dateFilter]);

  // Sync orders from Shopify (import new + fix status mismatches + fix customer names + sync tracking)
  const syncWithShopify = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      // First sync missing orders
      const syncResponse = await fetch('/api/admin/shopify-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-missing' }),
      });
      const syncData = await syncResponse.json();

      // Then fix status mismatches (pending -> paid)
      const fixResponse = await fetch('/api/admin/shopify-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fix-status' }),
      });
      const fixData = await fixResponse.json();

      // Also fix customer names that are null or "undefined"
      const namesResponse = await fetch('/api/admin/shopify-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fix-customer-names' }),
      });
      const namesData = await namesResponse.json();

      // Sync tracking numbers from Shopify fulfillments
      const trackingResponse = await fetch('/api/admin/shopify-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-tracking' }),
      });
      const trackingData = await trackingResponse.json();

      setSyncResult({
        synced: syncData.synced || 0,
        fixed: fixData.fixed || 0,
        namesFixed: namesData.fixed || 0,
        trackingUpdated: trackingData.updated || 0,
      });

      // Refresh orders list
      await fetchOrders();
    } catch (error) {
      console.error('Error syncing with Shopify:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');
      if (statusFilter !== "all") params.set('status', statusFilter);
      if (trackingFilter !== "all") params.set('tracking', trackingFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (dateFilter !== "all") params.set('dateRange', dateFilter);

      const response = await fetch(`/api/admin/shopify-orders?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setSummary(data.summary || null);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== "") {
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("bg-BG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string | number, currency: string = "BGN") => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `${num.toFixed(2)} ${currency}`;
  };

  const getProductsDisplay = (products: Product[]) => {
    if (!products || products.length === 0) return "N/A";
    return products.map((p, i) => (
      <div key={i} className="text-sm">
        {p.quantity}x {p.title || p.sku}
        {p.totalCapsules > 0 && ` (${p.totalCapsules} caps)`}
      </div>
    ));
  };

  const getStatusBadge = (isPaid: boolean) => {
    if (isPaid) {
      return <Badge className="bg-green-500">Платена</Badge>;
    }
    return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Чакаща</Badge>;
  };

  const getEcontStatusBadge = (order: ShopifyOrder) => {
    if (!order.tracking_number) {
      return <span className="text-sm text-muted-foreground">Няма tracking</span>;
    }

    if (order.econt_error) {
      return <Badge variant="outline" className="text-red-600 border-red-600">Грешка</Badge>;
    }

    if (order.is_delivered) {
      return (
        <Badge className="bg-green-500">
          <PackageCheck className="w-3 h-3 mr-1" />
          Доставена
        </Badge>
      );
    }

    if (order.econt_status) {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <Truck className="w-3 h-3 mr-1" />
          {order.econt_status}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
        <Clock className="w-3 h-3 mr-1" />
        В обработка
      </Badge>
    );
  };

  const openOrderDetails = (order: ShopifyOrder) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
    setSingleCheckResult(null); // Clear previous check result
  };

  const getTotalCapsules = (products: Product[]) => {
    if (!products || products.length === 0) return 0;
    return products.reduce((sum, p) => sum + (p.totalCapsules || 0), 0);
  };

  // Skeleton Loading Component
  const SkeletonCard = ({ className = "" }: { className?: string }) => (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );

  const SkeletonTableRow = () => (
    <TableRow>
      <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-3 w-40 bg-muted animate-pulse rounded" />
        </div>
      </TableCell>
      <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
      <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
      <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded-full" /></TableCell>
      <TableCell><div className="h-4 w-28 bg-muted animate-pulse rounded" /></TableCell>
      <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full" /></TableCell>
      <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
      <TableCell className="text-right">
        <div className="flex gap-1 justify-end">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
      </TableCell>
    </TableRow>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-64 bg-muted animate-pulse rounded" />
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
              <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>

          {/* Filter Skeleton */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-24 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
          </div>

          {/* Summary Cards Skeleton - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          {/* Summary Cards Skeleton - Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {['Поръчка #', 'Клиент', 'Продукти', 'Сума', 'Плащане', 'Tracking #', 'Econt Статус', 'Дата', 'Действия'].map((h) => (
                        <TableHead key={h}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <SkeletonTableRow key={i} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-8 h-8" />
              Поръчки & Econt Проследяване
            </h1>
            <p className="text-muted-foreground mt-1">
              {pagination?.totalItems || summary?.total || 0} поръчки от Shopify
              {searchQuery && ` (търсене: "${searchQuery}")`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Търси имейл, име, поръчка #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button
              variant="default"
              onClick={syncWithShopify}
              disabled={isSyncing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CloudDownload className="w-4 h-4 mr-2" />
              )}
              {isSyncing ? 'Синхронизиране...' : 'Синхронизирай'}
            </Button>
            <Button variant="outline" onClick={() => fetchOrders()} disabled={isSyncing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Обнови
            </Button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4">
          {/* Payment Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Плащане:</span>
            <div className="flex gap-1">
              {(["all", "pending", "paid"] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all" ? "Всички" : status === "pending" ? "Чакащи" : "Платени"}
                </Button>
              ))}
            </div>
          </div>

          {/* Tracking Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Доставка:</span>
            <div className="flex gap-1">
              {[
                { key: "all", label: "Всички" },
                { key: "delivered", label: "Доставени" },
                { key: "in_transit", label: "В транзит" },
                { key: "returned", label: "Върнати" },
                { key: "no_tracking", label: "Без tracking" },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={trackingFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrackingFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Период:</span>
            <div className="flex gap-1">
              {[
                { key: "all", label: "Всички" },
                { key: "today", label: "Днес" },
                { key: "week", label: "Тази седмица" },
                { key: "month", label: "Този месец" },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={dateFilter === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Export Section */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Експорт:</span>
            <Select value={exportMonth} onValueChange={setExportMonth}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Избери месец" />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={exportReturnedOrders}
              disabled={isExporting}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Върнати (CSV)
            </Button>
          </div>
        </div>

        {/* Sync Result Message */}
        {syncResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Синхронизацията завърши!</p>
              <p className="text-sm text-green-700">
                {syncResult.synced > 0 && `${syncResult.synced} нови поръчки импортирани. `}
                {syncResult.fixed > 0 && `${syncResult.fixed} поръчки обновени на Платени. `}
                {syncResult.namesFixed > 0 && `${syncResult.namesFixed} имена на клиенти поправени. `}
                {syncResult.trackingUpdated > 0 && `${syncResult.trackingUpdated} tracking номера обновени. `}
                {syncResult.synced === 0 && syncResult.fixed === 0 && (syncResult.namesFixed || 0) === 0 && (syncResult.trackingUpdated || 0) === 0 && 'Всичко е актуално.'}
              </p>
            </div>
          </div>
        )}

        {/* Delivery Sync Result Message */}
        {deliverySyncResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <CloudDownload className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Синхронизацията със Shopify завърши!</p>
              <p className="text-sm text-blue-700">
                {deliverySyncResult.synced > 0 && `${deliverySyncResult.synced} поръчки маркирани като доставени. `}
                {deliverySyncResult.alreadySynced > 0 && `${deliverySyncResult.alreadySynced} вече синхронизирани. `}
                {deliverySyncResult.failed > 0 && `${deliverySyncResult.failed} неуспешни. `}
                {deliverySyncResult.noFulfillment > 0 && `${deliverySyncResult.noFulfillment} без fulfillment. `}
                {deliverySyncResult.synced === 0 && deliverySyncResult.alreadySynced === 0 && 'Няма поръчки за синхронизация.'}
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards - 2 rows */}
        {summary && (
          <>
            {/* Row 1: Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Общо Поръчки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{summary.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    Чакащи
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{summary.pending}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Платени
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{summary.paid}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Приходи (Платени)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalRevenue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-yellow-500" />
                    Чакащи Приходи
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(summary.pendingRevenue)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 2: Tracking Stats (for ALL orders) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-500" />
                    С Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{summary.withTracking}</div>
                  <p className="text-xs text-muted-foreground">от {summary.total} общо</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-green-500" />
                    Доставени
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{summary.delivered}</div>
                  <p className="text-xs text-muted-foreground mb-2">успешно доставени</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={syncDeliveryToShopify}
                    disabled={isSyncingDelivery}
                  >
                    {isSyncingDelivery ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        {deliverySyncProgress
                          ? `${deliverySyncProgress.current}/${deliverySyncProgress.total}`
                          : 'Стартиране...'}
                      </>
                    ) : (
                      <>
                        <CloudDownload className="w-3 h-3 mr-1" />
                        Синхронизирай с Shopify
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4 text-yellow-500" />
                    В Транзит
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{summary.inTransit}</div>
                  <p className="text-xs text-muted-foreground">на път към клиента</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-red-500" />
                    Върнати
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{summary.returned}</div>
                  <p className="text-xs text-muted-foreground">върнати/отказани</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-gray-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <PackageX className="w-4 h-4 text-gray-500" />
                    Без Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-600">{summary.noTracking}</div>
                  <p className="text-xs text-muted-foreground">без tracking номер</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Поръчки</CardTitle>
            <CardDescription>
              {orders.length} поръчки показани
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Няма намерени поръчки</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Поръчка #</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Продукти</TableHead>
                      <TableHead>Сума</TableHead>
                      <TableHead>Плащане</TableHead>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Econt Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openOrderDetails(order)}
                      >
                        <TableCell className="font-mono text-sm">
                          #{order.shopify_order_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer_name || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_email || "No email"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getProductsDisplay(order.products)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total_price, order.currency)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.is_paid)}</TableCell>
                        <TableCell>
                          {order.tracking_number ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-mono">{order.tracking_number}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(order.tracking_number || '');
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Няма tracking</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getEcontStatusBadge(order)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {/* Quick Check Econt Status */}
                            {order.tracking_number && !order.is_paid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  checkSingleOrderDelivery(order.shopify_order_id, true);
                                }}
                                disabled={checkingOrderId === order.shopify_order_id}
                                title="Провери статус в Econt"
                              >
                                {checkingOrderId === order.shopify_order_id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Search className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openOrderDetails(order);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  `https://shop.testograph.eu/admin/orders/${order.shopify_order_id}`,
                                  "_blank"
                                );
                              }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Показване {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalItems)} от {pagination.totalItems} поръчки
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm font-medium">Страница {pagination.page}</span>
                    <span className="text-sm text-muted-foreground">от {pagination.totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) setSingleCheckResult(null); // Clear result when closing
      }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Поръчка #{selectedOrder.shopify_order_number}
                </SheetTitle>
                <SheetDescription>
                  {formatDate(selectedOrder.created_at)}
                </SheetDescription>
              </SheetHeader>

              {/* Status Bar */}
              <div className="mt-4 flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Статус на плащане</span>
                {getStatusBadge(selectedOrder.is_paid)}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="customer" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="customer" className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    Клиент
                  </TabsTrigger>
                  <TabsTrigger value="products" className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    Продукти
                  </TabsTrigger>
                  <TabsTrigger value="tracking" className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    Доставка
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Customer */}
                <TabsContent value="customer" className="mt-4 space-y-4">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Данни за клиент
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {selectedOrder.customer_name || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedOrder.customer_email || "Няма имейл"}
                        </span>
                      </div>
                      {selectedOrder.customer_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={`tel:${selectedOrder.customer_phone}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {selectedOrder.customer_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shipping_address && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Адрес за доставка
                      </h4>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                        <p className="font-medium">
                          {selectedOrder.shipping_address.name ||
                            `${selectedOrder.shipping_address.first_name || ''} ${selectedOrder.shipping_address.last_name || ''}`.trim() ||
                            selectedOrder.customer_name}
                        </p>
                        {selectedOrder.shipping_address.address1 && (
                          <p className="text-sm">{selectedOrder.shipping_address.address1}</p>
                        )}
                        {selectedOrder.shipping_address.address2 && (
                          <p className="text-sm">{selectedOrder.shipping_address.address2}</p>
                        )}
                        <p className="text-sm">
                          {[
                            selectedOrder.shipping_address.city,
                            selectedOrder.shipping_address.province,
                            selectedOrder.shipping_address.zip
                          ].filter(Boolean).join(', ')}
                        </p>
                        {selectedOrder.shipping_address.country && (
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.shipping_address.country}
                          </p>
                        )}
                        {selectedOrder.shipping_address.phone && (
                          <div className="flex items-center gap-2 pt-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={`tel:${selectedOrder.shipping_address.phone}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {selectedOrder.shipping_address.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Дати
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Създадена</span>
                        <span>{formatDate(selectedOrder.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Обновена</span>
                        <span>{formatDate(selectedOrder.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Products */}
                <TabsContent value="products" className="mt-4 space-y-4">
                  {/* Products List */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Продукти в поръчката
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.products && selectedOrder.products.length > 0 ? (
                        selectedOrder.products.map((product, index) => (
                          <div
                            key={index}
                            className="bg-muted/50 rounded-lg p-4 space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {product.title || product.sku}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  SKU: {product.sku}
                                </p>
                              </div>
                              <Badge variant="secondary">x{product.quantity}</Badge>
                            </div>
                            {product.capsules > 0 ? (
                              <div className="flex items-center gap-2 text-sm">
                                <Pill className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {product.capsules} капс./бр. = {product.totalCapsules} общо
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Package className="w-4 h-4" />
                                <span>Дигитален продукт</span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">Няма продукти</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Pill className="w-4 h-4" />
                        Общо капсули
                      </span>
                      <span className="font-bold text-lg">
                        {getTotalCapsules(selectedOrder.products)}
                      </span>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Плащане
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Общо</span>
                        <span className="text-2xl font-bold">
                          {formatCurrency(selectedOrder.total_price, selectedOrder.currency)}
                        </span>
                      </div>
                      {selectedOrder.paid_at && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Платено на</span>
                          <span className="text-green-600">
                            {formatDate(selectedOrder.paid_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Tracking */}
                <TabsContent value="tracking" className="mt-4 space-y-4">
                  {/* Econt Tracking */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Econt Проследяване
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      {selectedOrder.tracking_number ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Tracking #</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">
                                {selectedOrder.tracking_number}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedOrder.tracking_number || '');
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          {selectedOrder.tracking_company && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Куриер</span>
                              <span className="font-medium">{selectedOrder.tracking_company}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Статус</span>
                            {getEcontStatusBadge(selectedOrder)}
                          </div>
                          {selectedOrder.econt_delivery_time && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Доставено на</span>
                              <span className="text-green-600 font-medium">
                                {formatDate(selectedOrder.econt_delivery_time)}
                              </span>
                            </div>
                          )}

                          {selectedOrder.tracking_url && (
                            <div className="pt-2 border-t">
                              <a
                                href={selectedOrder.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Проследи пратката в Econt
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground font-medium">Няма tracking номер</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ще се появи след fulfillment в Shopify
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracking Events */}
                  {selectedOrder.econt_events && selectedOrder.econt_events.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        История на пратката
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedOrder.econt_events.map((event, index) => (
                          <div key={index} className="text-sm border-l-2 border-blue-300 pl-3 py-1 bg-muted/30 rounded-r-lg">
                            <p className="font-medium">{event.destinationType}</p>
                            <p className="text-muted-foreground">
                              {[event.officeName, event.cityName].filter(Boolean).join(', ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(event.time)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Separator className="my-4" />

              {/* Actions - Always visible */}
              <div className="space-y-3">
                  {/* Single Order Check Result */}
                  {singleCheckResult && (
                    <div className={`rounded-lg p-3 flex items-start gap-2 ${
                      singleCheckResult.success
                        ? singleCheckResult.synced
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-blue-50 border border-blue-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      {singleCheckResult.success ? (
                        singleCheckResult.synced ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        )
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <p className={`text-sm ${
                        singleCheckResult.success
                          ? singleCheckResult.synced
                            ? 'text-green-700'
                            : 'text-blue-700'
                          : 'text-red-700'
                      }`}>
                        {singleCheckResult.message}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {/* Check Econt Status Button */}
                    {selectedOrder.tracking_number && !selectedOrder.is_paid && (
                      <Button
                        variant="default"
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                        onClick={() => checkSingleOrderDelivery(selectedOrder.shopify_order_id)}
                        disabled={checkingOrderId === selectedOrder.shopify_order_id}
                      >
                        {checkingOrderId === selectedOrder.shopify_order_id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Проверяване...
                          </>
                        ) : (
                          <>
                            <Truck className="w-4 h-4 mr-2" />
                            Провери Econt статус
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        window.open(
                          `https://shop.testograph.eu/admin/orders/${selectedOrder.shopify_order_id}`,
                          "_blank"
                        );
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Виж в Shopify
                    </Button>
                  </div>
                </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
