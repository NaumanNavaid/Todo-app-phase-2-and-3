'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { TodoStats } from './TodoStats';
import { TodoFilters } from './TodoFilters';
import { TodoList } from './TodoList';
import { TodoForm } from './TodoForm';
import { useTodos } from '@/hooks/useTodos';
import { Todo } from '@/lib/types';

export function TodoDashboard() {
  const {
    filteredTodos,
    filter,
    stats,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    setStatus,
    setStatusFilter,
    setCategoryFilter,
    setPriorityFilter,
    setSearchQuery,
    clearFilters,
  } = useTodos();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);

  const handleEdit = (todo: Todo) => {
    setEditTodo(todo);
    setIsFormOpen(true);
  };

  const handleSubmit = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status'>) => {
    if (editTodo) {
      updateTodo(editTodo.id, todoData);
      setEditTodo(null);
    } else {
      addTodo(todoData);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditTodo(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Header
        title="My Todos"
        description={`You have ${stats.active} active tasks`}
      />

      <div className="flex justify-end mb-4">
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Todo
        </Button>
      </div>

      <TodoStats stats={stats} />

      <TodoFilters
        filter={filter}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
        onPriorityChange={setPriorityFilter}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
      />

      <TodoList
        todos={filteredTodos}
        onToggleComplete={toggleComplete}
        onSetStatus={setStatus}
        onEdit={handleEdit}
        onDelete={deleteTodo}
      />

      <TodoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        editTodo={editTodo}
      />
    </div>
  );
}
