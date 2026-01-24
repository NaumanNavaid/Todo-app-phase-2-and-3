import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function Badge({ children, className, color }: BadgeProps) {
  const inlineStyle = color ? { backgroundColor: color } : undefined;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        !color && 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
        className
      )}
      style={inlineStyle}
    >
      {children}
    </span>
  );
}
