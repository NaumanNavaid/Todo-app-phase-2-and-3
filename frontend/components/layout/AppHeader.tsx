'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

// Helper to get initials from name
function getInitials(name: string): string {
  if (!name) return 'U';

  const parts = name.trim().split(' ');

  if (parts.length === 1) {
    // Single name - take first 2 characters
    return parts[0].slice(0, 2).toUpperCase();
  }

  // Multiple names - take first letter of first two names
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AppHeader() {
  const { user, logout, status } = useAuth();

  if (status !== 'authenticated') {
    return null;
  }

  const initials = getInitials(user?.name || '');

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo - Solid neutral color instead of gradient */}
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
              <span className="text-xl text-white">✓</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">TodoApp</h1>
              <p className="text-xs text-slate-500">Professional Task Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Avatar - Solid neutral color instead of gradient, no shadow */}
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {initials}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email}
                </p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={logout}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
