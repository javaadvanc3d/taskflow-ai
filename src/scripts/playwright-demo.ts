import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  // 1. Login
  console.log('Navegando a login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', 'usuario-a@test.com');
  await page.fill('input[type="password"]', 'Usuario-a');
  await page.click('button[type="submit"]');

  console.log('Esperando dashboard...');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  console.log('Dashboard cargado.');

  // 2. Crear nueva tarea
  console.log('Abriendo diálogo de nueva tarea...');
  // Buscar botón de nueva tarea
  const newTaskBtn = page.getByRole('button', { name: /nueva tarea|new task|add task|\+/i }).first();
  await newTaskBtn.click();
  await page.waitForTimeout(1000);

  // Título
  const titleInput = page.getByPlaceholder(/título|title/i).or(page.locator('input[name="title"]')).first();
  await titleInput.fill('Demo MCP usando Playwright');

  // Prioridad: high
  const prioritySelect = page.getByRole('combobox').filter({ hasText: /prioridad|priority/i }).or(page.locator('select[name="priority"]')).first();
  await prioritySelect.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: /high|alta/i }).first().click();

  // Estado: En Proceso
  const statusSelect = page.getByRole('combobox').filter({ hasText: /estado|status/i }).or(page.locator('select[name="status"]')).first();
  await statusSelect.click();
  await page.waitForTimeout(500);
  await page.getByRole('option', { name: /en proceso|in.progress/i }).first().click();

  // Guardar
  const saveBtn = page.getByRole('button', { name: /crear|guardar|save|create/i }).first();
  await saveBtn.click();
  await page.waitForTimeout(2000);
  console.log('Tarea creada.');

  // 3. Usar el chat con Groq
  console.log('Usando el chat...');
  // Cambiar a Groq si hay un toggle
  const groqToggle = page.getByRole('button', { name: /groq/i }).or(page.getByText(/groq/i)).first();
  if (await groqToggle.isVisible()) {
    await groqToggle.click();
    await page.waitForTimeout(500);
    console.log('Modelo cambiado a Groq.');
  }

  // Escribir la pregunta en el chat
  const chatInput = page.getByPlaceholder(/mensaje|message|pregunta|ask/i).or(page.locator('textarea, input[type="text"]').last()).first();
  await chatInput.fill('Qué tareas tengo con alta prioridad para hacer?');
  await page.keyboard.press('Enter');

  console.log('Pregunta enviada. Esperando respuesta...');
  await page.waitForTimeout(8000);

  // Screenshot final
  await page.screenshot({ path: 'playwright-demo-result.png', fullPage: false });
  console.log('Screenshot guardado: playwright-demo-result.png');

  await browser.close();
})();
