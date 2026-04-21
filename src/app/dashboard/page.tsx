import { redirect } from 'next/navigation'
import { Kanban } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTasks } from '@/actions/tasks'
import { KanbanBoardClient } from '@/components/kanban-board-client'
import { UserMenu } from '@/components/user-menu'
import { TaskChat } from '@/components/chat/task-chat'
import { NewTaskDialog } from '@/components/new-task-dialog'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const tasks = await getTasks()

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0f1a] text-white">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Kanban className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">
            TaskFlow <span className="text-violet-400">AI</span>
          </span>
        </div>

        <NewTaskDialog />

        <UserMenu email={user.email ?? ''} />
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <KanbanBoardClient initialTasks={tasks} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-neutral-400">Tu asistente IA</h2>
          <div className="flex-1">
            <TaskChat />
          </div>
        </div>
      </div>
    </div>
  )
}
