'use client';

import { useState, useCallback, useEffect } from 'react';
import { tagApi, type TagPublic } from '@/lib/api-client';

export function useTags() {
  const [tags, setTags] = useState<TagPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tags
  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const allTags = await tagApi.getAll();
      setTags(allTags);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tags';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Create tag
  const addTag = useCallback(async (name: string, color: string = '#3B82F6') => {
    try {
      const newTag = await tagApi.create({ name, color });
      setTags((prev) => [...prev, newTag]);
      return newTag;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create tag';
      setError(message);
      throw err;
    }
  }, []);

  // Update tag
  const updateTag = useCallback(async (id: string, updates: { name?: string; color?: string }) => {
    try {
      const updatedTag = await tagApi.update(id, updates);
      setTags((prev) =>
        prev.map((tag) => (tag.id === id ? updatedTag : tag))
      );
      return updatedTag;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update tag';
      setError(message);
      throw err;
    }
  }, []);

  // Delete tag
  const removeTag = useCallback(async (id: string) => {
    try {
      await tagApi.delete(id);
      setTags((prev) => prev.filter((tag) => tag.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete tag';
      setError(message);
      throw err;
    }
  }, []);

  return {
    tags,
    loading,
    error,
    loadTags,
    addTag,
    updateTag,
    removeTag,
  };
}
