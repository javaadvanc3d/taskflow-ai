'use client'

// ✅ GOOD DESIGN — versión corregida para referencia del skill Lead Designer
// Principios aplicados: feedback inmediato, skeletons, jerarquía clara, affordance, a11y

import { useState, useTransition } from 'react'
import { Check, GripVertical, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_CONFIG, type Task } from '@/types/tasks'

// ✅ Skeleton que replica la forma exacta del TaskCard — sin layout shift
export function TaskCardSkeleton() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/5 p-4 animate-pulse">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-16 rounded bg-white/10" />
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
      </div>
      <div className="mt-0.5 h-4 w-4 rounded bg-white/10 shrink-0" />
    </div>
  )
}

// ✅ Empty state con icono + mensaje descriptivo + CTA
export function TaskListEmptyState({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 p-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
        <Plus className="h-5 w-5 text-neutral-400" />
      </div>
      {/* ✅ Jerarquía tipográfica: título > descripción */}
      <p className="text-sm font-medium text-white">Sin tareas todavía</p>
      <p className="text-xs text-neutral-500">Crea tu primera tarea para empezar</p>
      {/* ✅ CTA claro con affordance — parece botón */}
      <button
        onClick={onCreateTask}
        className="mt-1 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]"
      >
        Nueva tarea
      </button>
    </div>
  )
}

// ✅ Lista con skeleton durante carga y empty state cuando no hay datos
export function GoodTaskList({
  tasks,
  loading,
  onCreateTask,
}: {
  tasks: Task[]
  loading: boolean
  onCreateTask: () => void
}) {
  if (loading) {
    return (
      // ✅ Espaciado consistente con escala Tailwind (gap-2 = 8px)
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return <TaskListEmptyState onCreateTask={onCreateTask} />
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {tasks.map((task) => (
        <GoodTaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}

// ✅ TaskCard con jerarquía visual, affordance y feedback de acción
export function GoodTaskCard({ task }: { task: Task }) {
  const [isDone, setIsDone] = useState(task.status === 'done')
  const [isPending, startTransition] = useTransition()
  const priority = PRIORITY_CONFIG[task.priority]

  function handleToggle() {
    startTransition(async () => {
      // Server Action aquí
      setIsDone((prev) => !prev)
    })
  }

  return (
    // ✅ Hover state visible + cursor correcto + focus ring para teclado
    // ✅ Contraste suficiente: texto blanco/neutral-200 sobre fondo oscuro
    <div
      className={cn(
        'group flex items-start gap-2 rounded-lg border border-white/5 bg-white/5 p-4',
        'transition-colors hover:border-white/20 hover:bg-white/[0.07]',
        isDone && 'opacity-60'
      )}
    >
      <div className="min-w-0 flex-1">
        {/* ✅ Jerarquía: badge (meta) → título → descripción */}
        <div className="mb-1.5 flex items-center gap-2">
          <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold', priority.className)}>
            {priority.label}
          </span>
          {isDone && <Check className="h-3.5 w-3.5 shrink-0 text-green-400" aria-label="Completada" />}
        </div>

        {/* ✅ Título con peso medium — el ojo lo lee primero */}
        <p className={cn('text-sm font-medium text-white', isDone && 'line-through text-neutral-400')}>
          {task.title}
        </p>

        {/* ✅ Descripción con color y tamaño distintos — nivel 3 de jerarquía */}
        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{task.description}</p>
        )}
      </div>

      {/* ✅ Botón con feedback de carga (pending) + affordance clara */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0f0f1a]',
          isDone
            ? 'border-green-500/50 bg-green-500/20 text-green-400'
            : 'border-white/20 bg-transparent hover:border-white/40',
          isPending && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isPending
          ? <span className="h-2 w-2 animate-spin rounded-full border border-neutral-400 border-t-transparent" />
          : isDone && <Check className="h-3 w-3" />
        }
      </button>

      {/* ✅ Drag handle con cursor grab explícito */}
      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-neutral-500 active:cursor-grabbing" />
    </div>
  )
}

// ✅ Formulario con label, estado de envío y feedback de éxito/error
export function GoodCreateTaskForm({ onSubmit }: { onSubmit: (title: string) => Promise<void> }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const title = (data.get('title') as string).trim()
    if (!title) return

    startTransition(async () => {
      try {
        await onSubmit(title)
        setStatus('success')
        ;(e.target as HTMLFormElement).reset()
        setTimeout(() => setStatus('idle'), 2000)
      } catch {
        setStatus('error')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* ✅ Label asociado por htmlFor — accesible para lectores de pantalla */}
      <label htmlFor="task-title" className="text-xs font-medium text-neutral-400">
        Título de la tarea
      </label>
      <input
        id="task-title"
        name="title"
        required
        placeholder="Describe la tarea…"
        disabled={isPending}
        className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-violet-500/60 disabled:opacity-50"
      />

      {/* ✅ Feedback de estado: éxito en verde, error en rojo */}
      {status === 'success' && (
        <p className="flex items-center gap-1.5 text-xs text-green-400">
          <Check className="h-3.5 w-3.5" /> Tarea creada correctamente
        </p>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-400">Error al crear la tarea. Intenta de nuevo.</p>
      )}

      {/* ✅ Botón primario con estilo de acción + feedback de carga */}
      <button
        type="submit"
        disabled={isPending}
        className="flex h-9 items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        {isPending
          ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          : 'Crear tarea'
        }
      </button>
    </form>
  )
}
