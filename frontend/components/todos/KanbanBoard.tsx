'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Plus, MoreVertical } from 'lucide-react';
import { Todo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DraggableTodoCard } from './DraggableTodoCard';

interface KanbanBoardProps {
  todos: Todo[];
  onSetStatus: (id: string, status: 'pending' | 'in_progress' | 'done' | 'cancelled') => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

type ColumnId = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';

interface Column {
  id: ColumnId;
  title: string;
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
  color: string;
}

const columns: Column[] = [
  { id: 'backlog', title: 'Backlog', status: 'pending', color: 'bg-slate-500' },
  { id: 'todo', title: 'To Do', status: 'pending', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress', color: 'bg-yellow-500' },
  { id: 'done', title: 'Done', status: 'done', color: 'bg-green-500' },
  { id: 'cancelled', title: 'Cancelled', status: 'cancelled', color: 'bg-red-500' },
];

export function KanbanBoard({ todos, onSetStatus, onEdit, onDelete }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columnsState, setColumnsState] = useState<Record<ColumnId, string[]>>(() => {
    const state: Record<ColumnId, string[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
      cancelled: [],
    };

    todos.forEach((todo) => {
      if (todo.status === 'pending') {
        state.todo.push(todo.id);
      } else {
        state[todo.status as ColumnId].push(todo.id);
      }
    });

    return state;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const findTodoById = (id: string) => todos.find((todo) => todo.id === id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumn = Object.entries(columnsState).find(([_, ids]) =>
      ids.includes(activeId)
    );
    const overColumn = Object.entries(columnsState).find(([_, ids]) =>
      ids.includes(overId)
    );

    if (!activeColumn || !overColumn) return;

    const activeColumnId = activeColumn[0] as ColumnId;
    const overColumnId = overColumn[0] as ColumnId;

    if (activeColumnId === overColumnId) {
      // Same column - reorder
      setColumnsState((prev) => {
        const activeIds = [...prev[activeColumnId]];
        const overIndex = activeIds.indexOf(overId);
        const activeIndex = activeIds.indexOf(activeId);

        if (activeIndex !== -1 && overIndex !== -1) {
          const newIds = arrayMove(activeIds, activeIndex, overIndex);
          return {
            ...prev,
            [activeColumnId]: newIds,
          };
        }

        return prev;
      });
    } else {
      // Different column - move
      setColumnsState((prev) => {
        const activeIds = [...prev[activeColumnId]];
        const newActiveIds = activeIds.filter((id) => id !== activeId);

        const overIds = [...prev[overColumnId]];
        if (!overIds.includes(overId)) {
          overIds.push(activeId);
        } else {
          const overIndex = overIds.indexOf(overId);
          overIds.splice(overIndex, 0, activeId);
        }

        return {
          ...prev,
          [activeColumnId]: newActiveIds,
          [overColumnId]: overIds,
        };
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overColumn = Object.entries(columnsState).find(([_, ids]) =>
      ids.includes(over.id as string)
    );

    if (!overColumn) return;

    const columnId = overColumn[0] as ColumnId;
    const column = columns.find((col) => col.id === columnId);

    if (column) {
      onSetStatus(activeId, column.status);
    }
  };

  const activeTodo = activeId ? findTodoById(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pb-20">
        {columns.map((column) => {
          const columnTodos = columnsState[column.id]
            .map((id) => findTodoById(id))
            .filter(Boolean) as Todo[];

          return (
            <div key={column.id} className="flex flex-col h-full">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', column.color)} />
                  <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {columnTodos.length}
                  </span>
                </div>
                <button className="p-1 hover:bg-accent rounded-md transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Column Content */}
              <SortableContext
                items={columnTodos.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2 min-h-[200px] bg-muted/20 rounded-lg p-2 border border-border/50">
                  {columnTodos.map((todo) => (
                    <DraggableTodoCard
                      key={todo.id}
                      todo={todo}
                      onSetStatus={onSetStatus}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}

                  {columnTodos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <p className="text-sm">No tasks here</p>
                      <p className="text-xs mt-1">Drag tasks to this column</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTodo ? (
          <div className="rotate-3 opacity-90 shadow-2xl">
            <DraggableTodoCard
              todo={activeTodo}
              onSetStatus={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
