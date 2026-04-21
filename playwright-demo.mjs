import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  // 1. Login
  console.log('[1/3] Navegando a login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'step1-login.png' });

  await page.locator('input[type="email"]').fill('usuario-a@test.com');
  await page.locator('input[type="password"]').fill('Usuario-a');
  await page.locator('button[type="submit"]').click();

  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  console.log('[1/3] Sesión iniciada.');
  await page.screenshot({ path: 'step2-dashboard.png' });

  // 2. Crear nueva tarea
  console.log('[2/3] Creando nueva tarea...');
  const addBtn = page.getByRole('button', { name: /nueva tarea|new task/i })
    .or(page.locator('button').filter({ hasText: /nueva/i }))
    .first();
  await addBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'step3-dialog.png' });

  await page.getByPlaceholder(/título|title/i).fill('Demo MCP usando Playwright');

  // Selects de prioridad y estado
  const comboboxes = page.getByRole('combobox');
  const count = await comboboxes.count();
  console.log(`  Comboboxes: ${count}`);

  if (count >= 1) {
    await comboboxes.first().click();
    await page.waitForTimeout(400);
    const highOpt = page.getByRole('option', { name: /high|alta/i }).first();
    if (await highOpt.isVisible().catch(() => false)) await highOpt.click();
    else console.log('  No se encontró opción High');
  }

  if (count >= 2) {
    await comboboxes.nth(1).click();
    await page.waitForTimeout(400);
    const inProgressOpt = page.getByRole('option', { name: /en proceso|in.progress/i }).first();
    if (await inProgressOpt.isVisible().catch(() => false)) await inProgressOpt.click();
    else console.log('  No se encontró opción En Proceso');
  }

  await page.screenshot({ path: 'step4-filled.png' });
  await page.getByRole('button', { name: /crear|save|create/i }).first().click();
  await page.waitForTimeout(2500);
  console.log('[2/3] Tarea creada.');
  await page.screenshot({ path: 'step5-created.png' });

  // 3. Chat con Groq
  console.log('[3/3] Usando el chat...');
  const groqBtn = page.getByRole('button', { name: /groq/i });
  if (await groqBtn.isVisible().catch(() => false)) {
    await groqBtn.click();
    await page.waitForTimeout(500);
    console.log('  Groq seleccionado.');
  }

  const chatInput = page.locator('textarea').last();
  await chatInput.fill('Qué tareas tengo con alta prioridad para hacer?');
  await page.screenshot({ path: 'step6-chat.png' });
  await chatInput.press('Enter');

  await page.waitForTimeout(12000);
  await page.screenshot({ path: 'step7-response.png' });
  console.log('[3/3] Listo.');

  await browser.close();
})();
