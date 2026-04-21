'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { SortableTaskCard } from '@/components/sortable-task-card'
import { type Task, type TaskStatus } from '@/types/tasks'

interface KanbanColumnProps {
  id: TaskStatus
  label: string
  tasks: Task[]
}

export function KanbanColumn({ id, label, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 shadow-sm">
      <div className="flex items-center gap-2 pb-1">
        <h2 className="text-sm font-semibold text-white">{label}</h2>
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-xs font-medium text-neutral-300">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex min-h-96 flex-col gap-2 rounded-lg border p-1 transition-colors duration-200',
            isOver
              ? 'border-blue-500/50 bg-blue-500/5'
              : 'border-white/10 bg-white/5'
          )}
        >
          {tasks.length === 0 ? (
            <p className="m-auto text-xs text-neutral-600">Suelta aquí</p>
          ) : (
            tasks.map((task) => <SortableTaskCard key={task.id} task={task} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}
