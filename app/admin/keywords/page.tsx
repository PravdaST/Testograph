'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { KeywordsManagementTab } from '@/components/admin/KeywordsManagementTab';

export default function KeywordsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SEO Keyword Management</h1>
          <p className="text-muted-foreground mt-2">
            Управление на target keywords и мониторинг на Google Search Console данни.
          </p>
        </div>

        <KeywordsManagementTab />
      </div>
    </AdminLayout>
  );
}
