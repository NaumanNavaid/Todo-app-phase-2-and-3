'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Todo, TodoFilter, Priority, TodoStatus, ApiTaskStatus } from '@/lib/types';
import { taskApi, type Task, type TaskUpdate } from '@/lib/api-client';
import { filterTodos, sortTodos, generateId } from '@/lib/utils';

// Helper to convert API Task to frontend Todo
function apiToTodo(apiTask: Task): Todo {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || undefined,
    completed: apiTask.status === 'done',
    status: apiTask.status,
    priority: (apiTask.priority as Priority) || 'medium',
    category: apiTask.tags?.[0]?.name || 'Other',  // Use first tag as category
    dueDate: apiTask.due_date ? new Date(apiTask.due_date) : undefined,
    tags: apiTask.tags || [],
    createdAt: new Date(apiTask.created_at),
    updatedAt: new Date(apiTask.updated_at),
    order: 0,
  };
}

// Helper to convert frontend Todo to API TaskCreate
function todoToApiCreate(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status' | 'category'>) {
  return {
    title: todo.title,
    description: todo.description || '',
    priority: todo.priority || 'medium',
    due_date: todo.dueDate?.toISOString(),
    tag_ids: todo.tags?.map(t => t.id) || [],
  };
}

// Helper to convert frontend Todo updates to API TaskUpdate
function todoToApiUpdate(updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'order' | 'category'>>): TaskUpdate {
  const apiUpdates: TaskUpdate = {};

  if (updates.title !== undefined) apiUpdates.title = updates.title;
  if (updates.description !== undefined) apiUpdates.description = updates.description || '';
  if (updates.completed !== undefined) apiUpdates.status = updates.completed ? 'done' : 'pending';
  if (updates.priority !== undefined) apiUpdates.priority = updates.priority;
  if (updates.dueDate !== undefined) {
    apiUpdates.due_date = updates.dueDate ? updates.dueDate.toISOString() : null;
  }
  if (updates.tags !== undefined) {
    apiUpdates.tag_ids = updates.tags.map(t => t.id);
  }

  return apiUpdates;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TodoFilter>({
    status: 'all',
    category: 'all',
    priority: 'all',
    searchQuery: '',
  });

  // Load todos from API on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setLoading(true);
        const apiTasks = await taskApi.getAll();
        setTodos(apiTasks.map(apiToTodo));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load tasks';
        setError(message);
        // If API fails, fall back to mock data for development
        console.warn('API not available, using mock data:', message);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  // Filtered and sorted todos
  const filteredTodos = useMemo(() => {
    const filtered = filterTodos(todos, filter);
    return sortTodos(filtered);
  }, [todos, filter]);

  // Statistics
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.status === 'done').length;
    const active = total - completed;
    const urgentPriority = todos.filter((t) => t.priority === 'urgent' && t.status !== 'done').length;
    const highPriority = todos.filter((t) => t.priority === 'high' && t.status !== 'done').length;
    const inProgress = todos.filter((t) => t.status === 'in_progress').length;
    const overdue = todos.filter((t) => {
      if (!t.dueDate || t.status === 'done') return false;
      return t.dueDate < new Date();
    }).length;

    return {
      total,
      completed,
      active,
      urgentPriority,
      highPriority,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [todos]);

  // CRUD Operations
  const addTodo = useCallback(async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status' | 'category'>) => {
    try {
      const apiTask = await taskApi.create(todoToApiCreate(todoData));
      const newTodo = apiToTodo(apiTask);
      setTodos((prev) => [...prev, newTodo]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      setError(message);
      throw err;
    }
  }, []);

  const updateTodo = useCallback(async (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'order' | 'category'>>) => {
    try {
      const apiUpdates = todoToApiUpdate(updates);
      const apiTask = await taskApi.update(id, apiUpdates);
      const updatedTodo = apiToTodo(apiTask);
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                ...updatedTodo,
                updatedAt: new Date(),
              }
            : todo
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await taskApi.delete(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      setError(message);
      throw err;
    }
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    try {
      // Use the toggle endpoint which cycles: pending → in_progress → done → pending
      const apiTask = await taskApi.toggle(id);
      const updatedTodo = apiToTodo(apiTask);
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? { ...todo, ...updatedTodo, updatedAt: new Date() }
            : todo
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle task';
      setError(message);
      throw err;
    }
  }, []);

  // Set specific status directly
  const setStatus = useCallback(async (id: string, status: ApiTaskStatus) => {
    try {
      const apiTask = await taskApi.update(id, { status });
      const updatedTodo = apiToTodo(apiTask);
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? { ...todo, ...updatedTodo, updatedAt: new Date() }
            : todo
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      setError(message);
      throw err;
    }
  }, []);

  // Filter operations
  const setStatusFilter = useCallback((status: TodoStatus) => {
    setFilter((prev) => ({ ...prev, status }));
  }, []);

  const setCategoryFilter = useCallback((category: string) => {
    setFilter((prev) => ({ ...prev, category }));
  }, []);

  const setPriorityFilter = useCallback((priority: Priority | 'all') => {
    setFilter((prev) => ({ ...prev, priority }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilter((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilter({
      status: 'all',
      category: 'all',
      priority: 'all',
      searchQuery: '',
    });
  }, []);

  return {
    todos,
    filteredTodos,
    filter,
    stats,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    setStatus, // New: set specific status
    setStatusFilter,
    setCategoryFilter,
    setPriorityFilter,
    setSearchQuery,
    clearFilters,
  };
}
