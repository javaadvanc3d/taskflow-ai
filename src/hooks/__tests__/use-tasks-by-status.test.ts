import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useTasksByStatus } from '../use-tasks-by-status'
import type { Task } from '@/types/tasks'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    user_id: 'u1',
    title: 'Task',
    description: null,
    priority: 'medium',
    status: 'todo',
    position: 1,
    due_date: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('useTasksByStatus', () => {
  it('groups tasks by status', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo' }),
      makeTask({ id: '2', status: 'in_progress' }),
      makeTask({ id: '3', status: 'done' }),
    ]
    const { result } = renderHook(() => useTasksByStatus(tasks))

    expect(result.current.todo).toHaveLength(1)
    expect(result.current.in_progress).toHaveLength(1)
    expect(result.current.done).toHaveLength(1)
    expect(result.current.todo[0].id).toBe('1')
  })

  it('places multiple tasks into the correct bucket', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo' }),
      makeTask({ id: '2', status: 'todo' }),
      makeTask({ id: '3', status: 'done' }),
    ]
    const { result } = renderHook(() => useTasksByStatus(tasks))

    expect(result.current.todo).toHaveLength(2)
    expect(result.current.in_progress).toHaveLength(0)
    expect(result.current.done).toHaveLength(1)
  })

  it('sorts tasks by position within each status', () => {
    const tasks = [
      makeTask({ id: 'c', status: 'todo', position: 3 }),
      makeTask({ id: 'a', status: 'todo', position: 1 }),
      makeTask({ id: 'b', status: 'todo', position: 2 }),
    ]
    const { result } = renderHook(() => useTasksByStatus(tasks))

    expect(result.current.todo.map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })

  it('returns empty arrays for statuses with no tasks', () => {
    const { result } = renderHook(() => useTasksByStatus([makeTask({ status: 'todo' })]))

    expect(result.current.in_progress).toEqual([])
    expect(result.current.done).toEqual([])
  })

  it('handles an empty task array', () => {
    const { result } = renderHook(() => useTasksByStatus([]))

    expect(result.current.todo).toEqual([])
    expect(result.current.in_progress).toEqual([])
    expect(result.current.done).toEqual([])
  })

  it('returns the same reference when the tasks array is unchanged (memoization)', () => {
    const tasks = [makeTask()]
    const { result, rerender } = renderHook(({ t }) => useTasksByStatus(t), {
      initialProps: { t: tasks },
    })
    const firstResult = result.current

    rerender({ t: tasks })

    expect(result.current).toBe(firstResult)
  })

  it('recomputes when the tasks array changes', () => {
    const tasks1 = [makeTask({ id: '1', status: 'todo' })]
    const tasks2 = [makeTask({ id: '1', status: 'done' })]

    const { result, rerender } = renderHook(({ t }) => useTasksByStatus(t), {
      initialProps: { t: tasks1 },
    })
    expect(result.current.todo).toHaveLength(1)

    rerender({ t: tasks2 })

    expect(result.current.todo).toHaveLength(0)
    expect(result.current.done).toHaveLength(1)
  })
})
