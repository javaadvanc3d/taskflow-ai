import { test, expect } from '@playwright/test'

// Uses storageState from e2e/.auth/user.json (set by auth.setup.ts via playwright.config.ts).

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('shows all three kanban columns', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Por hacer' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'En progreso' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Terminado' })).toBeVisible()
  })

  test('shows the Nueva Tarea button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Nueva Tarea' })).toBeVisible()
  })

  test('opens the new-task dialog when the button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Nueva Tarea' }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Nueva Tarea', exact: true })).toBeVisible()
    await expect(page.getByLabel('Título')).toBeVisible()
    await expect(page.getByLabel('Prioridad')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Crear tarea' })).toBeVisible()
  })

  test('creates a new task and shows it in the board', async ({ page }) => {
    const title = `E2E task ${Date.now()}`

    await page.getByRole('button', { name: 'Nueva Tarea' }).click()
    await page.getByLabel('Título').fill(title)
    await page.getByRole('button', { name: 'Crear tarea' }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 })
  })

  test('disables the submit button when the title is empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Nueva Tarea' }).click()

    await expect(page.getByRole('button', { name: 'Crear tarea' })).toBeDisabled()
  })
})
