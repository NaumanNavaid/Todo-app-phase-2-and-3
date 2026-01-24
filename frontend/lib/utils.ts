import { type ClassValue, clsx } from 'clsx';

// Conditional class name utility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format date for display
export function formatDate(date: Date | undefined): string {
  if (!date) return '';

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays <= 7) return `In ${diffDays} days`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Check if todo is overdue
export function isOverdue(dueDate: Date | undefined, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  return dueDate < new Date();
}

// Get priority color class
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'low':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

// Get status color class
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'done':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

// Get status display label
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in_progress':
      return 'In Progress';
    case 'done':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Sort todos by priority and order
export function sortTodos<T extends { priority: string; order: number }>(todos: T[]): T[] {
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  return [...todos].sort((a, b) => {
    if (priorityWeight[b.priority as keyof typeof priorityWeight] !==
        priorityWeight[a.priority as keyof typeof priorityWeight]) {
      return priorityWeight[b.priority as keyof typeof priorityWeight] -
             priorityWeight[a.priority as keyof typeof priorityWeight];
    }
    return a.order - b.order;
  });
}

// Filter todos based on filter criteria
export function filterTodos(todos: any[], filter: any): any[] {
  return todos.filter((todo) => {
    // Status filter - handle new 4-status system
    if (filter.status === 'pending' && todo.status !== 'pending') return false;
    if (filter.status === 'in_progress' && todo.status !== 'in_progress') return false;
    if (filter.status === 'done' && todo.status !== 'done') return false;
    if (filter.status === 'cancelled' && todo.status !== 'cancelled') return false;

    // Category filter
    if (filter.category && filter.category !== 'all' && todo.category !== filter.category) {
      return false;
    }

    // Priority filter
    if (filter.priority !== 'all' && todo.priority !== filter.priority) {
      return false;
    }

    // Search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      const matchesTitle = todo.title.toLowerCase().includes(query);
      const matchesDescription = todo.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription) return false;
    }

    return true;
  });
}
