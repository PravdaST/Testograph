'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BarChart3,
  Target,
  FileText,
  LogOut,
  Menu,
  X,
  Shield,
  ClipboardList,
  Mail,
  Database,
  Settings as SettingsIcon,
  TrendingUp,
  ClipboardCheck,
  Handshake,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  {
    title: 'Табло',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Потребители',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Testograph PRO',
    href: '/admin/pro-users',
    icon: Target,
  },
  {
    title: 'Business Analytics',
    href: '/admin/business-analytics',
    icon: TrendingUp,
  },
  {
    title: 'Access Control',
    href: '/admin/access',
    icon: Shield,
  },
  {
    title: 'App Data',
    href: '/admin/app-data',
    icon: Database,
  },
  {
    title: 'Quiz Резултати',
    href: '/admin/quiz-results',
    icon: ClipboardCheck,
  },
  {
    title: 'Афилиейти',
    href: '/admin/affiliates',
    icon: Handshake,
  },
  {
    title: 'Learn Content',
    href: '/admin/learn-content',
    icon: BookOpen,
  },
  {
    title: 'Комуникация',
    href: '/admin/communication',
    icon: MessageSquare,
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: ClipboardList,
  },
  {
    title: 'Настройки',
    href: '/admin/settings',
    icon: SettingsIcon,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Skip auth check for the login page itself to prevent redirect loops
    if (pathname === '/admin') {
      setAuthStatus('unauthorized'); // Or a new status like 'login-page'
      return;
    }

    const checkAuth = async () => {
      console.log('[DEBUG AdminLayout] checkAuth started');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('[DEBUG AdminLayout] getSession() returned, session:', session ? 'exists' : 'null', 'error:', sessionError);

      if (sessionError || !session?.user) {
        console.log('[DEBUG AdminLayout] No session or error, redirecting to /admin');
        window.location.href = '/admin';
        return;
      }

      console.log('[DEBUG AdminLayout] Session found, checking admin table for ID:', session.user.id);
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      console.log('[DEBUG AdminLayout] Admin check result:', { hasAdminData: !!adminData, hasError: !!adminError });

      if (adminError || !adminData) {
        console.log('[DEBUG AdminLayout] Not an admin or error fetching admin data, redirecting to /admin');
        // Signing out is important to clear a potentially invalid session
        await supabase.auth.signOut();
        window.location.href = '/admin';
        return;
      }

      console.log('[DEBUG AdminLayout] User is authorized admin');
      setUserEmail(session.user.email || '');
      setAuthStatus('authorized');
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin';
  };

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If on a page that uses AdminLayout, but user is not authorized,
  // this will effectively render nothing while the redirect initiated in useEffect happens.
  if (authStatus !== 'authorized') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-primary">Testograph</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="mb-3 px-2">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium truncate">{userEmail}</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
