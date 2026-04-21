'use client'

import { useState } from 'react'
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { type Task, type TaskStatus } from '@/types/tasks'

const VALID_STATUSES = new Set<string>(['todo', 'in_progress', 'done'])

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && VALID_STATUSES.has(value)
}

interface UseKanbanDndResult {
  sensors: SensorDescriptor<SensorOptions>[]
  activeTask: Task | null
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
}

export function useKanbanDnd(
  tasks: Task[],
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>
): UseKanbanDndResult {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id) ?? null
    setActiveTask(task)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const draggedTask = tasks.find((t) => t.id === active.id)
    if (!draggedTask) return

    // over.id is a column droppable → use directly
    // over.id is a task sortable    → resolve to that task's status
    const newStatus: TaskStatus = isTaskStatus(over.id)
      ? over.id
      : (tasks.find((t) => t.id === over.id)?.status ?? draggedTask.status)

    if (draggedTask.status === newStatus) return

    void moveTask(draggedTask.id, newStatus)
  }

  return { sensors, activeTask, handleDragStart, handleDragEnd }
}
