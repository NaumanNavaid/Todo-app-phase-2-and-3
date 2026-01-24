'use client';

import React from 'react';
import { Priority } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig = {
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-700',
  },
  medium: {
    label: 'Medium',
    className: 'bg-amber-100 text-amber-700',
  },
  low: {
    label: 'Low',
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
