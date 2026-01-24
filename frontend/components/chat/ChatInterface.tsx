'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';

export function ChatInterface() {
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)] flex flex-col">
      <Header
        title="AI Assistant"
        description="Manage your tasks using natural language"
      />

      <Card className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader onClear={clearChat} />
        <ChatMessageList messages={messages} isLoading={isLoading} />
        {error && (
          <div className="px-4 py-2 text-sm text-red-600 border-t" style={{ borderColor: 'var(--error-bg)' }}>
            {error}
          </div>
        )}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </Card>
    </div>
  );
}
