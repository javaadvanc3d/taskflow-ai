import { Check, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_CONFIG, type Task } from '@/types/tasks'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority]

  return (
    <div
      className={cn(
        'group flex items-start gap-2 rounded-lg border border-white/5 bg-white/5 p-4',
        'cursor-grab active:cursor-grabbing transition-colors hover:border-white/20',
        isDragging && 'rotate-2 scale-105 opacity-50 shadow-xl'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-xs font-semibold',
              priority.className
            )}
          >
            {priority.label}
          </span>
          {task.status === 'done' && (
            <Check className="h-3.5 w-3.5 shrink-0 text-green-400" />
          )}
        </div>

        <p className="text-sm font-medium text-white">{task.title}</p>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
            {task.description}
          </p>
        )}
      </div>

      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
    </div>
  )
}
