import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { embedTask } from '@/lib/embed-task'
import { getTasks, createTask, updateTaskStatus } from '../tasks'
import type { Task } from '@/types/tasks'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/embed-task', () => ({ embedTask: vi.fn().mockResolvedValue(undefined) }))

const { mockGetUser, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

// --- builder factories ---

function makeSelectOrderBuilder(data: Task[] | null = []) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
  }
}

function makeUpdateBuilder(error: { message: string } | null = null) {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error }),
    }),
  }
}

function makeCountBuilder(count: number) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ count, error: null }),
    }),
  }
}

function makeInsertBuilder(data: Task | null, error: { message: string } | null = null) {
  return {
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
  }
}

// --- helpers ---

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    user_id: 'user-123',
    title: 'Test Task',
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

const mockUser = { id: 'user-123', email: 'test@example.com' }

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── getTasks ───────────────────────────────────────────────────────────────

describe('getTasks', () => {
  it('returns [] when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    expect(await getTasks()).toEqual([])
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('returns tasks for authenticated user', async () => {
    const tasks = [makeTask({ id: '1' }), makeTask({ id: '2' })]
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockFrom.mockReturnValue(makeSelectOrderBuilder(tasks))

    expect(await getTasks()).toEqual(tasks)
  })

  it('returns [] when query returns null data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockFrom.mockReturnValue(makeSelectOrderBuilder(null))

    expect(await getTasks()).toEqual([])
  })
})

// ─── updateTaskStatus ────────────────────────────────────────────────────────

describe('updateTaskStatus', () => {
  it('returns without updating when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    await updateTaskStatus('task-1', 'done')

    expect(mockFrom).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('updates status and revalidates path', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockFrom.mockReturnValue(makeUpdateBuilder())

    await updateTaskStatus('task-1', 'done')

    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('throws when the database update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockFrom.mockReturnValue(makeUpdateBuilder({ message: 'DB error' }))

    await expect(updateTaskStatus('task-1', 'done')).rejects.toThrow('DB error')
  })

  it('does not call revalidatePath when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockFrom.mockReturnValue(makeUpdateBuilder({ message: 'DB error' }))

    await expect(updateTaskStatus('task-1', 'done')).rejects.toThrow()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

// ─── createTask ──────────────────────────────────────────────────────────────

describe('createTask', () => {
  const input: Parameters<typeof createTask>[0] = {
    title: 'New Task',
    description: null,
    priority: 'medium',
    status: 'todo',
    due_date: null,
  }

  it('returns without creating when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    await createTask(input)

    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('inserts with user_id and position = count + 1', async () => {
    const created = makeTask({ ...input, user_id: mockUser.id, position: 4 })
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockFrom
      .mockReturnValueOnce(makeCountBuilder(3))
      .mockReturnValueOnce(makeInsertBuilder(created))

    await createTask(input)

    const insertedData = mockFrom.mock.results[1].value.insert.mock.calls[0][0]
    expect(insertedData.user_id).toBe(mockUser.id)
    expect(insertedData.position).toBe(4)
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
  })

  it('uses position 1 when user has no tasks yet', async () => {
    const created = makeTask({ ...input, user_id: mockUser.id, position: 1 })
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockFrom
      .mockReturnValueOnce(makeCountBuilder(0))
      .mockReturnValueOnce(makeInsertBuilder(created))

    await createTask(input)

    const insertedData = mockFrom.mock.results[1].value.insert.mock.calls[0][0]
    expect(insertedData.position).toBe(1)
  })

  it('throws when insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockFrom
      .mockReturnValueOnce(makeCountBuilder(0))
      .mockReturnValueOnce(makeInsertBuilder(null, { message: 'Insert failed' }))

    await expect(createTask(input)).rejects.toThrow('Insert failed')
  })

  it('does not throw when embedding fails', async () => {
    vi.mocked(embedTask).mockRejectedValueOnce(new Error('Voyage AI down'))
    const created = makeTask({ ...input, user_id: mockUser.id })
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockFrom
      .mockReturnValueOnce(makeCountBuilder(0))
      .mockReturnValueOnce(makeInsertBuilder(created))

    await expect(createTask(input)).resolves.not.toThrow()
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
  })
})
