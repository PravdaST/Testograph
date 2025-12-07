"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Calendar,
  Filter,
  ExternalLink,
  Loader2,
} from "lucide-react";

// Types
export interface DataColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  width?: string;
}

export interface DataSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  dataType: string; // e.g., 'quiz_sessions', 'orders', 'completions'
  columns: DataColumn[];
  fetchUrl: string; // API endpoint
  additionalFilters?: Record<string, string>; // Extra filters for API
  enableSearch?: boolean;
  enableCategoryFilter?: boolean;
  enableLevelFilter?: boolean;
  enableDateFilter?: boolean;
  enableExport?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
  navigateToProfile?: boolean;
}

export function DataSheet({
  open,
  onOpenChange,
  title,
  description,
  dataType,
  columns,
  fetchUrl,
  additionalFilters = {},
  enableSearch = true,
  enableCategoryFilter = true,
  enableLevelFilter = false,
  enableDateFilter = true,
  enableExport = true,
  onRowClick,
  navigateToProfile = true,
}: DataSheetProps) {
  const router = useRouter();

  // State
  const [data, setData] = React.useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Pagination
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [totalCount, setTotalCount] = React.useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [levelFilter, setLevelFilter] = React.useState<string>("all");
  const [dateFrom, setDateFrom] = React.useState<string>("");
  const [dateTo, setDateTo] = React.useState<string>("");

  // Sorting
  const [sortBy, setSortBy] = React.useState<string>("created_at");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Export state
  const [exporting, setExporting] = React.useState(false);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    if (!open) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        dataType,
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
        ...additionalFilters,
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (levelFilter !== "all") params.set("level", levelFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const response = await fetch(`${fetchUrl}?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      setData(result.data || []);
      setTotalCount(result.totalCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [open, dataType, page, pageSize, sortBy, sortOrder, debouncedSearch, categoryFilter, levelFilter, dateFrom, dateTo, fetchUrl, additionalFilters]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortOrder("desc");
    }
  };

  // Handle row click
  const handleRowClick = (row: Record<string, unknown>) => {
    if (onRowClick) {
      onRowClick(row);
    } else if (navigateToProfile && row.email) {
      router.push(`/admin/users/${encodeURIComponent(row.email as string)}`);
      onOpenChange(false);
    }
  };

  // Export data
  const handleExport = async (exportAll: boolean) => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        dataType,
        export: "true",
        exportAll: exportAll.toString(),
        sortBy,
        sortOrder,
        ...additionalFilters,
      });

      if (!exportAll) {
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        if (levelFilter !== "all") params.set("level", levelFilter);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
      }

      const response = await fetch(`${fetchUrl}?${params.toString()}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dataType}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setLevelFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || levelFilter !== "all" || dateFrom || dateTo;

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortOrder === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl">{title}</SheetTitle>
          {description && (
            <SheetDescription>{description}</SheetDescription>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Общо: <strong>{totalCount.toLocaleString()}</strong> записа</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Филтрирани
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Filters Section */}
        <div className="space-y-3 mb-4">
          {/* Search */}
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Търсене по email или име..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          )}

          {/* Filter Row */}
          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            {enableCategoryFilter && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички</SelectItem>
                  <SelectItem value="libido">Libido</SelectItem>
                  <SelectItem value="muscle">Muscle</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Level Filter */}
            {enableLevelFilter && (
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Ниво" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="optimal">Optimal</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Date Range */}
            {enableDateFilter && (
              <>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-[130px] h-9"
                    placeholder="От"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-[130px] h-9"
                    placeholder="До"
                  />
                </div>
              </>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Изчисти
              </Button>
            )}

            {/* Export Buttons */}
            {enableExport && (
              <div className="ml-auto flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(false)}
                  disabled={exporting || data.length === 0}
                >
                  {exporting ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3 mr-1" />
                  )}
                  Експорт {hasActiveFilters ? "(филтрирани)" : ""}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(true)}
                  disabled={exporting}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Всички
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    style={{ width: column.width }}
                    className={column.sortable ? "cursor-pointer select-none hover:bg-muted" : ""}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && renderSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
                {navigateToProfile && (
                  <TableHead className="w-10" />
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (navigateToProfile ? 1 : 0)} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (navigateToProfile ? 1 : 0)} className="h-32 text-center text-red-500">
                    Грешка: {error}
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (navigateToProfile ? 1 : 0)} className="h-32 text-center text-muted-foreground">
                    Няма намерени записи
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow
                    key={(row.id as string) || index}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(row)}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render
                          ? column.render(row[column.key], row)
                          : (row[column.key] as React.ReactNode) || "-"}
                      </TableCell>
                    ))}
                    {navigateToProfile && row.email && (
                      <TableCell>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Покажи</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">на страница</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-2">
              Страница {page} от {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Pre-defined column configurations for common data types
export const quizSessionColumns: DataColumn[] = [
  {
    key: "email",
    label: "Email",
    sortable: true,
    width: "200px",
  },
  {
    key: "first_name",
    label: "Име",
    sortable: true,
    width: "120px",
  },
  {
    key: "category",
    label: "Категория",
    sortable: true,
    width: "100px",
    render: (value) => {
      const colors: Record<string, string> = {
        libido: "bg-pink-100 text-pink-800",
        muscle: "bg-blue-100 text-blue-800",
        energy: "bg-yellow-100 text-yellow-800",
      };
      return (
        <Badge className={colors[value as string] || "bg-gray-100"}>
          {(value as string) || "-"}
        </Badge>
      );
    },
  },
  {
    key: "total_score",
    label: "Score",
    sortable: true,
    width: "80px",
    render: (value) => (
      <span className="font-mono">{value as number || 0}</span>
    ),
  },
  {
    key: "determined_level",
    label: "Ниво",
    sortable: true,
    width: "100px",
    render: (value) => {
      const colors: Record<string, string> = {
        low: "bg-red-100 text-red-800",
        moderate: "bg-orange-100 text-orange-800",
        good: "bg-green-100 text-green-800",
        optimal: "bg-emerald-100 text-emerald-800",
      };
      return (
        <Badge className={colors[value as string] || "bg-gray-100"}>
          {(value as string) || "-"}
        </Badge>
      );
    },
  },
  {
    key: "created_at",
    label: "Дата",
    sortable: true,
    width: "150px",
    render: (value) => {
      if (!value) return "-";
      return new Date(value as string).toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
];

export const orderColumns: DataColumn[] = [
  {
    key: "order_number",
    label: "Поръчка",
    sortable: true,
    width: "100px",
    render: (value) => (
      <span className="font-mono text-sm">#{value as string}</span>
    ),
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    width: "180px",
  },
  {
    key: "customer_name",
    label: "Клиент",
    sortable: true,
    width: "140px",
  },
  {
    key: "total_price",
    label: "Сума",
    sortable: true,
    width: "90px",
    render: (value, row) => (
      <span className="font-mono">
        {(value as number || 0).toFixed(2)} {(row.currency as string) || "BGN"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Статус",
    sortable: true,
    width: "100px",
    render: (value) => {
      const isPaid = value === "paid";
      return (
        <Badge className={isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
          {isPaid ? "Платена" : "Чакаща"}
        </Badge>
      );
    },
  },
  {
    key: "created_at",
    label: "Дата",
    sortable: true,
    width: "150px",
    render: (value) => {
      if (!value) return "-";
      return new Date(value as string).toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
];

export const sessionEventColumns: DataColumn[] = [
  {
    key: "session_id",
    label: "Session ID",
    sortable: true,
    width: "120px",
    render: (value) => (
      <span className="font-mono text-xs">{((value as string) || "").slice(0, 8)}...</span>
    ),
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    width: "180px",
  },
  {
    key: "category",
    label: "Категория",
    sortable: true,
    width: "100px",
    render: (value) => {
      const colors: Record<string, string> = {
        libido: "bg-pink-100 text-pink-800",
        muscle: "bg-blue-100 text-blue-800",
        energy: "bg-yellow-100 text-yellow-800",
      };
      return (
        <Badge className={colors[value as string] || "bg-gray-100"}>
          {(value as string) || "-"}
        </Badge>
      );
    },
  },
  {
    key: "step_count",
    label: "Стъпки",
    sortable: true,
    width: "80px",
    render: (value) => (
      <span className="font-mono">{value as number || 0}</span>
    ),
  },
  {
    key: "completed",
    label: "Статус",
    sortable: true,
    width: "100px",
    render: (value) => (
      <Badge className={value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
        {value ? "Завършен" : "Изоставен"}
      </Badge>
    ),
  },
  {
    key: "created_at",
    label: "Дата",
    sortable: true,
    width: "150px",
    render: (value) => {
      if (!value) return "-";
      return new Date(value as string).toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
];

// Quiz completions without orders (CRM segment: quizNoOrder)
export const quizNoOrderColumns: DataColumn[] = [
  {
    key: "email",
    label: "Email",
    sortable: true,
    width: "200px",
  },
  {
    key: "first_name",
    label: "Име",
    sortable: true,
    width: "120px",
  },
  {
    key: "category",
    label: "Категория",
    sortable: true,
    width: "100px",
    render: (value) => {
      const colors: Record<string, string> = {
        libido: "bg-pink-100 text-pink-800",
        muscle: "bg-blue-100 text-blue-800",
        energy: "bg-yellow-100 text-yellow-800",
      };
      return (
        <Badge className={colors[value as string] || "bg-gray-100"}>
          {(value as string) || "-"}
        </Badge>
      );
    },
  },
  {
    key: "total_score",
    label: "Score",
    sortable: true,
    width: "80px",
    render: (value) => (
      <span className="font-mono">{value as number || 0}</span>
    ),
  },
  {
    key: "determined_level",
    label: "Ниво",
    sortable: true,
    width: "100px",
    render: (value) => {
      const colors: Record<string, string> = {
        low: "bg-red-100 text-red-800",
        moderate: "bg-orange-100 text-orange-800",
        good: "bg-green-100 text-green-800",
        optimal: "bg-emerald-100 text-emerald-800",
      };
      const labels: Record<string, string> = {
        low: "Нисък",
        moderate: "Умерен",
        good: "Добър",
        optimal: "Оптимален",
      };
      return (
        <Badge className={colors[value as string] || "bg-gray-100"}>
          {labels[value as string] || (value as string) || "-"}
        </Badge>
      );
    },
  },
  {
    key: "quiz_date",
    label: "Quiz дата",
    sortable: true,
    width: "150px",
    render: (value) => {
      if (!value) return "-";
      return new Date(value as string).toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
];

// Conversions - Quiz completions that have orders
export const conversionColumns: DataColumn[] = [
  {
    key: "email",
    label: "Email",
    sortable: true,
    width: "180px",
  },
  {
    key: "first_name",
    label: "Име",
    sortable: true,
    width: "100px",
  },
  {
    key: "category",
    label: "Категория",
    sortable: true,
    width: "90px",
    render: (value) => {
      const colors: Record<string, string> = {
        libido: "bg-pink-100 text-pink-800",
        muscle: "bg-blue-100 text-blue-800",
        energy: "bg-yellow-100 text-yellow-800",
      };
      return (
        <Badge className={colors[value as string] || "bg-gray-100"}>
          {(value as string) || "-"}
        </Badge>
      );
    },
  },
  {
    key: "order_number",
    label: "Поръчка",
    sortable: true,
    width: "90px",
    render: (value) => (
      <span className="font-mono text-sm">#{value as string}</span>
    ),
  },
  {
    key: "order_amount",
    label: "Сума",
    sortable: true,
    width: "80px",
    render: (value) => (
      <span className="font-mono">{(value as number || 0).toFixed(2)} BGN</span>
    ),
  },
  {
    key: "order_status",
    label: "Статус",
    sortable: true,
    width: "90px",
    render: (value) => {
      const isPaid = value === "paid";
      return (
        <Badge className={isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
          {isPaid ? "Платена" : "Чакаща"}
        </Badge>
      );
    },
  },
  {
    key: "quiz_date",
    label: "Quiz",
    sortable: true,
    width: "120px",
    render: (value) => {
      if (!value) return "-";
      return new Date(value as string).toLocaleDateString("bg-BG");
    },
  },
];

// Orders without quiz completions (CRM segment: orderNoQuiz)
export const orderNoQuizColumns: DataColumn[] = [
  {
    key: "email",
    label: "Email",
    sortable: true,
    width: "200px",
  },
  {
    key: "customer_name",
    label: "Клиент",
    sortable: true,
    width: "140px",
  },
  {
    key: "order_number",
    label: "Поръчка",
    sortable: true,
    width: "100px",
    render: (value) => (
      <span className="font-mono text-sm">#{value as string}</span>
    ),
  },
  {
    key: "total_price",
    label: "Сума",
    sortable: true,
    width: "90px",
    render: (value, row) => (
      <span className="font-mono">
        {(value as number || 0).toFixed(2)} {(row.currency as string) || "BGN"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Статус",
    sortable: true,
    width: "100px",
    render: (value) => {
      const isPaid = value === "paid";
      return (
        <Badge className={isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
          {isPaid ? "Платена" : "Чакаща"}
        </Badge>
      );
    },
  },
  {
    key: "order_date",
    label: "Дата",
    sortable: true,
    width: "150px",
    render: (value) => {
      if (!value) return "-";
      return new Date(value as string).toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
];
