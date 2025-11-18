'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Calendar, Clock } from 'lucide-react';

interface PublishSchedulerProps {
  value: {
    isPublished: boolean;
    publishedAt?: string | null;
  };
  onChange: (value: { isPublished: boolean; publishedAt?: string | null }) => void;
  disabled?: boolean;
}

export function PublishScheduler({ value, onChange, disabled }: PublishSchedulerProps) {
  const [isScheduled, setIsScheduled] = useState<boolean>(!!value.publishedAt);

  const handlePublishToggle = (checked: boolean) => {
    onChange({
      isPublished: checked,
      publishedAt: checked && !value.publishedAt ? new Date().toISOString() : value.publishedAt,
    });
  };

  const handleScheduleToggle = (checked: boolean) => {
    setIsScheduled(checked);
    if (!checked) {
      // Clear scheduled date
      onChange({
        ...value,
        publishedAt: null,
      });
    }
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      // Convert local datetime-local to ISO string
      const date = new Date(dateValue);
      onChange({
        ...value,
        publishedAt: date.toISOString(),
      });
    }
  };

  // Convert ISO string to local datetime-local format
  const getLocalDateTime = () => {
    if (!value.publishedAt) return '';
    const date = new Date(value.publishedAt);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-zinc-700 bg-zinc-900/30">
      <div className="flex items-center justify-between">
        <Label htmlFor="publish-status" className="text-base font-semibold">
          Публикуване
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">
            {value.isPublished ? 'Публикуван' : 'Чернова'}
          </span>
          <Switch
            id="publish-status"
            checked={value.isPublished}
            onCheckedChange={handlePublishToggle}
            disabled={disabled}
          />
        </div>
      </div>

      {value.isPublished && (
        <>
          <div className="flex items-center justify-between">
            <Label htmlFor="schedule-toggle" className="text-sm">
              Насрочи публикуване
            </Label>
            <Switch
              id="schedule-toggle"
              checked={isScheduled}
              onCheckedChange={handleScheduleToggle}
              disabled={disabled}
            />
          </div>

          {isScheduled && (
            <div className="space-y-2">
              <Label htmlFor="publish-date" className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <Clock className="w-4 h-4" />
                Дата и час на публикуване
              </Label>
              <Input
                id="publish-date"
                type="datetime-local"
                value={getLocalDateTime()}
                onChange={handleDateTimeChange}
                disabled={disabled}
                className="bg-zinc-900/50 border-zinc-700"
              />
              <p className="text-xs text-zinc-500">
                {value.publishedAt && new Date(value.publishedAt) > new Date()
                  ? '🕐 Насрочено за бъдещо публикуване'
                  : value.publishedAt
                  ? '✅ Публикувано на ' +
                    new Date(value.publishedAt).toLocaleString('bg-BG')
                  : 'Избери дата и час'}
              </p>
            </div>
          )}
        </>
      )}

      {!value.isPublished && (
        <p className="text-xs text-zinc-500">
          Статията е в режим "чернова" и не е видима за потребителите
        </p>
      )}
    </div>
  );
}
