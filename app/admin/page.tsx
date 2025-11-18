'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated as admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 5000)
        );

        const authPromise = supabase.auth.getUser();

        const { data: { user } } = await Promise.race([
          authPromise,
          timeoutPromise
        ]) as any;

        if (user) {
          // Check if user is admin
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (adminData && !adminError) {
            // User is admin, redirect to dashboard
            // Small delay to ensure session is fully synced in Next.js 16
            await new Promise(resolve => setTimeout(resolve, 100));
            router.push('/admin/dashboard');
          } else {
            // User is logged in but not admin, show login form
            setCheckingAuth(false);
          }
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, show login form
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Невалиден имейл или парола');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (adminData && !adminError) {
          // User is admin, redirect to dashboard
          // Small delay to ensure session is fully synced in Next.js 16
          await new Promise(resolve => setTimeout(resolve, 100));
          router.push('/admin/dashboard');
        } else {
          // User is not admin
          setError('Нямате администраторски права');
          setIsLoading(false);
          // Sign out the user
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      setError('Възникна грешка при влизане');
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Администраторски вход</CardTitle>
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Влизане...
                </>
              ) : (
                'Вход'
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
