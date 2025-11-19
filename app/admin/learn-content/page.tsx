"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { LearnContentTab } from "@/components/admin/LearnContentTab";

export default function LearnContentPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Управление на учебно съдържание
          </h1>
          <p className="text-muted-foreground mt-2">
            Създаване на образователни статии и ръководства с помощта на AI.
          </p>
        </div>

        <LearnContentTab />
      </div>
    </AdminLayout>
  );
}
