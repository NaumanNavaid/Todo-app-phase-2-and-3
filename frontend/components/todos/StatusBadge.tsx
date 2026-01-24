'use client';

import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}
