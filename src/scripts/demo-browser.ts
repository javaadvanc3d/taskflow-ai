import { chromium } from 'playwright';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  // 1. Navigate to login
  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  // 2. Fill credentials and log in
  console.log('Filling credentials...');
  await page.fill('input[type="email"]', 'usuario-a@test.com');
  await page.fill('input[type="password"]', 'Usuario-a');
  await page.click('button[type="submit"]');

  // 3. Wait for dashboard
  console.log('Waiting for dashboard...');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 4. Click "Nueva Tarea" button (triggers dialog)
  console.log('Opening New Task dialog...');
  await page.click('button:has-text("Nueva Tarea")');
  await page.waitForSelector('[data-slot="dialog-content"]', { state: 'visible' });
  await page.waitForTimeout(500);

  // 5. Fill title using the id we set
  console.log('Filling title...');
  await page.fill('#task-title', 'Demo MCP en vivo');

  // 6. Set priority to High via Radix Select
  console.log('Setting priority to High...');
  await page.click('#task-priority');
  await page.waitForSelector('[data-slot="select-content"]', { state: 'visible' });
  await page.waitForTimeout(300);
  // ALTA = high
  await page.click('[data-slot="select-item"]:has-text("ALTA")');
  await page.waitForTimeout(400);

  // 7. Take screenshot of the filled form
  const formScreenshot = path.join(process.cwd(), 'form-screenshot.png');
  await page.screenshot({ path: formScreenshot, fullPage: false });
  console.log(`Form screenshot: ${formScreenshot}`);

  // 8. Submit
  console.log('Submitting...');
  await page.click('button:has-text("Crear tarea")');
  // Wait for dialog to close and page to revalidate
  await page.waitForSelector('[data-slot="dialog-content"]', { state: 'hidden', timeout: 8000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // 9. Final screenshot of dashboard with the new task
  const dashboardScreenshot = path.join(process.cwd(), 'dashboard-screenshot.png');
  await page.screenshot({ path: dashboardScreenshot, fullPage: false });
  console.log(`Dashboard screenshot saved: ${dashboardScreenshot}`);

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
