'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Todo, Priority } from '@/lib/types';
import { mockCategories } from '@/lib/mock-data';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status'>) => void;
  editTodo?: Todo | null;
}

export function TodoForm({ isOpen, onClose, onSubmit, editTodo }: TodoFormProps) {
  const [title, setTitle] = useState(editTodo?.title || '');
  const [description, setDescription] = useState(editTodo?.description || '');
  const [priority, setPriority] = useState<Priority>(editTodo?.priority || 'medium');
  const [category, setCategory] = useState(editTodo?.category || 'Work');
  const [dueDate, setDueDate] = useState(
    editTodo?.dueDate ? new Date(editTodo.dueDate).toISOString().split('T')[0] : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      completed: editTodo?.completed || false,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('Work');
    setDueDate('');
    onClose();
  };

  const categoryOptions = mockCategories.map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));

  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTodo ? 'Edit Todo' : 'New Todo'}>
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
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categoryOptions}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={priorityOptions}
          />
        </div>

        <Input
          label="Due Date (optional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{editTodo ? 'Update' : 'Create'} Todo</Button>
        </div>
      </form>
    </Modal>
  );
}
