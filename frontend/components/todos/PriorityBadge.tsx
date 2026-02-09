'use client';

import React from 'react';
import { Priority } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig = {
  urgent: {
    label: '🔴 Urgent',
    className: 'bg-red-500 text-white',
  },
  high: {
    label: '🟠 High',
    className: 'bg-orange-100 text-orange-700',
  },
  medium: {
    label: '🟡 Medium',
    className: 'bg-yellow-100 text-yellow-700',
  },
  low: {
    label: '🟢 Low',
    className: 'bg-green-100 text-green-700',
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
