import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { bg } from 'date-fns/locale';

interface SessionData {
  sessionId: string;
  email: string | null;
  name: string | null;
  currentStep: number;
  maxStep: number;
  completed: boolean;
  entryTime: string;
  lastActivity: string;
  offerTier: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  exitStep: number | null;
}

interface SessionsTableProps {
  sessions: SessionData[];
  onSessionClick?: (sessionId: string) => void;
}

// Total steps in WaitingRoomFunnel (must match value in WaitingRoomFunnel.tsx)
const TOTAL_FUNNEL_STEPS = 8;

export function SessionsTable({ sessions, onSessionClick }: SessionsTableProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Активни Сесии
          </CardTitle>
          <CardDescription>Индивидуални фунел сесии</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">Няма намерени сесии</p>
            <p className="text-sm text-muted-foreground mt-2">
              Сесиите ще се появят тук когато посетителите влязат във фунела
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Активни Сесии ({sessions.length})
        </CardTitle>
        <CardDescription>Кликнете на сесия за да видите пълния път</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Потребител</TableHead>
                <TableHead>Прогрес</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Оферта</TableHead>
                <TableHead>UTM Източник</TableHead>
                <TableHead>Последна Активност</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const progress = Math.round((session.maxStep / TOTAL_FUNNEL_STEPS) * 100);
                const timeAgo = formatDistanceToNow(new Date(session.lastActivity), {
                  addSuffix: true,
                  locale: bg,
                });

                return (
                  <TableRow key={session.sessionId} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {session.name || session.email || 'Анонимен'}
                        </span>
                        {session.email && session.name && (
                          <span className="text-xs text-muted-foreground">{session.email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            Step {session.currentStep} / {TOTAL_FUNNEL_STEPS}
                          </span>
                          <span className="font-semibold">{progress}%</span>
                        </div>
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.completed ? (
                        <Badge variant="default" className="bg-green-500">
                          ✓ Завършено
                        </Badge>
                      ) : session.exitStep ? (
                        <Badge variant="destructive">
                          Напуснал на {session.exitStep}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">В процес</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {session.offerTier ? (
                        <Badge
                          variant="outline"
                          className={
                            session.offerTier === 'premium'
                              ? 'border-orange-500 text-orange-500'
                              : session.offerTier === 'regular'
                              ? 'border-blue-500 text-blue-500'
                              : 'border-purple-500 text-purple-500'
                          }
                        >
                          {session.offerTier}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {session.utmSource ? (
                        <div className="flex flex-col text-sm">
                          <span>{session.utmSource}</span>
                          {session.utmMedium && (
                            <span className="text-xs text-muted-foreground">
                              през {session.utmMedium}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Директен</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {timeAgo}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {onSessionClick && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSessionClick(session.sessionId)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Виж
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
