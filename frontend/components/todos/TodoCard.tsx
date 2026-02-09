'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, Tag, MoreVertical, Pencil, Trash2, Clock } from 'lucide-react';
import { Todo } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, formatRelativeTime, getPriorityColor, getStatusColor } from '@/lib/utils';
import { triggerConfetti } from '@/lib/confetti';

interface TodoCardProps {
  todo: Todo;
  onSetStatus: (id: string, status: 'pending' | 'in_progress' | 'done' | 'cancelled') => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  index?: number;
}

export function TodoCard({ todo, onSetStatus, onEdit, onDelete, index = 0 }: TodoCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(todo.status === 'done');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle completion with confetti
  const handleToggleComplete = () => {
    if (!isCompleted) {
      // Mark as done - trigger confetti
      triggerConfetti();
      onSetStatus(todo.id, 'done');
      setIsCompleted(true);
    } else {
      // Mark as not done
      onSetStatus(todo.id, 'pending');
      setIsCompleted(false);
    }
  };

  const handleStatusChange = (status: 'pending' | 'in_progress' | 'done' | 'cancelled') => {
    onSetStatus(todo.id, status);
    if (status === 'done') {
      triggerConfetti();
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
    }
    setShowMenu(false);
  };

  const priorityColor = getPriorityColor(todo.priority);
  const statusColor = getStatusColor(todo.status);
  const overdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'done';

  // Priority glow effect
  const glowClass = todo.priority === 'urgent' ? 'glow-red' :
                   todo.priority === 'high' ? 'glow-orange' :
                   todo.priority === 'medium' ? 'glow-yellow' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className={cn(
        'glass-card group relative overflow-hidden',
        todo.status === 'done' && 'opacity-60',
        glowClass
      )}>
        {/* Priority gradient accent */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1',
          todo.priority === 'urgent' && 'bg-red-500',
          todo.priority === 'high' && 'bg-orange-500',
          todo.priority === 'medium' && 'bg-yellow-500',
          todo.priority === 'low' && 'bg-green-500',
        )} />

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Custom Checkbox with Animation */}
            <motion.button
              onClick={handleToggleComplete}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 mt-0.5',
                isCompleted
                  ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/30'
                  : 'border-muted-foreground/30 hover:border-green-500/50 bg-transparent'
              )}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isCompleted ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.div>
            </motion.button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className={cn(
                'font-semibold text-base leading-tight transition-all duration-200',
                isCompleted ? 'line-through text-muted-foreground' : 'text-foreground',
                'group-hover:text-primary transition-colors'
              )}>
                {todo.title}
              </h3>

              {/* Description */}
              {todo.description && (
                <p className={cn(
                  'text-sm mt-1 line-clamp-2 transition-all duration-200',
                  isCompleted ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground'
                )}>
                  {todo.description}
                </p>
              )}

              {/* Badges & Meta */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {/* Status Badge */}
                <Badge variant="outline" className={cn('text-xs', statusColor)}>
                  {todo.status === 'pending' && 'Pending'}
                  {todo.status === 'in_progress' && 'In Progress'}
                  {todo.status === 'done' && 'Done'}
                  {todo.status === 'cancelled' && 'Cancelled'}
                </Badge>

                {/* Priority Badge */}
                <Badge variant="outline" className={cn('text-xs uppercase font-semibold', priorityColor)}>
                  {todo.priority === 'urgent' && '🔴 Urgent'}
                  {todo.priority === 'high' && '🟠 High'}
                  {todo.priority === 'medium' && '🟡 Medium'}
                  {todo.priority === 'low' && '🟢 Low'}
                </Badge>

                {/* Tags */}
                {todo.tags && todo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {todo.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs font-medium px-2 py-0.5"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40` }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Due Date */}
                {todo.dueDate && (
                  <div className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium',
                    overdue && todo.status !== 'done'
                      ? 'text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full'
                      : 'text-muted-foreground'
                  )}>
                    {overdue && todo.status !== 'done' ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <Calendar className="w-3 h-3" />
                    )}
                    {formatRelativeTime(todo.dueDate)}
                  </div>
                )}
              </div>
            </div>

            {/* Action Menu */}
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className="flex-shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </motion.button>

              {/* Dropdown Menu */}
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-8 z-10 min-w-[160px] rounded-lg border bg-card shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() => {
                      handleStatusChange('pending');
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 transition-colors',
                      todo.status === 'pending' && 'bg-accent'
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 transition-colors',
                      todo.status === 'in_progress' && 'bg-accent'
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange('done')}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 transition-colors',
                      todo.status === 'done' && 'bg-accent'
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Done
                  </button>
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 transition-colors',
                      todo.status === 'cancelled' && 'bg-accent'
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Cancelled
                  </button>

                  <div className="border-t border-border" />

                  <button
                    onClick={() => {
                      onEdit(todo);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 transition-colors text-muted-foreground"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this todo?')) {
                        onDelete(todo.id);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 flex items-center gap-2 transition-colors text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
