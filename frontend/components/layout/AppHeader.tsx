'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';

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
    <header className="bg-card/50 border-b border-border backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo with gradient */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-xl text-white">✓</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TodoApp</h1>
              <p className="text-xs text-muted-foreground">Professional Task Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Avatar with gradient */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                <span className="text-sm font-semibold text-white">
                  {initials}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
