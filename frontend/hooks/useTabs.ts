'use client';

import { useState, useCallback } from 'react';
import { TabId } from '@/lib/types';

export function useTabs(initialTab: TabId = 'todos') {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const setTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    setTab,
  };
}
