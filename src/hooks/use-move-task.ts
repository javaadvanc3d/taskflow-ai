'use client'

import { useState, useEffect } from 'react'
import { type Task, type TaskStatus } from '@/types/tasks'
import { updateTaskStatus } from '@/actions/tasks'

interface UseMoveTaskResult {
  tasks: Task[]
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>
}

export function useMoveTask(initialTasks: Task[]): UseMoveTaskResult {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks(initialTasks)
  }, [initialTasks])

  async function moveTask(taskId: string, newStatus: TaskStatus): Promise<void> {
    const previous = [...tasks]

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    try {
      await updateTaskStatus(taskId, newStatus)
    } catch {
      setTasks(previous)
    }
  }

  return { tasks, moveTask }
}
