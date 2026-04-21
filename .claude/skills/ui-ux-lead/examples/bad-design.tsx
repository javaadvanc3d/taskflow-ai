// ❌ BAD DESIGN — violaciones de UI/UX para referencia del skill Lead Designer
// Anti-patrones: bajo contraste, sin estados de carga, mala jerarquía, sin affordance

interface BadTask {
  id: string
  title: string
  description: string
  priority: string
  status: string
}

// ❌ Sin estado de carga — la lista simplemente no aparece hasta que carga
// ❌ Sin empty state — si no hay tareas, se renderiza nada
export function BadTaskList({ tasks, loading }: { tasks: BadTask[]; loading: boolean }) {
  if (loading) return null // ❌ Sin skeleton, sin spinner — UI parece rota

  return (
    // ❌ Espaciado arbitrario (17px, 13px) fuera de la escala Tailwind
    <div style={{ padding: '17px', gap: '13px', display: 'flex', flexDirection: 'column' }}>
      {tasks.map((task) => (
        <BadTaskCard key={task.id} task={task} />
      ))}
      {/* ❌ Sin empty state — si tasks.length === 0, pantalla en blanco */}
    </div>
  )
}

// ❌ Componente con múltiples problemas de UI/UX
export function BadTaskCard({ task }: { task: BadTask }) {
  return (
    // ❌ Bajo contraste: texto gris claro sobre fondo gris claro
    // ❌ Sin hover state ni cursor — no parece clickeable
    // ❌ Sin focus ring — no navegable por teclado
    <div style={{ background: '#e0e0e0', color: '#aaaaaa', padding: '8px' }}>

      {/* ❌ Jerarquía plana — título y metadata con el mismo tamaño y peso */}
      <span>{task.title}</span>
      <span>{task.priority}</span>
      <span>{task.status}</span>

      {/* ❌ Descripción con el mismo estilo que el título — sin distinción visual */}
      <p style={{ color: '#bbbbbb' }}>{task.description}</p>

      {/* ❌ Botón que parece texto plano — sin borde, sin bg, sin cursor: pointer */}
      {/* ❌ Sin feedback al hacer click — el usuario no sabe si funcionó */}
      <span onClick={() => console.log('clicked')}>
        Marcar como hecho
      </span>

      {/* ❌ Color de prioridad hardcodeado sin semántica — no es reutilizable */}
      {task.priority === 'high' && (
        <span style={{ color: 'red', fontSize: '9px' }}>ALTA</span>
      )}
      {task.priority === 'medium' && (
        <span style={{ color: 'orange', fontSize: '9px' }}>MEDIA</span>
      )}
    </div>
  )
}

// ❌ Formulario sin estados de error ni confirmación
export function BadCreateTaskForm({ onSubmit }: { onSubmit: (title: string) => Promise<void> }) {
  return (
    // ❌ Sin label, sin placeholder descriptivo, sin estado de envío
    <form onSubmit={(e) => {
      e.preventDefault()
      const data = new FormData(e.currentTarget)
      // ❌ Sin feedback de carga mientras onSubmit procesa
      // ❌ Sin mensaje de éxito ni error tras completar
      onSubmit(data.get('title') as string)
    }}>
      {/* ❌ Sin label asociado — lector de pantalla no puede identificar el campo */}
      <input name="title" style={{ border: '1px solid #ccc' }} />

      {/* ❌ Botón de submit indistinguible — sin estilo visual de acción primaria */}
      <button type="submit">ok</button>
    </form>
  )
}
