'use client';

import React from 'react';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: Category | string;
  className?: string;
}

const defaultCategories: Record<string, string> = {
  Work: 'var(--category-work)',
  Personal: 'var(--category-personal)',
  Shopping: 'var(--category-shopping)',
  Health: 'var(--category-health)',
  Finance: 'var(--category-finance)',
  Other: 'var(--category-other)',
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const name = typeof category === 'string' ? category : category.name;
  const color = typeof category === 'string' ? defaultCategories[category] : category.color;

  const textColorClass = color ? '' : 'bg-slate-100 text-slate-700';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        !color && textColorClass,
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      <span
        className="w-2 h-2 rounded-full mr-2"
        style={color ? { backgroundColor: color } : undefined}
      />
      {name}
    </span>
  );
}
