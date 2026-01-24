'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { StatusBadge } from './StatusBadge';
import { formatDate, isOverdue, cn } from '@/lib/utils';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onSetStatus: (id: string, status: 'pending' | 'in_progress' | 'done' | 'cancelled') => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoCard({ todo, onToggleComplete, onSetStatus, onEdit, onDelete }: TodoCardProps) {
  const overdue = isOverdue(todo.dueDate, todo.status === 'done');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusChange = (status: 'pending' | 'in_progress' | 'done' | 'cancelled') => {
    onSetStatus(todo.id, status);
    setShowStatusMenu(false);
  };

  return (
    <Card className={todo.status === 'done' ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={cn(
                'flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center transition-colors',
                todo.status === 'done'
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'border-slate-300 hover:border-indigo-500'
              )}
              aria-label="Change status"
            >
              {todo.status === 'done' && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Status Dropdown Menu */}
            {showStatusMenu && (
              <div className="absolute top-8 left-0 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                <button
                  onClick={() => handleStatusChange('pending')}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2',
                    todo.status === 'pending' && 'bg-slate-50'
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--status-pending-text)' }}></span>
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2',
                    todo.status === 'in_progress' && 'bg-slate-50'
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--status-in-progress-text)' }}></span>
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange('done')}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2',
                    todo.status === 'done' && 'bg-slate-50'
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--status-done-text)' }}></span>
                  Completed
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2',
                    todo.status === 'cancelled' && 'bg-slate-50'
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--status-cancelled-text)' }}></span>
                  Cancelled
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'font-medium text-slate-900',
                todo.status === 'done' && 'line-through text-slate-500'
              )}
            >
              {todo.title}
            </h3>

            {todo.description && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}

            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <StatusBadge status={todo.status} />
              <PriorityBadge priority={todo.priority} />
              <CategoryBadge category={todo.category} />

              {todo.dueDate && (
                <span
                  className={cn(
                    'inline-flex items-center text-xs',
                    overdue && todo.status !== 'done'
                      ? 'text-red-600'
                      : 'text-slate-500'
                  )}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formatDate(todo.dueDate)}
                  {overdue && todo.status !== 'done' && ' (Overdue)'}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="px-4 pb-4 pt-0 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(todo)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this todo?')) {
              onDelete(todo.id);
            }
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
}
