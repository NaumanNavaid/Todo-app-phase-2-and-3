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
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No todos found
        </h3>
        <p className="text-sm text-slate-500">
          {todos.length === 0
            ? 'Create your first todo to get started!'
            : 'Try adjusting your filters to find what you\'re looking for.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onSetStatus={onSetStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
