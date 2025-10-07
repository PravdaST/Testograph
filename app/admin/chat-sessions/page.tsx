'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, FileText, MessageSquare, ChevronLeft, ChevronRight, Loader2, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/utils/exportToCSV';

interface ChatSession {
  id: string;
  email: string;
  pdf_filename: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ChatSessionsResponse {
  sessions: ChatSession[];
  total: number;
  limit: number;
  offset: number;
}

export default function ChatSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchSessions();
  }, [currentPage, search]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/chat-sessions?${params}`);
      const data: ChatSessionsResponse = await response.json();

      if (response.ok) {
        setSessions(data.sessions);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / limit);

  const handleExport = () => {
    const exportData = sessions.map((session) => ({
      Email: session.email,
      'PDF Filename': session.pdf_filename || 'N/A',
      'Message Count': session.message_count,
      'Created At': formatDate(session.created_at),
      'Last Activity': formatDate(session.updated_at),
    }));

    exportToCSV(exportData, `chat-sessions-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chat Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Преглед на всички AI чат сесии и качени PDF файлове
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Всички Сесии</CardTitle>
                <CardDescription>
                  Общо {total} {total === 1 ? 'сесия' : 'сесии'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Търси по email..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={sessions.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {search ? 'Няма намерени сесии' : 'Още няма chat сесии'}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>PDF Файл</TableHead>
                        <TableHead className="text-center">Съобщения</TableHead>
                        <TableHead>Създадена</TableHead>
                        <TableHead>Последна активност</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow
                          key={session.id}
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => router.push(`/admin/chat-sessions/${session.id}`)}
                        >
                          <TableCell className="font-medium">{session.email}</TableCell>
                          <TableCell>
                            {session.pdf_filename ? (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm truncate max-w-[200px]">
                                  {session.pdf_filename}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Няма PDF</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center gap-1">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              {session.message_count}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(session.created_at)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(session.updated_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/chat-sessions/${session.id}`);
                              }}
                            >
                              Виж детайли
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Страница {currentPage} от {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Предишна
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Следваща
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
