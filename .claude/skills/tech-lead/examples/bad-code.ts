// ❌ BAD CODE — 5+ violaciones SOLID
// Este archivo existe como referencia de anti-patrones para el skill Tech Lead

import { createClient } from '@supabase/supabase-js' // ❌ D: importa implementación concreta

// ❌ S: Interface con demasiadas responsabilidades (god interface)
// ❌ I: Clientes se ven forzados a implementar métodos que no necesitan
interface TaskManager {
  fetchTasks(): Promise<void>
  renderTask(id: string): JSX.Element
  sendEmailNotification(userId: string): Promise<void>
  exportToPDF(): Blob
  validateForm(data: unknown): boolean
  connectToSocket(): WebSocket
}

// ❌ S: Componente con múltiples responsabilidades
// Hace fetch, formatea datos, maneja auth, renderiza Y envía emails
async function TaskDashboard() {
  // ❌ D: crea su propia instancia de Supabase (no inyectada)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ❌ S: lógica de negocio mezclada con renderizado
  const { data: tasks } = await supabase.from('tasks').select('*')
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // ❌ S: autenticación dentro del componente de UI
    await supabase.auth.signOut()
    return null
  }

  // ❌ S: formateo de datos dentro del componente
  const formatted = tasks?.map(t => ({
    ...t,
    label: t.priority === 'high' ? '🔴 ALTA' :
           t.priority === 'medium' ? '🟡 MEDIA' : '🟢 BAJA'
  }))

  // ❌ O: agregar nuevo status requiere modificar este switch
  function getStatusColor(status: string): string {
    switch (status) {
      case 'todo': return 'gray'
      case 'in_progress': return 'blue'
      case 'done': return 'green'
      // Para agregar 'archived' hay que tocar este código
      default: return 'gray'
    }
  }

  // ❌ S: envío de email dentro del componente de renderizado
  async function notifyUser() {
    await fetch('/api/send-email', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, tasks: formatted })
    })
  }

  return { tasks: formatted, getStatusColor, notifyUser }
}

// ❌ L: Subclase rompe el contrato del padre
class BaseCard {
  render() {
    return { title: 'card', clickable: true }
  }
}

class ArchivedCard extends BaseCard {
  render() {
    // ❌ L: cambia 'clickable' a false — consumidores del padre no esperan esto
    return { title: 'archived', clickable: false, extraProp: 'only here' }
  }
}

// ❌ I: props con demasiados campos, muchos opcionales e incompatibles entre sí
interface BadTaskCardProps {
  task: { id: string; title: string }
  // Los siguientes props nunca se usan juntos:
  isDragging?: boolean         // solo en modo kanban
  isListView?: boolean         // solo en modo lista
  showEmailButton?: boolean    // solo en vista admin
  showPDFExport?: boolean      // solo en vista admin
  onKanbanDrop?: () => void    // solo en modo kanban
  onListClick?: () => void     // solo en modo lista
  adminToken?: string          // solo si showEmailButton o showPDFExport
  dragHandleRef?: React.Ref<HTMLDivElement> // solo si isDragging
}

// ❌ D: hook de alto nivel que importa y usa implementación concreta directamente
import { updateTaskStatus } from '../actions/tasks' // ❌ D: acoplado a implementación

function useBadTaskMove(tasks: Array<{ id: string; status: string }>) {
  async function move(id: string, status: string) {
    // ❌ D: llama directamente a la implementación — no se puede testear sin side effects
    await updateTaskStatus(id, status as never)
  }
  return { move }
}

export { TaskDashboard, BaseCard, ArchivedCard, useBadTaskMove }
export type { BadTaskCardProps, TaskManager }
