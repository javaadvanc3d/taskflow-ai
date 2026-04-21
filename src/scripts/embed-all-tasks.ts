import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { KANBAN_COLUMNS, PRIORITY_CONFIG, type Task } from '../types/tasks'
import { embedDocuments } from '../lib/embeddings'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** 
function taskToContent(task: Task): string {
  return task.description
    ? `${task.title}. ${task.description}`
    : task.title
}**/

function taskToContent(task: Task): string {
  // Traducimos los estados y prioridades a lenguaje natural para que el embedding los capte mejor
  const priorityLabel = PRIORITY_CONFIG[task.priority].label;
  const statusLabel = KANBAN_COLUMNS.find(c => c.status === task.status)?.label || task.status;

  return `Tarea: ${task.title}. 
          Descripción: ${task.description || 'Sin descripción'}. 
          Prioridad: ${priorityLabel}. 
          Estado: ${statusLabel}.`;
}

async function embedBatch(tasks: Task[]): Promise<void> {
  const contents = tasks.map(taskToContent)

  const embeddings = await embedDocuments(contents)

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const embedding = embeddings[i]
    if (!embedding) throw new Error(`No embedding returned for task ${task.id}`)

    const { error: delError } = await supabase
      .from('task_embeddings')
      .delete()
      .eq('task_id', task.id)

    if (delError) throw new Error(delError.message)

    const { error: insError } = await supabase
      .from('task_embeddings')
      .insert({ task_id: task.id, user_id: task.user_id, content: contents[i], embedding })

    if (insError) throw new Error(insError.message)
  }
}

async function main(): Promise<void> {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at')

  if (error) throw new Error(error.message)
  if (!tasks || tasks.length === 0) {
    console.log('No tasks found.')
    return
  }

  console.log(`Embedding ${tasks.length} tasks…`)

  const BATCH_SIZE = 10
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE) as Task[]
    await embedBatch(batch)
    console.log(`  ✓ ${Math.min(i + BATCH_SIZE, tasks.length)} / ${tasks.length}`)

    if (i + BATCH_SIZE < tasks.length) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
