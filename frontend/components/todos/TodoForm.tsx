'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Todo, Priority } from '@/lib/types';
import { TagPublic } from '@/lib/api-client';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status' | 'category' | 'completed'>) => void;
  editTodo?: Todo | null;
  availableTags?: TagPublic[];
}

export function TodoForm({ isOpen, onClose, onSubmit, editTodo, availableTags = [] }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Reset form when editTodo changes or modal opens/closes
  useEffect(() => {
    if (editTodo) {
      setTitle(editTodo.title || '');
      setDescription(editTodo.description || '');
      setPriority(editTodo.priority || 'medium');
      setDueDate(editTodo.dueDate ? new Date(editTodo.dueDate).toISOString().split('T')[0] : '');
      setSelectedTagIds(editTodo.tags?.map(t => t.id) || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setSelectedTagIds([]);
    }
  }, [editTodo, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: availableTags.filter(t => selectedTagIds.includes(t.id)),
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setSelectedTagIds([]);
    onClose();
  };

  const tagOptions = availableTags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

  const priorityOptions = [
    { value: 'urgent', label: '🔴 Urgent' },
    { value: 'high', label: '🟠 High' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'low', label: '🟢 Low' },
  ];

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTodo ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <TextArea
          label="Description (optional)"
          placeholder="Add more details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={priorityOptions}
          />

          <Input
            label="Due Date (optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Tag Selection */}
        {availableTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: tag.color }
                        : {}
                    }
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{editTodo ? 'Update' : 'Create'} Task</Button>
        </div>
      </form>
    </Modal>
  );
}
