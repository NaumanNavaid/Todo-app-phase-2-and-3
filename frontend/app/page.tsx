'use client';

import React from 'react';
import { TabNavigation } from '@/components/layout/TabNavigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { TodoDashboard } from '@/components/todos/TodoDashboard';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { AuthPage } from '@/components/auth/AuthPage';
import { useAuth } from '@/hooks/useAuth';
import { useTabs } from '@/hooks/useTabs';

export default function Home() {
  const { activeTab, setTab } = useTabs();
  const { status } = useAuth();

  // Show auth page if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <AuthPage />;
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setTab} />

      {/* Tab Content */}
      <main className="min-h-[calc(100vh-8rem)]">
        {activeTab === 'todos' && <TodoDashboard />}
        {activeTab === 'chat' && <ChatInterface />}
      </main>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border py-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 TodoApp. Built with Next.js 16, React 19, and Tailwind CSS v4.
          </p>
        </div>
      </footer>
    </div>
  );
}
