'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TodoStats } from './TodoStats';
import { TodoFilters } from './TodoFilters';
import { TodoList } from './TodoList';
import { TodoForm } from './TodoForm';
import { ViewSwitcher, ViewMode } from './ViewSwitcher';
import { KanbanBoard } from './KanbanBoard';
import { CalendarView } from './CalendarView';
import { useTodos } from '@/hooks/useTodos';
import { useTags } from '@/hooks/useTags';
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
    setPriorityFilter,
    setSearchQuery,
    clearFilters,
  } = useTodos();

  const { tags } = useTags();

  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);

  const handleEdit = (todo: Todo) => {
    setEditTodo(todo);
    setIsFormOpen(true);
  };

  const handleSubmit = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status' | 'category' | 'completed'>) => {
    if (editTodo) {
      updateTodo(editTodo.id, { ...todoData, completed: editTodo.completed });
      setEditTodo(null);
    } else {
      addTodo({ ...todoData, completed: false });
    }
    setIsFormOpen(false);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditTodo(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <LayoutDashboard className="w-8 h-8" />
                My Tasks
              </h1>
              <p className="text-muted-foreground mt-1">
                {stats.active === 0
                  ? 'No active tasks'
                  : stats.active === 1
                  ? 'You have 1 active task'
                  : `You have ${stats.active} active tasks`
                }
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Switcher */}
              <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />

              {/* New Task Button */}
              <Button
                size="lg"
                onClick={() => setIsFormOpen(true)}
                className="shadow-lg shadow-primary/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <TodoStats stats={stats} />
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TodoFilters
              filter={filter}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onSearchChange={setSearchQuery}
              onClearFilters={clearFilters}
            />
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {currentView === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TodoList
                  todos={filteredTodos}
                  onToggleComplete={toggleComplete}
                  onSetStatus={setStatus}
                  onEdit={handleEdit}
                  onDelete={deleteTodo}
                />
              </motion.div>
            )}

            {currentView === 'kanban' && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <KanbanBoard
                  todos={filteredTodos}
                  onSetStatus={setStatus}
                  onEdit={handleEdit}
                  onDelete={deleteTodo}
                />
              </motion.div>
            )}

            {currentView === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CalendarView
                  todos={filteredTodos}
                  onEdit={handleEdit}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Todo Form Modal */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        editTodo={editTodo}
        availableTags={tags}
      />

      {/* Floating Action Button (Mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsFormOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/40 flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
