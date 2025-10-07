'use client';

import { Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function FilterDropdown({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'All',
}: FilterDropdownProps) {
  const hasValue = value && value !== 'all';

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasValue && (
        <Badge variant="secondary" className="gap-1">
          {label}: {options.find((o) => o.value === value)?.label}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => onValueChange('all')}
          />
        </Badge>
      )}
    </div>
  );
}
