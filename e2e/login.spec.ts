import { test, expect } from '@playwright/test'

// Clear the auth state inherited from playwright.config.ts for all tests in this file.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renders the login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /TaskFlow/i })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
  })

  test('shows an error message on invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('nobody@example.com')
    await page.getByLabel('Contraseña').fill('wrongpassword')
    await page.getByRole('button', { name: 'Ingresar' }).click()

    await expect(page.locator('p.text-red-400')).toBeVisible({ timeout: 10_000 })
  })

  test('redirects to /dashboard after a successful login', async ({ page }) => {
    await page.getByLabel('Email').fill('usuario-a@test.com')
    await page.getByLabel('Contraseña').fill('Usuario-a')
    await page.getByRole('button', { name: 'Ingresar' }).click()

    await page.waitForURL('/dashboard', { timeout: 15_000 })
    await expect(page).toHaveURL('/dashboard')
  })

  test('guards /dashboard — unauthenticated request redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
