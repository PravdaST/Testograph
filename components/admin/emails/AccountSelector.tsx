'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Mail } from 'lucide-react';

interface AccountSelectorProps {
  selectedAccount: string;
  onAccountChange: (account: string) => void;
}

// Email accounts available in the system
const emailAccounts = [
  {
    email: 'contact@testograph.eu',
    label: 'Contact',
    color: 'bg-blue-500',
  },
  // Add more accounts here as needed
  // {
  //   email: 'support@testograph.eu',
  //   label: 'Support',
  //   color: 'bg-green-500',
  // },
];

export function AccountSelector({ selectedAccount, onAccountChange }: AccountSelectorProps) {
  const currentAccount = emailAccounts.find(acc => acc.email === selectedAccount) || emailAccounts[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentAccount.color}`} />
            <Mail className="h-4 w-4" />
            <span className="font-medium">{currentAccount.email}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        {emailAccounts.map((account) => (
          <DropdownMenuItem
            key={account.email}
            onClick={() => onAccountChange(account.email)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full">
              <div className={`w-2 h-2 rounded-full ${account.color}`} />
              <div className="flex-1">
                <p className="font-medium">{account.label}</p>
                <p className="text-xs text-muted-foreground">{account.email}</p>
              </div>
              {account.email === selectedAccount && (
                <span className="text-xs text-primary">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
