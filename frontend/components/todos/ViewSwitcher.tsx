'use client';

import React from 'react';
import { LayoutGrid, Kanban, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'list' | 'kanban' | 'calendar';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views = [
    { id: 'list' as ViewMode, label: 'List', icon: LayoutGrid },
    { id: 'kanban' as ViewMode, label: 'Kanban', icon: Kanban },
    { id: 'calendar' as ViewMode, label: 'Calendar', icon: CalendarIcon },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;

        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}
