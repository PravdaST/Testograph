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
      console.log('[DEBUG] checkAuth started');
      try {
        // Use getSession() which doesn't throw errors
        console.log('[DEBUG] Calling getSession()...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[DEBUG] getSession() returned, session:', session ? 'exists' : 'null');

        if (session?.user) {
          console.log('[DEBUG] User session found, checking admin table for ID:', session.user.id);
          // Check if user is admin
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('[DEBUG] Admin check result:', { hasAdminData: !!adminData, hasError: !!adminError });

          if (adminData && !adminError) {
            console.log('[DEBUG] User is admin, redirecting to dashboard');
            // User is admin, redirect to dashboard
            // Longer delay to ensure session is fully synced in Next.js 16 (cookies + localStorage)
            await new Promise(resolve => setTimeout(resolve, 500));
            router.push('/admin/dashboard');
          } else {
            console.log('[DEBUG] User is not admin, showing login form');
            // User is logged in but not admin, show login form
            setCheckingAuth(false);
          }
        } else {
          console.log('[DEBUG] No session, showing login form');
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error('[DEBUG] Auth check error:', error);
        // On error, show login form
        setCheckingAuth(false);
      }
      console.log('[DEBUG] checkAuth completed');
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[DEBUG handleLogin] Started');
    setIsLoading(true);
    setError(null);

    try {
      console.log('[DEBUG handleLogin] Calling signInWithPassword...');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('[DEBUG handleLogin] signInWithPassword returned:', { hasData: !!data, hasError: !!signInError });

      if (signInError) {
        console.log('[DEBUG handleLogin] Sign in error:', signInError.message);
        setError('Невалиден имейл или парола');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('[DEBUG handleLogin] User logged in, checking admin table for ID:', data.user.id);
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log('[DEBUG handleLogin] Admin check result:', { hasAdminData: !!adminData, hasError: !!adminError });

        if (adminData && !adminError) {
          console.log('[DEBUG handleLogin] User is admin, redirecting to dashboard');
          // User is admin, redirect to dashboard
          // Longer delay to ensure session is fully synced in Next.js 16 (cookies + localStorage)
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push('/admin/dashboard');
        } else {
          console.log('[DEBUG handleLogin] User is not admin');
          // User is not admin
          setError('Нямате администраторски права');
          setIsLoading(false);
          // Sign out the user
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.error('[DEBUG handleLogin] Error:', err);
      setError('Възникна грешка при влизане');
      setIsLoading(false);
    }
    console.log('[DEBUG handleLogin] Completed');
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
