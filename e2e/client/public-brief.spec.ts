import { test, expect } from '@playwright/test';
import { BriefHelper } from '../helpers/brief';
import { BriefEditorHelper } from '../helpers/editor';

test.describe('Public Brief Creation', () => {
  let brief: BriefHelper;
  let editor: BriefEditorHelper;

  test.beforeEach(async ({ page }) => {
    brief = new BriefHelper(page);
    editor = new BriefEditorHelper(page);
  });

  test('should create public brief with AI generation', async ({ page }) => {
    test.slow();

    const briefId = await brief.startPublicBrief('Need a 30-second video ad for a new product');

    expect(briefId).toMatch(/[a-f0-9-]{36}/);

    const editorTextbox = await editor.getEditorTextbox();
    await expect(editorTextbox).toBeVisible();
    await expect(editorTextbox).toContainText(/project|проект/i);
  });

  test('should handle AI chat interactions', async ({ page }) => {
    test.slow();

    await brief.startPublicBrief('Short 30 second ad');

    await brief.sendChatMessage('Budget is $10k');

    await brief.waitForChatResponse();

    await brief.expectChatMessageVisible('Budget is $10k');
  });

  test('should allow manual editing in public brief', async ({ page }) => {
    test.slow();

    await brief.startPublicBrief('Test brief for editing');

    const uniqueText = `PUBLIC-EDIT-${Date.now()}`;
    await editor.clickIntoSection('project_header');
    await editor.typeInCurrentSection(uniqueText);

    await page.waitForTimeout(700);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await editor.expectSectionContainsText('project_header', uniqueText);
  });

  test('should show registration banner when chat is complete', async ({ page }) => {
    test.slow();

    await brief.startPublicBrief('Quick test');

    await brief.sendChatMessage('No more questions');

    await page.waitForTimeout(2000);

    const registerBanner = page.locator('text=/Register|Зарегистрируйтесь/i');
    const registerButton = page.getByRole('button', { name: /Register|Зарегистрироваться/i });

    const isBannerVisible = await registerBanner.isVisible().catch(() => false);
    const isButtonVisible = await registerButton.isVisible().catch(() => false);

    expect(isBannerVisible || isButtonVisible).toBeTruthy();
  });

  test('should display read-only editor in public brief', async ({ page }) => {
    test.slow();

    await brief.startPublicBrief('Read-only test');

    const editorTextbox = await editor.getEditorTextbox();
    const contenteditable = await editorTextbox.getAttribute('contenteditable');

    expect(contenteditable).toBe('false');

    const toolbar = page.locator('[class*="Toolbar"] button, [class*="toolbar"] button');
    await expect(toolbar.first()).not.toBeVisible();
  });

  test('should persist public brief token in localStorage', async ({ page }) => {
    test.slow();

    const briefId = await brief.startPublicBrief('Token persistence test');

    const token = await page.evaluate((id) => {
      return localStorage.getItem(`public-brief-token-${id}`);
    }, briefId);

    expect(token).toBeTruthy();
    expect(token).toHaveLength(64);
  });

  test('should enforce message limit', async ({ page }) => {
    test.slow();

    await brief.startPublicBrief('Message limit test');

    const messageCounter = page.locator('text=/\\d+\\/\\d+/');
    await expect(messageCounter).toBeVisible();

    const counterText = await messageCounter.textContent();
    expect(counterText).toMatch(/\d+\/20/);
  });
});
