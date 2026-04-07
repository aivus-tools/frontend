import { test, expect } from '@playwright/test';
import { BriefHelper } from '../helpers/brief';
import { BriefEditorHelper } from '../helpers/editor';
import { AuthHelper } from '../helpers/auth';

test.describe('Authenticated Brief Flow', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  let brief: BriefHelper;
  let editor: BriefEditorHelper;
  let auth: AuthHelper;

  test.beforeEach(async ({ page }) => {
    brief = new BriefHelper(page);
    editor = new BriefEditorHelper(page);
    auth = new AuthHelper(page);
  });

  test('should create authenticated brief with AI generation', async ({ page }) => {
    test.slow();

    await brief.startAuthenticatedBrief('Need a 30-second product video for tech company');

    const editorTextbox = await editor.getEditorTextbox();
    await expect(editorTextbox).toBeVisible();
  });

  test('should display editable editor in authenticated brief', async ({ page }) => {
    test.slow();

    await brief.startAuthenticatedBrief('Editable editor test');

    await editor.expectEditorIsEditable();

    const toolbar = page.locator('[class*="Toolbar"] button, [class*="toolbar"] button').first();
    await expect(toolbar).toBeVisible();
  });

  test('should show message counter and limit', async ({ page }) => {
    test.slow();

    await brief.startAuthenticatedBrief('Message counter test');

    const messageCounter = page.locator('text=/\\d+\\/\\d+/');
    await expect(messageCounter).toBeVisible();

    const counterText = await messageCounter.textContent();
    expect(counterText).toMatch(/\d+\/\d+/);
  });

  test('should display cost badge', async ({ page }) => {
    test.slow();

    await brief.startAuthenticatedBrief('Cost badge test');

    const costBadge = await editor.getCostBadge();
    await expect(costBadge).toBeVisible();
  });

  test('should send AI chat messages', async ({ page }) => {
    test.slow();

    await brief.startAuthenticatedBrief('Chat test brief');

    await brief.sendChatMessage('Add more details about the target audience');

    await page.waitForTimeout(2000);

    const chatMessages = page.locator('[class*="Message"], [class*="message"]');
    await expect(chatMessages.last()).toBeVisible();
  });

  test('should allow navigation from dashboard to brief', async ({ page }) => {
    await page.goto('/app/dashboard');

    const briefCards = page.locator('[class*="card"]');
    const firstCard = briefCards.first();

    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();

    await page.waitForURL(/\/app\/brief\/[a-f0-9-]+/, { timeout: 5000 });

    const editorTextbox = await editor.getEditorTextbox();
    await expect(editorTextbox).toBeVisible();
  });

  test('should validate empty input on brief creation', async ({ page }) => {
    await page.goto('/app/brief/create-v2');

    const createButton = page
      .getByRole('main')
      .getByRole('button', { name: /Create|Создать/i })
      .last();

    await expect(createButton).toBeDisabled();
  });

  test('should not allow creating brief with only whitespace', async ({ page }) => {
    await page.goto('/app/brief/create-v2');

    const textarea = page.locator('textarea').first();
    await textarea.fill('   ');

    const createButton = page
      .getByRole('main')
      .getByRole('button', { name: /Create|Создать/i })
      .last();

    const isDisabled = await createButton.isDisabled();
    expect(isDisabled).toBeTruthy();
  });

  test('should maintain URL after brief creation', async ({ page }) => {
    test.slow();

    await brief.startAuthenticatedBrief('URL test');

    const currentUrl = page.url();
    expect(currentUrl).toContain('/app/brief/create-v2');

    const editorTextbox = await editor.getEditorTextbox();
    await expect(editorTextbox).toBeVisible();
  });

  test('should display chat input placeholder', async ({ page }) => {
    test.slow();

    await brief.startAuthenticatedBrief('Chat placeholder test');

    const chatInput = page.getByPlaceholder(/Enter.*answer|Введите/i).or(page.getByRole('textbox').last());
    await expect(chatInput).toBeVisible();
  });
});
