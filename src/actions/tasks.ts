'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { embedTask } from '@/lib/embed-task'
import { type Task, type TaskStatus } from '@/types/tasks'

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus
): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', taskId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  // No re-embed: status change doesn't affect title/description content
}

export async function createTask(
  task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'position' | 'user_id'>
): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { count } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const position = (count ?? 0) + 1

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...task, user_id: user.id, position })
    .select()
    .single()

  if (error) throw new Error(error.message)

  try {
    await embedTask(data as Task)
  } catch {
    // Don't fail task creation if embedding fails
  }

  revalidatePath('/dashboard')
}

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('position')

  return data ?? []
}
