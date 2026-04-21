import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, '../../');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  try {
    // Step 1: Navigate to login page
    console.log('\nStep 1: Navigating to http://localhost:3000/login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    console.log('  ✓ Loaded login page:', page.url());

    // Step 2: Fill in email
    console.log('\nStep 2: Filling in email field...');
    await page.locator('input[type="email"]').fill('usuario-a@test.com');
    console.log('  ✓ Email filled: usuario-a@test.com');

    // Step 3: Fill in password
    console.log('\nStep 3: Filling in password field...');
    await page.locator('input[type="password"]').fill('Usuario-a');
    console.log('  ✓ Password filled');

    // Step 4: Click login button
    console.log('\nStep 4: Clicking login/submit button...');
    await page.locator('button[type="submit"]').click();
    console.log('  ✓ Clicked submit button');

    // Step 5: Wait for dashboard
    console.log('\nStep 5: Waiting for dashboard to load...');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    console.log('  ✓ Dashboard loaded:', page.url());

    await sleep(1000);
    await page.screenshot({ path: path.join(screenshotDir, 'step5-dashboard.png') });
    console.log('  ✓ Screenshot saved: step5-dashboard.png');

    // Step 6: Click "Nueva Tarea" button
    console.log('\nStep 6: Clicking Nueva Tarea button...');
    await page.locator('button:has-text("Nueva Tarea")').click();
    console.log('  ✓ Clicked Nueva Tarea button');

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await sleep(500);
    await page.screenshot({ path: path.join(screenshotDir, 'step6-dialog-open.png') });
    console.log('  ✓ Dialog opened. Screenshot saved: step6-dialog-open.png');

    // Step 7: Fill in task form
    console.log('\nStep 7: Filling in task form...');

    // Fill title - the dialog contains an Input with id="task-title"
    console.log('  Filling title...');
    await page.locator('#task-title').fill('Demo MCP usando Playwright');
    console.log('  ✓ Title filled: "Demo MCP usando Playwright"');

    // Fill priority - using Radix UI Select with id="task-priority"
    // The SelectTrigger has the id; we click it to open the dropdown
    console.log('  Setting priority to "high" (Alta)...');
    await page.locator('#task-priority').click();
    await sleep(500);

    // Now click the "ALTA" option in the dropdown (value="high")
    // Radix renders SelectItem with role="option" and data-value attribute
    const highOption = page.locator('[role="option"][data-value="high"], [role="option"]:has-text("ALTA"), [role="option"]:has-text("Alta")');
    await highOption.first().click();
    console.log('  ✓ Priority set to "high" (ALTA)');

    // Note: The form does NOT have a status field - tasks are created with status="todo" by default
    // The "En Proceso" status would need to be changed via drag-and-drop after creation
    console.log('  Note: The form only supports Title and Priority. Status defaults to "todo".');
    console.log('  The task will be created in the "Por Hacer" column.');

    await sleep(300);
    await page.screenshot({ path: path.join(screenshotDir, 'step7-form-filled.png') });
    console.log('  ✓ Form filled screenshot saved: step7-form-filled.png');

    // Step 8: Submit the form
    console.log('\nStep 8: Submitting the task form...');
    await page.locator('button:has-text("Crear tarea")').click();
    console.log('  ✓ Clicked "Crear tarea" button');

    // Wait for the dialog to close and task to be created
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await sleep(1000);

    await page.screenshot({ path: path.join(screenshotDir, 'step8-task-created.png') });
    console.log('  ✓ Task created. Screenshot saved: step8-task-created.png');
    console.log('  ✓ Dialog closed - task was created successfully');

    // Step 9: Find the chat interface in the sidebar
    console.log('\nStep 9: Verifying chat interface in sidebar...');
    // The chat is in the sidebar - look for the chat input
    const chatInput = page.locator('input[placeholder="Pregunta sobre tus tareas…"]');
    await chatInput.waitFor({ timeout: 5000 });
    console.log('  ✓ Found chat input in sidebar');

    // Step 10: Make sure Groq is selected as the model
    console.log('\nStep 10: Selecting Groq model...');
    const groqButton = page.locator('button:has-text("Groq")');
    await groqButton.click();
    console.log('  ✓ Clicked Groq model button');
    await sleep(300);

    // Verify Groq is selected (button should have orange background class)
    const groqBtnClass = await groqButton.getAttribute('class');
    console.log(`  ✓ Groq button class: ${groqBtnClass}`);

    await page.screenshot({ path: path.join(screenshotDir, 'step10-groq-selected.png') });
    console.log('  ✓ Screenshot saved: step10-groq-selected.png');

    // Step 11: Type in the chat
    console.log('\nStep 11: Typing chat message...');
    await chatInput.click();
    await chatInput.fill('Qué tareas tengo con alta prioridad para hacer?');
    console.log('  ✓ Typed: "Qué tareas tengo con alta prioridad para hacer?"');

    await page.screenshot({ path: path.join(screenshotDir, 'step11-chat-typed.png') });
    console.log('  ✓ Screenshot saved: step11-chat-typed.png');

    // Step 12: Send the message
    console.log('\nStep 12: Sending the chat message...');

    // Click the send button (violet submit button in the chat form)
    const sendButton = page.locator('button[type="submit"][class*="violet"]').last();
    await sendButton.click();
    console.log('  ✓ Clicked send button');

    // Wait for the AI response
    console.log('  Waiting for AI response (this may take a few seconds)...');
    // Wait for the loading dots to appear and then disappear
    await page.waitForSelector('.animate-bounce', { timeout: 10000 }).catch(() => {
      console.log('  (Loading animation not detected, continuing...)');
    });

    // Wait for loading to finish (animate-bounce disappears)
    await page.waitForFunction(
      () => !document.querySelector('.animate-bounce'),
      { timeout: 60000 }
    ).catch(() => {
      console.log('  (Timeout waiting for response, continuing...)');
    });

    await sleep(1000);

    // Step 13: Take final screenshot
    console.log('\nStep 13: Taking final screenshot...');
    await page.screenshot({ path: path.join(screenshotDir, 'step13-final-result.png') });
    console.log('  ✓ Final screenshot saved: step13-final-result.png');

    await page.screenshot({ path: path.join(screenshotDir, 'step13-final-fullpage.png'), fullPage: true });
    console.log('  ✓ Full-page screenshot saved: step13-final-fullpage.png');

    // Print the chat messages to verify
    const chatMessages = await page.locator('.flex.gap-2\\.5').all();
    console.log(`\n  Chat messages found: ${chatMessages.length}`);
    for (const msg of chatMessages) {
      const text = await msg.textContent();
      if (text?.trim()) {
        console.log(`  Message: "${text.trim().substring(0, 100)}${text.trim().length > 100 ? '...' : ''}"`);
      }
    }

    console.log('\n========================================');
    console.log('All steps completed successfully!');
    console.log('Screenshots saved in:', screenshotDir);

  } catch (error) {
    console.error('\nError occurred:', error.message);

    // Take debug screenshot on error
    try {
      await page.screenshot({ path: path.join(screenshotDir, 'error-debug.png'), fullPage: true });
      console.log('  Debug screenshot saved: error-debug.png');

      // Print current page content for debugging
      const url = page.url();
      console.log('  Current URL:', url);

      const bodyText = await page.locator('body').innerText().catch(() => 'Could not get body text');
      console.log('  Page text (first 500 chars):', bodyText.substring(0, 500));
    } catch (e) {
      console.error('Could not take debug screenshot:', e.message);
    }

    throw error;
  } finally {
    await browser.close();
    console.log('\nBrowser closed.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
