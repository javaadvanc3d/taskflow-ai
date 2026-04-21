import { test as setup } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authFile = path.join(__dirname, '.auth/user.json')

// Authenticates via the Next.js login form (which calls supabase.auth.signInWithPassword)
// and persists the resulting session cookies so all chromium tests start authenticated.
setup('authenticate', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  await page.goto('/login')

  await page.getByLabel('Email').fill('usuario-a@test.com')
  await page.getByLabel('Contraseña').fill('Usuario-a')
  await page.getByRole('button', { name: 'Ingresar' }).click()

  await page.waitForURL('/dashboard')

  await page.context().storageState({ path: authFile })
})
