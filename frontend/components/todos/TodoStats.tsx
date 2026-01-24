'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface TodoStatsProps {
  stats: {
    total: number;
    completed: number;
    active: number;
    highPriority: number;
    overdue: number;
    completionRate: number;
  };
}

export function TodoStats({ stats }: TodoStatsProps) {
  const statItems = [
    { label: 'Total', value: stats.total, color: 'text-slate-900' },
    { label: 'Completed', value: stats.completed, color: 'text-green-600' },
    { label: 'Active', value: stats.active, color: 'text-blue-600' },
    { label: 'High Priority', value: stats.highPriority, color: 'text-red-600' },
    { label: 'Overdue', value: stats.overdue, color: 'text-orange-600' },
    {
      label: 'Completion',
      value: `${stats.completionRate}%`,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statItems.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
