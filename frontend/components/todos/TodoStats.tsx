'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { CheckCircle2, Clock, AlertCircle, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoStatsProps {
  stats: {
    total: number;
    completed: number;
    active: number;
    urgentPriority: number;
    highPriority: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
}

export function TodoStats({ stats }: TodoStatsProps) {
  const statCards = [
    {
      label: 'Total',
      value: stats.total,
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      label: 'Urgent',
      value: stats.urgentPriority,
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      label: 'Active',
      value: stats.active,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={cn(
              'glass-card border transition-all duration-300 hover:scale-105',
              stat.borderColor
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <Icon className={cn('w-4 h-4', stat.color)} />
                </div>
              </div>
              <p className={cn('text-2xl font-bold', stat.color)}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        );
      })}

      {/* Completion Rate Card - Spans 2 columns on large screens */}
      <Card className="glass-card border border-blue-500/20 col-span-2 lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs text-muted-foreground">
              Completion Rate
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {stats.completionRate}%
          </p>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
