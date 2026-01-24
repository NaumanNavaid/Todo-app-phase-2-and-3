'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { TodoFilter, Priority, TodoStatus } from '@/lib/types';
import { mockCategories } from '@/lib/mock-data';

interface TodoFiltersProps {
  filter: TodoFilter;
  onStatusChange: (status: TodoStatus) => void;
  onCategoryChange: (category: string) => void;
  onPriorityChange: (priority: Priority | 'all') => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export function TodoFilters({
  filter,
  onStatusChange,
  onCategoryChange,
  onPriorityChange,
  onSearchChange,
  onClearFilters,
}: TodoFiltersProps) {
  const hasActiveFilters =
    filter.status !== 'all' ||
    filter.category !== 'all' ||
    filter.priority !== 'all' ||
    filter.searchQuery !== '';

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...mockCategories.map((cat) => ({ value: cat.name, label: cat.name })),
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search todos..."
              value={filter.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={filter.status}
              onChange={(e) => onStatusChange(e.target.value as TodoStatus)}
              options={statusOptions}
              className="min-w-[140px]"
            />

            <Select
              value={filter.category}
              onChange={(e) => onCategoryChange(e.target.value)}
              options={categoryOptions}
              className="min-w-[140px]"
            />

            <Select
              value={filter.priority}
              onChange={(e) => onPriorityChange(e.target.value as Priority | 'all')}
              options={priorityOptions}
              className="min-w-[140px]"
            />

            {hasActiveFilters && (
              <Button variant="ghost" size="md" onClick={onClearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
