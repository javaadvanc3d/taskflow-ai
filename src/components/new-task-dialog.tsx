'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { createTask } from '@/actions/tasks'
import { type TaskPriority, PRIORITY_CONFIG } from '@/types/tasks'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function NewTaskDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    startTransition(async () => {
      await createTask({
        title: title.trim(),
        description: null,
        priority,
        status: 'todo',
        due_date: null,
      })
      setTitle('')
      setPriority('medium')
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </button>
      </DialogTrigger>

      <DialogContent className="bg-[#1a1a2e] text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Nueva Tarea</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-title" className="text-xs font-medium text-neutral-400">Título</label>
            <Input
              id="task-title"
              placeholder="Describe la tarea…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-priority" className="text-xs font-medium text-neutral-400">Prioridad</label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger
                id="task-priority"
                className="w-full bg-white/5 border-white/10 text-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
                {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, { label: string; className: string }][]).map(
                  ([value, { label }]) => (
                    <SelectItem key={value} value={value} className="focus:bg-white/10 focus:text-white">
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="border-white/10 bg-transparent -mx-4 -mb-4">
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creando…' : 'Crear tarea'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
