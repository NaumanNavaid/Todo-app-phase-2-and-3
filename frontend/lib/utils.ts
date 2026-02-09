import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Conditional class name utility with tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

// Format date to relative time (e.g., "2 days ago", "in 3 hours")
export function formatRelativeTime(date: Date | string | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays === 0 && diffHours === 0 && diffMinutes === 0) {
    return 'Due now';
  } else if (diffDays === 0 && diffHours === 0) {
    return diffMinutes > 0 ? `Due in ${diffMinutes} min` : `${Math.abs(diffMinutes)} min ago`;
  } else if (diffDays === 0) {
    return diffHours > 0 ? `Due in ${diffHours}h` : `${Math.abs(diffHours)}h ago`;
  } else if (diffDays > 0) {
    return `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffDays === -1) {
    return 'Due yesterday';
  } else {
    return `Overdue by ${Math.abs(diffDays)} days`;
  }
}

// Check if todo is overdue
export function isOverdue(dueDate: Date | undefined, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  return dueDate < new Date();
}

// Get priority color class (dark mode optimized)
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20';
    case 'high':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20';
    case 'medium':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20';
    case 'low':
      return 'text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-500/20';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/20';
  }
}

// Get status color class (dark mode optimized)
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    case 'in_progress':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'done':
      return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'cancelled':
      return 'text-red-500 bg-red-500/10 border-red-500/20';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
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
