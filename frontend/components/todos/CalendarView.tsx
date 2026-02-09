'use client';

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Todo } from '@/lib/types';
import { cn, getPriorityColor } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface CalendarViewProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
}

export function CalendarView({ todos, onEdit }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Get todos for a specific date
  const getTodosForDate = (date: Date) => {
    return todos.filter((todo) => {
      if (!todo.dueDate) return false;
      const dueDate = typeof todo.dueDate === 'string' ? parseISO(todo.dueDate) : todo.dueDate;
      return isSameDay(dueDate, date);
    });
  };

  // Check if a date has tasks
  const hasTasks = (date: Date) => {
    return getTodosForDate(date).length > 0;
  };

  // Get priority color for date indicator
  const getDatePriorityColor = (date: Date) => {
    const dayTodos = getTodosForDate(date);
    const hasUrgent = dayTodos.some((t) => t.priority === 'urgent');
    const hasHigh = dayTodos.some((t) => t.priority === 'high');
    const hasOverdue = dayTodos.some((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');

    if (hasOverdue) return 'bg-red-500';
    if (hasUrgent) return 'bg-red-400';
    if (hasHigh) return 'bg-orange-400';
    return 'bg-blue-400';
  };

  const selectedTodos = selectedDate ? getTodosForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DayPicker
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            selected={selectedDate}
            onSelect={setSelectedDate}
            mode="single"
            className="rounded-md border-border"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 p-0",
                "hidden"
              ),
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-foreground rounded-md transition-colors"
              ),
              day_today: "bg-primary/10 text-primary font-semibold",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            }}
          />
        </div>
      </div>

      {/* Tasks for Selected Date */}
      <div className="lg:col-span-1">
        <div className="glass-card p-6 sticky top-4">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDate ? (
              <>
                {isToday(selectedDate) && 'Today'}
                {!isToday(selectedDate) && format(selectedDate, 'MMMM d, yyyy')}
                <span className="text-muted-foreground text-sm ml-2">
                  ({selectedTodos.length} task{selectedTodos.length !== 1 ? 's' : ''})
                </span>
              </>
            ) : (
              'Select a date to see tasks'
            )}
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {selectedTodos.length > 0 ? (
              selectedTodos.map((todo, index) => {
                const priorityColor = getPriorityColor(todo.priority);
                const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'done';

                return (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onEdit(todo)}
                    className={cn(
                      'glass-card p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors',
                      isOverdue && 'border-red-500/50'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {/* Priority indicator */}
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                        todo.priority === 'urgent' && 'bg-red-500',
                        todo.priority === 'high' && 'bg-orange-500',
                        todo.priority === 'medium' && 'bg-yellow-500',
                        todo.priority === 'low' && 'bg-green-500'
                      )} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          'font-medium text-sm',
                          todo.status === 'done' && 'line-through text-muted-foreground'
                        )}>
                          {todo.title}
                        </h4>

                        {todo.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {todo.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* Priority Badge */}
                          <span className={cn('text-xs px-2 py-0.5 rounded', priorityColor)}>
                            {todo.priority}
                          </span>

                          {/* Status Badge */}
                          <span className="text-xs text-muted-foreground">
                            {todo.status === 'pending' && 'Pending'}
                            {todo.status === 'in_progress' && 'In Progress'}
                            {todo.status === 'done' && 'Done'}
                            {todo.status === 'cancelled' && 'Cancelled'}
                          </span>

                          {/* Overdue indicator */}
                          {isOverdue && (
                            <span className="text-xs text-red-400 font-medium">
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {selectedDate ? (
                  <>
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No tasks due on this day</p>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a date to view tasks</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
