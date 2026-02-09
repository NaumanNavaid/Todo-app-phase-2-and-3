'use client';

import React from 'react';
import { Todo } from '@/lib/types';
import { TodoCard } from './TodoCard';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onSetStatus: (id: string, status: 'pending' | 'in_progress' | 'done' | 'cancelled') => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggleComplete, onSetStatus, onEdit, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-xl">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No tasks found
        </h3>
        <p className="text-sm text-muted-foreground">
          Create your first task to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {todos.map((todo, index) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onSetStatus={onSetStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          index={index}
        />
      ))}
    </div>
  );
}
