"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { SearchBar } from "@/components/admin/SearchBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Handshake,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  X,
  UserCheck,
  UserX,
} from "lucide-react";

interface AffiliateApplication {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  quiz_data: {
    experience: string;
    channels: string[];
    audienceSize: string;
    products: string[];
    motivation: string;
  };
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
  commission_rate?: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AffiliatesPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<AffiliateApplication[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(50);

  // Detail & approval modal
  const [selectedApplication, setSelectedApplication] =
    useState<AffiliateApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">(
    "approve",
  );
  const [commissionRate, setCommissionRate] = useState("5");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, searchQuery, statusFilter, dateFrom, dateTo]);

  const fetchApplications = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (currentPage * limit).toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await fetch(
        `/api/admin/affiliate-applications?${params.toString()}`,
      );
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications || []);
        setStats(data.stats);
        setTotalCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching affiliate applications:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleApprovalSubmit = async () => {
    if (!selectedApplication) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/admin/affiliate-applications/${selectedApplication.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: approvalAction === "approve" ? "approved" : "rejected",
            commission_rate:
              approvalAction === "approve"
                ? parseFloat(commissionRate)
                : undefined,
            admin_notes: adminNotes || undefined,
          }),
        },
      );

      if (response.ok) {
        // Refresh data
        await fetchApplications(true);
        setIsApprovalModalOpen(false);
        setIsDetailModalOpen(false);
        setAdminNotes("");
        setCommissionRate("5");
      }
    } catch (error) {
      console.error("Error updating application:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const openApprovalModal = (
    application: AffiliateApplication,
    action: "approve" | "reject",
  ) => {
    setSelectedApplication(application);
    setApprovalAction(action);
    setAdminNotes(application.admin_notes || "");
    setCommissionRate(application.commission_rate?.toString() || "5");
    setIsApprovalModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(0);
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || dateFrom || dateTo;

  const getStatusBadgeColor = (status: string) => {
    if (status === "approved") return "bg-green-500 text-white";
    if (status === "rejected") return "bg-red-500 text-white";
    if (status === "pending") return "bg-yellow-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getStatusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="h-4 w-4" />;
    if (status === "rejected") return <XCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(totalCount / limit);

  if (isLoading && !isRefreshing) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
              <Handshake className="h-8 w-8" />
              Афилиейт Заявки
            </h1>
            <p className="text-muted-foreground mt-1">
              Управление на заявки за афилиейт програмата
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchApplications(true)}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Обнови
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Общо Заявки"
              value={stats.total}
              icon={Handshake}
              description="Всички submission-и"
            />
            <StatCard
              title="Чакащи"
              value={stats.pending}
              icon={Clock}
              valueColor="text-yellow-600"
              description="Очакват одобрение"
            />
            <StatCard
              title="Одобрени"
              value={stats.approved}
              icon={CheckCircle}
              valueColor="text-green-600"
              description="Активни афилиейти"
            />
            <StatCard
              title="Отхвърлени"
              value={stats.rejected}
              icon={XCircle}
              valueColor="text-red-600"
              description="Неодобрени заявки"
            />
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Филтри
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Изчисти
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="search" className="text-xs mb-1">
                  Търсене (име/email)
                </Label>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Търси по име или email..."
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="status" className="text-xs mb-1">
                  Статус
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички</SelectItem>
                    <SelectItem value="pending">🟡 Чакащи</SelectItem>
                    <SelectItem value="approved">🟢 Одобрени</SelectItem>
                    <SelectItem value="rejected">🔴 Отхвърлени</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="date-from" className="text-xs mb-1">
                    От дата
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-xs mb-1">
                    До дата
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Заявки ({totalCount})</CardTitle>
            <CardDescription>
              Показани {applications.length} от {totalCount} заявки
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Handshake className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-semibold">Няма заявки</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasActiveFilters
                    ? "Пробвай да промениш филтрите"
                    : "Още няма submissions"}
                </p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Име</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Опит</TableHead>
                      <TableHead>Канали</TableHead>
                      <TableHead>Аудитория</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow
                        key={app.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedApplication(app);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(app.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {app.full_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {app.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {app.quiz_data.experience === "professional" &&
                            "👔 Професионалист"}
                          {app.quiz_data.experience === "hobby" && "🎯 Хоби"}
                          {app.quiz_data.experience === "beginner" &&
                            "🌱 Начинаещ"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {app.quiz_data.channels.length} канал(а)
                        </TableCell>
                        <TableCell className="text-sm">
                          {app.quiz_data.audienceSize}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(app.status)}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1">
                              {app.status === "pending" && "Чакащ"}
                              {app.status === "approved" && "Одобрен"}
                              {app.status === "rejected" && "Отхвърлен"}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {app.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openApprovalModal(app, "approve");
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openApprovalModal(app, "reject");
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApplication(app);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              Детайли →
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Страница {currentPage + 1} от {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    ← Предишна
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                    }
                    disabled={currentPage === totalPages - 1}
                  >
                    Следваща →
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Заявка от {selectedApplication?.full_name}
            </DialogTitle>
            <DialogDescription>{selectedApplication?.email}</DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4 mt-4">
              {/* Status */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  📊 Статус
                </h3>
                <div className="flex items-center gap-2">
                  <Badge
                    className={getStatusBadgeColor(selectedApplication.status)}
                  >
                    {getStatusIcon(selectedApplication.status)}
                    <span className="ml-1">
                      {selectedApplication.status === "pending" && "Чакащ"}
                      {selectedApplication.status === "approved" && "Одобрен"}
                      {selectedApplication.status === "rejected" && "Отхвърлен"}
                    </span>
                  </Badge>
                  {selectedApplication.status === "approved" &&
                    selectedApplication.commission_rate && (
                      <Badge variant="outline">
                        Комисионна: {selectedApplication.commission_rate}%
                      </Badge>
                    )}
                </div>
              </div>

              {/* Quiz Answers */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  📝 Отговори от Quiz
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Опит:</span>
                    <p className="font-medium">
                      {selectedApplication.quiz_data.experience ===
                        "professional" && "👔 Професионален афилиейт"}
                      {selectedApplication.quiz_data.experience === "hobby" &&
                        "🎯 Правя го като хоби"}
                      {selectedApplication.quiz_data.experience ===
                        "beginner" && "🌱 Започвам сега"}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">
                      Канали за промоция:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.quiz_data.channels.map(
                        (channel, idx) => (
                          <Badge key={idx} variant="secondary">
                            {channel}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground">
                      Размер на аудиторията:
                    </span>
                    <p className="font-medium">
                      {selectedApplication.quiz_data.audienceSize}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">
                      Интерес към продукти:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.quiz_data.products.map(
                        (product, idx) => (
                          <Badge key={idx} variant="secondary">
                            {product}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Мотивация:</span>
                    <p className="font-medium mt-1 p-2 bg-muted rounded">
                      {selectedApplication.quiz_data.motivation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedApplication.admin_notes && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    📌 Бележки от админ
                  </h3>
                  <p className="text-sm p-2 bg-muted rounded">
                    {selectedApplication.admin_notes}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>Заявка ID: {selectedApplication.id}</p>
                <p>Подадена: {formatDate(selectedApplication.created_at)}</p>
                <p>
                  Последна промяна: {formatDate(selectedApplication.updated_at)}
                </p>
              </div>

              {/* Actions */}
              {selectedApplication.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() =>
                      openApprovalModal(selectedApplication, "approve")
                    }
                    className="flex-1"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Одобри
                  </Button>
                  <Button
                    onClick={() =>
                      openApprovalModal(selectedApplication, "reject")
                    }
                    variant="destructive"
                    className="flex-1"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Отхвърли
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Modal */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve"
                ? "Одобри афилиейт заявка"
                : "Отхвърли заявка"}
            </DialogTitle>
            <DialogDescription>
              {selectedApplication?.full_name} ({selectedApplication?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {approvalAction === "approve" && (
              <div>
                <Label htmlFor="commission">Комисионна (%)</Label>
                <Select
                  value={commissionRate}
                  onValueChange={setCommissionRate}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5% - Starter</SelectItem>
                    <SelectItem value="10">10% - Pro</SelectItem>
                    <SelectItem value="15">15% - Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Бележки (опционално)</Label>
              <Textarea
                id="notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Добави бележки..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApprovalModalOpen(false)}
            >
              Отказ
            </Button>
            <Button
              onClick={handleApprovalSubmit}
              disabled={isProcessing}
              variant={approvalAction === "approve" ? "default" : "destructive"}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : approvalAction === "approve" ? (
                <UserCheck className="h-4 w-4 mr-2" />
              ) : (
                <UserX className="h-4 w-4 mr-2" />
              )}
              {approvalAction === "approve" ? "Одобри" : "Отхвърли"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
