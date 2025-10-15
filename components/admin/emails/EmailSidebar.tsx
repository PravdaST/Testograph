'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  AlertOctagon,
  Edit,
} from 'lucide-react';
import type { EmailFolder } from '@/app/admin/emails/page';

interface EmailSidebarProps {
  currentFolder: EmailFolder;
  onFolderChange: (folder: EmailFolder) => void;
  onCompose: () => void;
}

const folders = [
  { id: 'inbox' as EmailFolder, label: 'Inbox', icon: Inbox },
  { id: 'sent' as EmailFolder, label: 'Sent', icon: Send },
  { id: 'drafts' as EmailFolder, label: 'Drafts', icon: FileText },
  { id: 'spam' as EmailFolder, label: 'Spam', icon: AlertOctagon },
  { id: 'trash' as EmailFolder, label: 'Trash', icon: Trash2 },
];

export function EmailSidebar({
  currentFolder,
  onFolderChange,
  onCompose,
}: EmailSidebarProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageTotal, setStorageTotal] = useState(15);

  useEffect(() => {
    fetchEmailStats();
  }, []);

  const fetchEmailStats = async () => {
    try {
      const response = await fetch('/api/admin/email/stats');
      const data = await response.json();

      if (response.ok) {
        setUnreadCount(data.unreadCount || 0);
        setStorageUsed(data.storageUsed || 0);
        setStorageTotal(data.storageTotal || 15);
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };
  return (
    <div className="w-64 border-r bg-muted/10 flex flex-col">
      {/* Compose Button */}
      <div className="p-4">
        <Button onClick={onCompose} className="w-full" size="lg">
          <Edit className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Folders */}
      <nav className="flex-1 px-2 space-y-1">
        {folders.map((folder) => {
          const Icon = folder.icon;
          const isActive = currentFolder === folder.id;

          return (
            <button
              key={folder.id}
              onClick={() => onFolderChange(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{folder.label}</span>
              </div>
              {folder.id === 'inbox' && unreadCount > 0 && (
                <Badge
                  variant={isActive ? 'secondary' : 'default'}
                  className="ml-auto"
                >
                  {unreadCount}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Storage Info */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Storage</p>
          <div className="flex items-center justify-between">
            <span>{storageUsed.toFixed(1)} GB of {storageTotal} GB used</span>
          </div>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min((storageUsed / storageTotal) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
