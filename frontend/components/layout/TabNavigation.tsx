'use client';

import React from 'react';
import { TabId } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'todos' as TabId, label: 'Todos', icon: '📋' },
  { id: 'chat' as TabId, label: 'AI Assistant', icon: '🤖' },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
