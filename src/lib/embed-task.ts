import { createClient } from '@supabase/supabase-js'
import { embedDocument } from '@/lib/embeddings'
import { type Task, PRIORITY_CONFIG, KANBAN_COLUMNS } from '@/types/tasks'

export function taskToContent(task: Task): string {
  const priorityLabel = PRIORITY_CONFIG[task.priority].label
  const statusLabel = KANBAN_COLUMNS.find(c => c.status === task.status)?.label ?? task.status

  return `Tarea: ${task.title}. Descripción: ${task.description || 'Sin descripción'}. Prioridad: ${priorityLabel}. Estado: ${statusLabel}.`
}

export async function embedTask(task: Task): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const content = taskToContent(task)
  const embedding = await embedDocument(content)

  const { error: delError } = await supabase
    .from('task_embeddings')
    .delete()
    .eq('task_id', task.id)

  if (delError) throw new Error(delError.message)

  const { error: insError } = await supabase
    .from('task_embeddings')
    .insert({ task_id: task.id, user_id: task.user_id, content, embedding })

  if (insError) throw new Error(insError.message)
}
