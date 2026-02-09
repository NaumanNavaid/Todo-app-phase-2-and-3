'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TodoFilter, Priority, TodoStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TodoFiltersProps {
  filter: TodoFilter;
  onStatusChange: (status: TodoStatus) => void;
  onPriorityChange: (priority: Priority | 'all') => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export function TodoFilters({
  filter,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onClearFilters,
}: TodoFiltersProps) {
  const hasActiveFilters =
    filter.status !== 'all' ||
    filter.priority !== 'all' ||
    filter.searchQuery !== '';

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: '🔴 Urgent' },
    { value: 'high', label: '🟠 High' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'low', label: '🟢 Low' },
  ];

  return (
    <Card className="glass-card mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filter.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg border',
                'bg-background/50 border-border',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'placeholder:text-muted-foreground',
                'transition-all duration-200'
              )}
            />
            {filter.searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <select
              value={filter.status}
              onChange={(e) => onStatusChange(e.target.value as TodoStatus)}
              className={cn(
                'px-3 py-2 rounded-lg border',
                'bg-background/50 border-border',
                'text-foreground text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'transition-all duration-200'
              )}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filter.priority}
              onChange={(e) => onPriorityChange(e.target.value as Priority | 'all')}
              className={cn(
                'px-3 py-2 rounded-lg border',
                'bg-background/50 border-border',
                'text-foreground text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'transition-all duration-200'
              )}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
