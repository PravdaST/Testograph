'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { EmailSidebar } from '@/components/admin/emails/EmailSidebar';
import { EmailList } from '@/components/admin/emails/EmailList';
import { EmailDetail } from '@/components/admin/emails/EmailDetail';
import { AccountSelector } from '@/components/admin/emails/AccountSelector';

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';

export default function EmailsPage() {
  const [selectedAccount, setSelectedAccount] = useState('contact@testograph.eu');
  const [currentFolder, setCurrentFolder] = useState<EmailFolder>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header with Account Selector */}
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Emails</h1>
            <AccountSelector
              selectedAccount={selectedAccount}
              onAccountChange={setSelectedAccount}
            />
          </div>
        </div>

        {/* Main Email Interface */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Folders */}
          <EmailSidebar
            currentFolder={currentFolder}
            onFolderChange={setCurrentFolder}
            onCompose={() => setShowCompose(true)}
          />

          {/* Email List */}
          <EmailList
            folder={currentFolder}
            account={selectedAccount}
            selectedEmailId={selectedEmailId}
            onEmailSelect={setSelectedEmailId}
          />

          {/* Email Detail */}
          <EmailDetail
            emailId={selectedEmailId}
            onClose={() => setSelectedEmailId(null)}
            showCompose={showCompose}
            onCloseCompose={() => setShowCompose(false)}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
