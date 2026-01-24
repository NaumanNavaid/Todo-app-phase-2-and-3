'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, MessageRole } from '@/lib/types';
import { chatApi } from '@/lib/api-client';
import { generateId } from '@/lib/utils';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const data = await chatApi.getHistory();
      setMessages(data.messages.map((msg) => ({
        ...msg,
        role: msg.role as MessageRole,
        timestamp: new Date(msg.timestamp),
      })));
      setConversationId(data.session_id);
    } catch (err) {
      console.error('Failed to load chat history:', err);
      // Set welcome message if no history
      setMessages([
        {
          id: generateId(),
          role: 'assistant' as MessageRole,
          content: 'Hello! I\'m your AI assistant. I can help you manage your tasks. Try saying "Add a task: Buy groceries" or "Show my tasks".',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message optimistically
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user' as MessageRole,
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Send to your FastAPI backend with OpenAI Agents
      const response = await chatApi.sendMessage({
        message: content,
        conversation_id: conversationId,
      });

      // Update conversation ID for next message
      setConversationId(response.conversation_id);

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: response.message_id,
        role: 'assistant' as MessageRole,
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);

      // Add error message
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant' as MessageRole,
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading]);

  const clearChat = useCallback(async () => {
    try {
      await chatApi.clearHistory();
      setMessages([]);
      setConversationId(undefined);
      setError(null);
    } catch (err) {
      console.error('Failed to clear chat:', err);
      setError('Failed to clear chat history');
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}
