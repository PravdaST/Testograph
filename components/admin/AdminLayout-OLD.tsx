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
  Handshake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ADMIN_USER_ID = 'e4ea078b-30b2-4347-801f-6d26a87318b6';

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
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin');
        return;
      }

      if (user.id !== ADMIN_USER_ID) {
        router.push('/admin');
        return;
      }

      setIsAuthorized(true);
      setUserEmail(user.email || '');
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
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
          <nav className="flex-1 p-4 space-y-2">
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
