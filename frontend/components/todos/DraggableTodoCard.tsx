'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { Todo } from '@/lib/types';
import { cn, getPriorityColor } from '@/lib/utils';

interface DraggableTodoCardProps {
  todo: Todo;
  onSetStatus: (id: string, status: 'pending' | 'in_progress' | 'done' | 'cancelled') => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function DraggableTodoCard({ todo, onSetStatus, onEdit, onDelete }: DraggableTodoCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: todo.id,
    data: todo,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const priorityColor = getPriorityColor(todo.priority);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          'glass-card p-3 rounded-lg cursor-grab active:cursor-grabbing',
          isDragging && 'opacity-50'
        )}
      >
        {/* Drag Handle */}
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className={cn(
              'font-medium text-sm leading-tight',
              todo.status === 'done' && 'line-through text-muted-foreground'
            )}>
              {todo.title}
            </h4>

            {/* Description */}
            {todo.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Priority Badge */}
              <span className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                priorityColor
              )}>
                {todo.priority === 'urgent' && '🔴'}
                {todo.priority === 'high' && '🟠'}
                {todo.priority === 'medium' && '🟡'}
                {todo.priority === 'low' && '🟢'}
              </span>

              {/* Tags */}
              {todo.tags && todo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {todo.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        border: `1px solid ${tag.color}40`
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {todo.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{todo.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Due Date */}
              {todo.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(todo.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
