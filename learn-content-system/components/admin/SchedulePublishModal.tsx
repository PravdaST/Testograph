'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, X } from 'lucide-react';

type ScheduleOption = 'now' | '3days' | '1week' | 'custom';

interface SchedulePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scheduledFor: string | null) => void;
  title: string;
}

export function SchedulePublishModal({
  isOpen,
  onClose,
  onConfirm,
  title
}: SchedulePublishModalProps) {
  const [selectedOption, setSelectedOption] = useState<ScheduleOption>('3days');
  const [customDate, setCustomDate] = useState('');

  if (!isOpen) return null;

  const getScheduledDate = (): string | null => {
    const now = new Date();

    switch (selectedOption) {
      case 'now':
        return null; // Publish immediately (status = 'published')
      case '3days':
        now.setDate(now.getDate() + 3);
        return now.toISOString();
      case '1week':
        now.setDate(now.getDate() + 7);
        return now.toISOString();
      case 'custom':
        return customDate ? new Date(customDate).toISOString() : null;
      default:
        return null;
    }
  };

  const handleConfirm = () => {
    const scheduledFor = getScheduledDate();
    onConfirm(scheduledFor);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPreviewDate = () => {
    const scheduled = getScheduledDate();
    if (!scheduled) return 'Веднага';
    return formatDate(new Date(scheduled));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-zinc-50">
              График за Публикуване
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title Preview */}
        <div className="p-3 rounded bg-zinc-900/50 border border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">Pillar за създаване:</div>
          <div className="text-sm text-zinc-200 font-medium">{title}</div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-400">
            Кога да се публикува?
          </label>

          <div className="space-y-2">
            {/* Immediately */}
            <label className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-zinc-900/50 transition-colors">
              <input
                type="radio"
                name="schedule"
                value="now"
                checked={selectedOption === 'now'}
                onChange={(e) => setSelectedOption(e.target.value as ScheduleOption)}
                className="w-4 h-4 text-purple-500"
              />
              <div>
                <div className="text-sm text-zinc-200 font-medium">Веднага</div>
                <div className="text-xs text-zinc-500">
                  Публикувай след създаване
                </div>
              </div>
            </label>

            {/* 3 Days */}
            <label className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-zinc-900/50 transition-colors">
              <input
                type="radio"
                name="schedule"
                value="3days"
                checked={selectedOption === '3days'}
                onChange={(e) => setSelectedOption(e.target.value as ScheduleOption)}
                className="w-4 h-4 text-purple-500"
              />
              <div>
                <div className="text-sm text-zinc-200 font-medium">След 3 дни</div>
                <div className="text-xs text-zinc-500">
                  {formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))}
                </div>
              </div>
            </label>

            {/* 1 Week */}
            <label className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-zinc-900/50 transition-colors">
              <input
                type="radio"
                name="schedule"
                value="1week"
                checked={selectedOption === '1week'}
                onChange={(e) => setSelectedOption(e.target.value as ScheduleOption)}
                className="w-4 h-4 text-purple-500"
              />
              <div>
                <div className="text-sm text-zinc-200 font-medium">След 1 седмица</div>
                <div className="text-xs text-zinc-500">
                  {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
                </div>
              </div>
            </label>

            {/* Custom Date */}
            <label className="flex flex-col gap-2 p-3 rounded cursor-pointer hover:bg-zinc-900/50 transition-colors">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="schedule"
                  value="custom"
                  checked={selectedOption === 'custom'}
                  onChange={(e) => setSelectedOption(e.target.value as ScheduleOption)}
                  className="w-4 h-4 text-purple-500"
                />
                <div className="text-sm text-zinc-200 font-medium">
                  Персонализирана дата
                </div>
              </div>
              {selectedOption === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="ml-7 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 rounded bg-purple-500/10 border border-purple-500/20">
          <div className="text-xs text-purple-400 mb-1">Ще се публикува:</div>
          <div className="text-sm text-zinc-200 font-medium">{getPreviewDate()}</div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Отказ
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={handleConfirm}
            disabled={selectedOption === 'custom' && !customDate}
          >
            Създай Pillar
          </Button>
        </div>
      </div>
    </div>
  );
}
