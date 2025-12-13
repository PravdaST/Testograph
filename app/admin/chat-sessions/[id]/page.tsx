"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  User,
  Calendar,
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Bot,
} from "lucide-react";
import { exportToTextFile } from "@/lib/utils/exportToCSV";

interface CoachMessage {
  id: string;
  email: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  model_used?: string;
}

interface CoachSession {
  email: string;
  message_count: number;
  user_messages: number;
  assistant_messages: number;
  first_message_at: string;
  last_message_at: string;
}

interface SessionDetailsResponse {
  session: CoachSession;
  messages: CoachMessage[];
}

export default function ChatSessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string; // This is now a URL-encoded email

  const [session, setSession] = useState<CoachSession | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/chat-sessions/${sessionId}`);
      const data: SessionDetailsResponse = await response.json();

      if (response.ok) {
        setSession(data.session);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("bg-BG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("bg-BG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyTranscript = () => {
    const transcript = messages
      .map(
        (msg) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
      )
      .join("\n\n");

    navigator.clipboard.writeText(transcript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadTranscript = () => {
    const transcript = messages
      .map((msg) => {
        const timestamp = formatTime(msg.created_at);
        return `[${timestamp}] ${msg.role === "user" ? "User" : "AI Coach"}:\n${msg.content}`;
      })
      .join("\n\n---\n\n");

    const header = `App Coach Transcript - ${session?.email}\nFirst Message: ${session ? formatDate(session.first_message_at) : ""}\nLast Message: ${session ? formatDate(session.last_message_at) : ""}\nTotal Messages: ${session?.message_count || 0}\n\n${"=".repeat(60)}\n\n`;
    const fullTranscript = header + transcript;

    exportToTextFile(
      fullTranscript,
      `coach-transcript-${session?.email.replace("@", "_")}-${new Date().toISOString().split("T")[0]}`,
      "txt",
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!session) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Сесията не е намерена</p>
          <Button
            className="mt-4"
            onClick={() => router.push("/admin/chat-sessions")}
          >
            Обратно към сесиите
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/chat-sessions")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold">
              App Coach Разговор
            </h1>
            <p className="text-muted-foreground mt-1">
              Преглед на AI коуч сесия
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTranscript}>
              <Download className="h-4 w-4 mr-2" />
              Download Transcript
            </Button>
            <Button variant="outline" onClick={copyTranscript}>
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Копирано
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Копирай transcript
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Session Info Sidebar */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Информация за потребител
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{session.email}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Първо съобщение
                  </p>
                  <p className="text-sm">{formatDate(session.first_message_at)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Последна активност
                  </p>
                  <p className="text-sm">{formatDate(session.last_message_at)}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <MessageSquare className="h-4 w-4 inline mr-1" />
                    Брой съобщения
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {session.message_count}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-blue-600">
                      <User className="h-4 w-4" />
                      {session.user_messages} user
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <Bot className="h-4 w-4" />
                      {session.assistant_messages} AI
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Разговор</CardTitle>
                <CardDescription>
                  Пълна история на чата с App Coach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6 sm:py-8">
                      Няма съобщения в тази сесия
                    </p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                message.role === "user"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {message.role === "user"
                                ? "Потребител"
                                : "App Coach"}
                            </Badge>
                            <span className="text-xs opacity-70">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
