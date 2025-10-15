'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Clock, MapPin, Target, TrendingUp, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { bg } from 'date-fns/locale';

interface SessionJourneyModalProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TimelineEvent {
  eventId: string;
  timestamp: string;
  eventType: string;
  stepNumber: number | null;
  description: string;
  metadata: any;
}

interface SessionJourneyData {
  session: {
    sessionId: string;
    email: string;
    userData: any;
    entryTime: string;
    lastActivity: string;
    currentStep: number;
    maxStepReached: number;
    completed: boolean;
    offerTier: string | null;
    exitStep: number | null;
    utmData: any;
    userAgent: string;
    totalTimeSeconds: number;
  };
  timeline: TimelineEvent[];
  eventCounts: {
    step_entered: number;
    button_clicked: number;
    input_changed: number;
    video_interaction: number;
    form_submitted: number;
  };
  totalEvents: number;
}

// Total steps in WaitingRoomFunnel (must match value in WaitingRoomFunnel.tsx)
const TOTAL_FUNNEL_STEPS = 8;

export function SessionJourneyModal({ sessionId, isOpen, onClose }: SessionJourneyModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SessionJourneyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId && isOpen) {
      fetchJourney();
    }
  }, [sessionId, isOpen]);

  const fetchJourney = async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/analytics/session-journey?sessionId=${sessionId}`);

      if (!res.ok) {
        throw new Error('Failed to fetch session journey');
      }

      const journeyData = await res.json();
      setData(journeyData);
    } catch (err: any) {
      console.error('Error fetching journey:', err);
      setError(err.message || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'step_entered':
        return '📍';
      case 'button_clicked':
        return '👆';
      case 'input_changed':
        return '✏️';
      case 'video_interaction':
        return '🎥';
      case 'form_submitted':
        return '📝';
      case 'session_started':
        return '🚀';
      case 'session_completed':
        return '✅';
      case 'session_exited':
        return '❌';
      default:
        return '•';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Session Journey</DialogTitle>
          <DialogDescription>
            {sessionId ? `Session ID: ${sessionId.slice(0, 8)}...` : 'Loading...'}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12 text-destructive">
            <p>{error}</p>
          </div>
        )}

        {data && (
          <ScrollArea className="h-[600px] pr-4">
            {/* Session Overview */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />
                    User
                  </span>
                  <span className="font-medium">
                    {data.session.userData?.name || data.session.email || 'Anonymous'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Progress
                  </span>
                  <span className="font-medium">
                    Step {data.session.currentStep} / {TOTAL_FUNNEL_STEPS}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Time
                  </span>
                  <span className="font-medium">{formatTime(data.session.totalTimeSeconds)}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Status
                  </span>
                  {data.session.completed ? (
                    <Badge variant="default" className="bg-green-500 w-fit">
                      Completed
                    </Badge>
                  ) : data.session.exitStep ? (
                    <Badge variant="destructive" className="w-fit">
                      Exited
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="w-fit">
                      Active
                    </Badge>
                  )}
                </div>
              </div>

              {/* UTM Data */}
              {(data.session.utmData?.source || data.session.utmData?.medium || data.session.utmData?.campaign) && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    UTM Parameters
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {data.session.utmData.source && (
                      <div>
                        <span className="text-muted-foreground">Source: </span>
                        <span className="font-medium">{data.session.utmData.source}</span>
                      </div>
                    )}
                    {data.session.utmData.medium && (
                      <div>
                        <span className="text-muted-foreground">Medium: </span>
                        <span className="font-medium">{data.session.utmData.medium}</span>
                      </div>
                    )}
                    {data.session.utmData.campaign && (
                      <div>
                        <span className="text-muted-foreground">Campaign: </span>
                        <span className="font-medium">{data.session.utmData.campaign}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event Stats */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-semibold mb-2">Event Summary</p>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Steps: </span>
                    <span className="font-medium">{data.eventCounts.step_entered}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clicks: </span>
                    <span className="font-medium">{data.eventCounts.button_clicked}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inputs: </span>
                    <span className="font-medium">{data.eventCounts.input_changed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Video: </span>
                    <span className="font-medium">{data.eventCounts.video_interaction}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Forms: </span>
                    <span className="font-medium">{data.eventCounts.form_submitted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg mb-4">Event Timeline ({data.totalEvents} events)</h3>

              {data.timeline.map((event, index) => {
                const timeAgo = formatDistanceToNow(new Date(event.timestamp), {
                  addSuffix: true,
                  locale: bg,
                });

                return (
                  <div key={event.eventId} className="flex gap-3 group">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                        {getEventIcon(event.eventType)}
                      </div>
                      {index < data.timeline.length - 1 && (
                        <div className="w-0.5 h-full min-h-[20px] bg-border" />
                      )}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{event.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.timestamp), 'PPpp', { locale: bg })} • {timeAgo}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.eventType}
                        </Badge>
                      </div>

                      {/* Show metadata if available */}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <details className="mt-2 text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Metadata
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
