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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Search,
  ClipboardList,
  Loader2,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Calendar,
  X,
} from "lucide-react";
import { exportToCSV } from "@/lib/utils/exportToCSV";

interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action_type: string;
  target_user_id: string | null;
  target_user_email: string | null;
  changes_before: any;
  changes_after: any;
  description: string;
  ip_address: string | null;
  created_at: string;
}

const ACTION_TYPES = [
  { value: "all", label: "Всички Действия" },
  // User Actions
  { value: "grant_pro_access", label: "Даване на PRO достъп" },
  { value: "revoke_pro_access", label: "Премахване на PRO достъп" },
  { value: "reset_password", label: "Промяна на парола" },
  { value: "ban_user", label: "Блокиране на потребител" },
  { value: "unban_user", label: "Разблокиране на потребител" },
  { value: "edit_profile", label: "Редактиране на профил" },
  { value: "delete_user", label: "Изтриване на потребител" },
  // Purchase Actions
  { value: "create_purchase", label: "Създаване на покупка" },
  { value: "edit_purchase", label: "Редактиране на покупка" },
  { value: "delete_purchase", label: "Изтриване на покупка" },
  // Admin Actions
  { value: "add_admin", label: "Добавяне на админ" },
  { value: "remove_admin", label: "Премахване на админ" },
  { value: "update_admin_role", label: "Промяна на роля" },
  { value: "update_admin_permissions", label: "Промяна на permissions" },
  // Email Actions
  { value: "send_email", label: "Изпращане на email" },
  { value: "bulk_email", label: "Масово изпращане на email" },
  { value: "create_template", label: "Създаване на template" },
  { value: "update_template", label: "Редактиране на template" },
  { value: "delete_template", label: "Изтриване на template" },
  // Affiliate Actions
  { value: "approve_affiliate", label: "Одобряване на affiliate" },
  { value: "reject_affiliate", label: "Отхвърляне на affiliate" },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filters
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionType, dateFrom, dateTo]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionType !== "all") params.append("actionType", actionType);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      params.append("limit", limit.toString());
      params.append("offset", ((currentPage - 1) * limit).toString());

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleClearFilters = () => {
    setSearch("");
    setActionType("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("bg-BG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionTypeBadgeColor = (actionType: string): string => {
    if (actionType.includes("grant") || actionType.includes("add"))
      return "bg-green-600";
    if (
      actionType.includes("revoke") ||
      actionType.includes("delete") ||
      actionType.includes("ban")
    )
      return "bg-red-600";
    if (actionType.includes("edit") || actionType.includes("update"))
      return "bg-yellow-600";
    if (actionType.includes("email")) return "bg-purple-600";
    if (actionType.includes("create")) return "bg-blue-600";
    if (actionType.includes("unban")) return "bg-green-600";
    return "bg-gray-600";
  };

  const getActionTypeLabel = (actionType: string): string => {
    const found = ACTION_TYPES.find((t) => t.value === actionType);
    return found ? found.label : actionType;
  };

  const handleExport = () => {
    const exportData = filteredLogs.map((log) => ({
      Дата: formatDate(log.created_at),
      Админ: log.admin_email,
      Действие: getActionTypeLabel(log.action_type),
      Потребител: log.target_user_email || "N/A",
      Описание: log.description,
      "IP Адрес": log.ip_address || "N/A",
    }));

    exportToCSV(
      exportData,
      `audit-logs-${new Date().toISOString().split("T")[0]}`,
    );
  };

  // Client-side search filtering
  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.admin_email.toLowerCase().includes(searchLower) ||
      log.target_user_email?.toLowerCase().includes(searchLower) ||
      log.description.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(total / limit);
  const hasFilters = actionType !== "all" || dateFrom || dateTo || search;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            Проследяване на всички админ действия и промени в системата
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Филтри</CardTitle>
            <CardDescription>
              Филтрирайте логовете по дата, тип действие или потребител
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  От Дата
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  До Дата
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Action Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Тип Действие</label>
                <Select
                  value={actionType}
                  onValueChange={(value) => {
                    setActionType(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Търсене
                </label>
                <Input
                  placeholder="Email, описание..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-0">Actions</label>
                <div className="flex gap-2">
                  {hasFilters && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Изчисти
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Всички Логове
                </CardTitle>
                <CardDescription>
                  Показани {filteredLogs.length} от {total}{" "}
                  {total === 1 ? "запис" : "записа"}
                  {search && ` (филтрирани по "${search}")`}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={filteredLogs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {hasFilters
                    ? "Няма намерени логове с тези филтри"
                    : "Все още няма audit логове"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Дата/Час</TableHead>
                        <TableHead>Админ</TableHead>
                        <TableHead>Действие</TableHead>
                        <TableHead>Потребител</TableHead>
                        <TableHead>Описание</TableHead>
                        <TableHead>IP Адрес</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <>
                          <TableRow
                            key={log.id}
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => toggleRowExpansion(log.id)}
                          >
                            <TableCell>
                              {expandedRows.has(log.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(log.created_at)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {log.admin_email}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getActionTypeBadgeColor(log.action_type)} text-white`}
                              >
                                {getActionTypeLabel(log.action_type)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {log.target_user_email || (
                                <span className="text-muted-foreground text-sm">
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-md truncate">
                              {log.description}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {log.ip_address || "—"}
                            </TableCell>
                          </TableRow>

                          {/* Expanded Row - JSON Changes */}
                          {expandedRows.has(log.id) && (
                            <TableRow>
                              <TableCell colSpan={7} className="bg-muted/50">
                                <div className="py-4 px-2">
                                  <h4 className="font-semibold mb-3">
                                    Детайли на промените:
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Before */}
                                    <div>
                                      <h5 className="text-sm font-medium mb-2 text-muted-foreground">
                                        Преди:
                                      </h5>
                                      <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                                        {log.changes_before
                                          ? JSON.stringify(
                                              log.changes_before,
                                              null,
                                              2,
                                            )
                                          : "Няма данни"}
                                      </pre>
                                    </div>
                                    {/* After */}
                                    <div>
                                      <h5 className="text-sm font-medium mb-2 text-muted-foreground">
                                        След:
                                      </h5>
                                      <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                                        {log.changes_after
                                          ? JSON.stringify(
                                              log.changes_after,
                                              null,
                                              2,
                                            )
                                          : "Няма данни"}
                                      </pre>
                                    </div>
                                  </div>
                                  {/* Additional Info */}
                                  <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Log ID:
                                      </span>
                                      <p className="font-mono text-xs">
                                        {log.id}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Admin ID:
                                      </span>
                                      <p className="font-mono text-xs">
                                        {log.admin_id}
                                      </p>
                                    </div>
                                    {log.target_user_id && (
                                      <div>
                                        <span className="text-muted-foreground">
                                          Target User ID:
                                        </span>
                                        <p className="font-mono text-xs">
                                          {log.target_user_id}
                                        </p>
                                      </div>
                                    )}
                                    {log.ip_address && (
                                      <div>
                                        <span className="text-muted-foreground">
                                          IP Address:
                                        </span>
                                        <p className="font-mono text-xs">
                                          {log.ip_address}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Страница {currentPage} от {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Предишна
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Следваща
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
