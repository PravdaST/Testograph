import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BookOpen, Sparkles, List, LayoutGrid, Info, Lightbulb } from 'lucide-react';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { LearnContentCreatorTab } from '@/components/admin/LearnContentCreatorTab';
import { LearnContentManagementTab } from '@/components/admin/LearnContentManagementTab';
import { LearnContentDashboard } from '@/components/admin/LearnContentDashboard';
import { LearnContentInstructions } from '@/components/admin/LearnContentInstructions';
import { ClusterSuggestionsPanel } from '@/components/admin/ClusterSuggestionsPanel';

export default async function AdminLearnContentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  // Get all learn-guide posts
  const { data: guides } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('category', 'learn-guide')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-50">Learn Content Management</h1>
        <p className="text-zinc-400">Създавай и управлявай образователни guides с AI</p>
      </div>

      {/* Instructions */}
      <LearnContentInstructions />

      {/* Tabs */}
      <AdminTabs
        defaultTab="suggestions"
        tabs={[
          {
            id: 'suggestions',
            label: 'AI Cluster Ideas',
            icon: <Lightbulb className="w-4 h-4" />,
            content: <ClusterSuggestionsPanel />,
          },
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <LayoutGrid className="w-4 h-4" />,
            content: <LearnContentDashboard guides={guides || []} />,
          },
          {
            id: 'creator',
            label: 'AI Guide Creator',
            icon: <Sparkles className="w-4 h-4" />,
            content: <LearnContentCreatorTab />,
          },
          {
            id: 'guides',
            label: 'Guides',
            icon: <List className="w-4 h-4" />,
            content: <LearnContentManagementTab guides={guides || []} />,
          },
        ]}
      />
    </div>
  );
}
