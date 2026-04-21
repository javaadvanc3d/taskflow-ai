import { Kanban, Plus } from 'lucide-react'
import { type Task } from '@/types/tasks'
import { KanbanBoardClient } from '@/components/kanban-board-client'

const mockTasks: Task[] = [
  {
    id: '1', user_id: 'a', title: 'Deploy en Vercel',
    description: null, priority: 'medium', status: 'todo',
    position: 1, due_date: null, created_at: '', updated_at: '',
  },
  {
    id: '2', user_id: 'a', title: 'Agregar Dark Mode',
    description: null, priority: 'low', status: 'todo',
    position: 2, due_date: null, created_at: '', updated_at: '',
  },
  {
    id: '3', user_id: 'a', title: 'Tests E2E',
    description: null, priority: 'medium', status: 'todo',
    position: 3, due_date: null, created_at: '', updated_at: '',
  },
  {
    id: '4', user_id: 'a', title: 'Construir Kanban Board',
    description: null, priority: 'high', status: 'in_progress',
    position: 1, due_date: null, created_at: '', updated_at: '',
  },
  {
    id: '5', user_id: 'a', title: 'Implementar RAG',
    description: null, priority: 'medium', status: 'in_progress',
    position: 2, due_date: null, created_at: '', updated_at: '',
  },
  {
    id: '6', user_id: 'a', title: 'Diseñar base de datos',
    description: null, priority: 'high', status: 'done',
    position: 1, due_date: null, created_at: '', updated_at: '',
  },
  {
    id: '7', user_id: 'a', title: 'Configurar Supabase',
    description: null, priority: 'high', status: 'done',
    position: 2, due_date: null, created_at: '', updated_at: '',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Kanban className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">
            TaskFlow <span className="text-violet-400">AI</span>
          </span>
        </div>

        <button className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </button>
      </header>

      <KanbanBoardClient initialTasks={mockTasks} />
    </div>
  )
}
