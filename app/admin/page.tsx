"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError("Невалиден имейл или парола.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (adminData && !adminError) {
          // Small delay to ensure session cookies are fully synced
          // before proxy.ts checks them on the server
          setTimeout(() => {
            window.location.href = "/admin/dashboard";
          }, 150);
        } else {
          setError("Нямате администраторски права.");
          await supabase.auth.signOut();
          setIsLoading(false);
        }
      } else {
        // This case should ideally not be reached if signInError is handled
        setError("Възникна неочаквана грешка.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Възникна грешка при влизане.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-xl sm:text-2xl font-bold">
            Администраторски вход
          </CardTitle>
          <CardDescription>
            Въведете вашите данни за достъп до analytics dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Имейл адрес</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@testograph.eu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Парола</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Влизане...
                </>
              ) : (
                "Вход"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Само оторизирани администратори имат достъп</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
