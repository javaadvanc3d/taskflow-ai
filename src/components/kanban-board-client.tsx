'use client'

import dynamic from 'next/dynamic'
import { type Task } from '@/types/tasks'

const KanbanBoard = dynamic(
  () => import('@/components/kanban-board').then((m) => m.KanbanBoard),
  { ssr: false }
)

export function KanbanBoardClient({ initialTasks }: { initialTasks: Task[] }) {
  return <KanbanBoard initialTasks={initialTasks} />
}
