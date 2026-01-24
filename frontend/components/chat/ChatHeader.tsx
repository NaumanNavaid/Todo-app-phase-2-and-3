'use client';

import { Button } from '@/components/ui/Button';

interface ChatHeaderProps {
  onClear: () => void;
}

export function ChatHeader({ onClear }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">AI Assistant</h2>
          <p className="text-xs text-slate-500">Ready to help</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onClear}>
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Clear
      </Button>
    </div>
  );
}
