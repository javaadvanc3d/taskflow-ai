// ✅ GOOD CODE — Versión corregida con SOLID + Dependency Injection

// ✅ I: Interfaces pequeñas y específicas por responsabilidad
interface Renderable {
  render(): JSX.Element
}

interface TaskFetcher {
  fetchTasks(userId: string): Promise<Task[]>
}

interface TaskMutator {
  updateStatus(taskId: string, status: TaskStatus): Promise<void>
}
// Los clientes solo implementan lo que necesitan — no la mega-interfaz

// ✅ S + D: tipos del dominio separados del acceso a datos
interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
}

type TaskStatus = 'todo' | 'in_progress' | 'done'
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

// ✅ O: config de colores como dato, no como switch — agregar nuevos sin modificar
const STATUS_CONFIG: Record<TaskStatus, { color: string; label: string }> = {
  todo:        { color: 'gray',  label: 'Por hacer'   },
  in_progress: { color: 'blue',  label: 'En progreso' },
  done:        { color: 'green', label: 'Terminado'   },
  // Para agregar 'archived': solo se agrega aquí, ningún componente cambia
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  low:      { label: 'BAJA',    className: 'bg-green-500/20 text-green-400'   },
  medium:   { label: 'MEDIA',   className: 'bg-yellow-500/20 text-yellow-400' },
  high:     { label: 'ALTA',    className: 'bg-red-500/20 text-red-400'       },
  critical: { label: 'CRÍTICA', className: 'bg-red-600/30 text-red-300'       },
}

// ✅ S: componente con una sola responsabilidad — renderizar una card
// ✅ I: props interface mínima, sin campos incompatibles
interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

function TaskCard({ task, isDragging }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority]
  return { task, priority, isDragging } // simplificado para el ejemplo
}

// ✅ I: props separadas por variante de uso — no mezclar kanban/lista/admin
interface KanbanTaskCardProps extends TaskCardProps {
  onDrop: (status: TaskStatus) => void
}

interface AdminTaskCardProps extends TaskCardProps {
  onExport: () => void
  adminToken: string
}

// ✅ L: SortableTaskCard es sustituible por TaskCard — mismo contrato + extensión
interface SortableTaskCardProps {
  task: Task
  isDragging?: boolean  // ✅ L: mantiene la misma garantía del padre
}

function SortableTaskCard({ task, isDragging }: SortableTaskCardProps) {
  // Agrega comportamiento (sortable) sin romper el contrato de TaskCard
  return TaskCard({ task, isDragging })
}

// ✅ D: hook recibe el mutador como dependencia inyectada
// Puede testearse pasando un mock de `mutator` — sin side effects reales
interface MoveTaskOptions {
  mutator: TaskMutator           // ✅ D: depende de abstracción, no de implementación
  onError?: (err: Error) => void // ✅ O: extensible sin modificar el hook
}

function useMoveTask(
  initialTasks: Task[],
  { mutator, onError }: MoveTaskOptions
) {
  // Estado interno
  let tasks = [...initialTasks]

  async function moveTask(taskId: string, newStatus: TaskStatus) {
    const previous = [...tasks]
    // Optimistic update
    tasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)

    try {
      // ✅ D: llama a la abstracción — no sabe si es Supabase, REST, o un mock
      await mutator.updateStatus(taskId, newStatus)
    } catch (err) {
      tasks = previous
      onError?.(err as Error)
    }
  }

  return { tasks, moveTask }
}

// ✅ D: implementación concreta — inyectada desde el Server Component, no importada en el hook
class SupabaseTaskMutator implements TaskMutator {
  constructor(private readonly supabaseClient: { from: Function }) {}

  async updateStatus(taskId: string, status: TaskStatus): Promise<void> {
    const { error } = await this.supabaseClient
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
    if (error) throw new Error(error.message)
  }
}

// ✅ S: Server Component solo coordina — no tiene lógica de negocio ni renderizado complejo
// async function DashboardPage() {
//   const supabase = await createClient()           // ← abstracción de @/lib/supabase/server
//   const tasks = await getTasks()                  // ← Server Action separada
//   const mutator = new SupabaseTaskMutator(supabase)
//   return <KanbanBoard initialTasks={tasks} mutator={mutator} />
// }

export {
  TaskCard,
  SortableTaskCard,
  SupabaseTaskMutator,
  useMoveTask,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
}
export type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskCardProps,
  KanbanTaskCardProps,
  AdminTaskCardProps,
  TaskFetcher,
  TaskMutator,
  MoveTaskOptions,
}
