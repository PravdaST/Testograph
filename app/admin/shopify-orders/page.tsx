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
} from "lucide-react";

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
}

interface Summary {
  total: number;
  paid: number;
  pending: number;
  totalRevenue: number;
  pendingRevenue: number;
}

export default function ShopifyOrdersPage() {
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced?: number; fixed?: number; namesFixed?: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ShopifyOrder | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Sync orders from Shopify (import new + fix status mismatches + fix customer names)
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

      setSyncResult({
        synced: syncData.synced || 0,
        fixed: fixData.fixed || 0,
        namesFixed: namesData.fixed || 0,
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
      const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const response = await fetch(`/api/admin/shopify-orders?limit=100${statusParam}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        {p.quantity}x {p.title || p.sku} ({p.totalCapsules} caps)
      </div>
    ));
  };

  const getStatusBadge = (isPaid: boolean) => {
    if (isPaid) {
      return <Badge className="bg-green-500">Paid</Badge>;
    }
    return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
  };

  const openOrderDetails = (order: ShopifyOrder) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const getTotalCapsules = (products: Product[]) => {
    if (!products || products.length === 0) return 0;
    return products.reduce((sum, p) => sum + (p.totalCapsules || 0), 0);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
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
              Shopify Orders
            </h1>
            <p className="text-muted-foreground mt-1">
              {summary?.total || 0} orders from Shopify
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1">
              {(["all", "pending", "paid"] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all" ? "All" : status === "pending" ? "Pending" : "Paid"}
                </Button>
              ))}
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
              {isSyncing ? 'Syncing...' : 'Sync with Shopify'}
            </Button>
            <Button variant="outline" onClick={fetchOrders} disabled={isSyncing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Sync Result Message */}
        {syncResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Sync completed!</p>
              <p className="text-sm text-green-700">
                {syncResult.synced > 0 && `${syncResult.synced} new orders imported. `}
                {syncResult.fixed > 0 && `${syncResult.fixed} orders updated to Paid. `}
                {syncResult.namesFixed > 0 && `${syncResult.namesFixed} customer names fixed. `}
                {syncResult.synced === 0 && syncResult.fixed === 0 && (syncResult.namesFixed || 0) === 0 && 'Everything is up to date.'}
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Total Orders
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
                  Pending
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
                  Paid
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
                  Revenue (Paid)
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
                  Pending Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(summary.pendingRevenue)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              {orders.length} orders displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
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
          </CardContent>
        </Card>
      </div>

      {/* Order Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order #{selectedOrder.shopify_order_number}
                </SheetTitle>
                <SheetDescription>
                  {formatDate(selectedOrder.created_at)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(selectedOrder.is_paid)}
                </div>

                <Separator />

                {/* Customer Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer
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
                        {selectedOrder.customer_email || "No email"}
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

                <Separator />

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <>
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Shipping Address
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
                    <Separator />
                  </>
                )}

                {/* Products */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Products
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
                          <div className="flex items-center gap-2 text-sm">
                            <Pill className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {product.capsules} caps/unit = {product.totalCapsules} total caps
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No products</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Total Capsules
                    </span>
                    <span className="font-bold text-lg">
                      {getTotalCapsules(selectedOrder.products)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Payment */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-2xl font-bold">
                        {formatCurrency(selectedOrder.total_price, selectedOrder.currency)}
                      </span>
                    </div>
                    {selectedOrder.paid_at && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Paid At</span>
                        <span className="text-green-600">
                          {formatDate(selectedOrder.paid_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Dates */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Dates
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span>{formatDate(selectedOrder.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
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
                    View in Shopify
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
