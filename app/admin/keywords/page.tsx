"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { KeywordsManagementTab } from "@/components/admin/KeywordsManagementTab";

export default function KeywordsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Управление на SEO ключови думи</h1>
          <p className="text-muted-foreground mt-2">
            Управление на целеви ключови думи и мониторинг на данни от Google
            Search Console.
          </p>
        </div>

        <KeywordsManagementTab />
      </div>
    </AdminLayout>
  );
}
