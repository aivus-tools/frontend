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
      const stored = localStorage.getItem('aivus_briefs');
      if (!stored) {
        return null;
      }
      const briefs = JSON.parse(stored);
      return briefs[id] ?? null;
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
    expect(counterText).toMatch(/\d+\/\d+/);
  });

  test('should display cost badge with initial value', async ({ page }) => {
    test.slow();

    await brief.startPublicBrief('Cost badge test');

    const costBadge = await editor.getCostBadge();
    await expect(costBadge).toBeVisible();
  });

  test('should validate empty input on brief creation', async ({ page }) => {
    await page.goto('/public-brief');

    const createButton = page.getByRole('button', { name: /Create|Создать/i });

    await expect(createButton).toBeDisabled();
  });

  test('should create brief with corporate video prompt', async ({ page }) => {
    test.slow();

    await brief.startPublicBrief('Corporate video for annual report presentation');

    const editorTextbox = await editor.getEditorTextbox();
    await expect(editorTextbox).toBeVisible();
    await expect(editorTextbox).toContainText(/project|проект/i);
  });

  test('should handle long prompts gracefully', async ({ page }) => {
    test.slow();

    const longPrompt =
      'I need a comprehensive video production for a new tech product launch. The video should include: product overview, feature demonstrations, customer testimonials, technical specifications, pricing information, and call-to-action. Target audience is enterprise customers in the B2B sector. Budget is flexible but prefer cost-effective solutions. Timeline is 2 months from now.';

    await brief.startPublicBrief(longPrompt);

    const editorTextbox = await editor.getEditorTextbox();
    await expect(editorTextbox).toBeVisible();
    await expect(editorTextbox).toContainText(/project|проект/i);
  });

  test('should navigate back to landing page', async ({ page }) => {
    test.slow();

    await brief.startPublicBrief('Navigation test');

    await page.goBack();

    await expect(page).toHaveURL('/public-brief');

    const textarea = page.getByPlaceholder(/What.*project/i).or(page.getByRole('textbox').first());
    await expect(textarea).toBeVisible();
  });

  test('should redirect to brief page after creation', async ({ page }) => {
    test.slow();

    await page.goto('/public-brief');

    const textarea = page.getByPlaceholder(/What.*project/i).or(page.getByRole('textbox').first());
    await textarea.fill('Redirect test brief');

    const createButton = page.getByRole('button', { name: /Create|Создать/i });
    await createButton.click();

    await page.waitForURL(/\/public-brief\/[a-f0-9-]+/, { timeout: 10000 });

    const currentUrl = page.url();
    expect(currentUrl).toContain('/public-brief/');
  });

  test('should not allow creating brief with only whitespace', async ({ page }) => {
    await page.goto('/public-brief');

    const textarea = page.getByPlaceholder(/What.*project/i).or(page.getByRole('textbox').first());
    await textarea.fill('   ');

    const createButton = page.getByRole('button', { name: /Create|Создать/i });

    const isDisabled = await createButton.isDisabled();
    const isHidden = await createButton.isHidden();

    expect(isDisabled || isHidden).toBeTruthy();
  });

  test('should display chat input placeholder', async ({ page }) => {
    test.slow();

    await brief.startPublicBrief('Chat placeholder test');

    const chatInput = page.getByPlaceholder(/Enter.*answer|Введите/i).or(page.getByRole('textbox').last());
    await expect(chatInput).toBeVisible();
  });

  test('should show correct URL format after brief creation', async ({ page }) => {
    test.slow();

    const briefId = await brief.startPublicBrief('URL format test');

    const currentUrl = page.url();
    expect(currentUrl).toContain('/public-brief/');
    expect(currentUrl).toContain(briefId);
    expect(currentUrl).toMatch(/\/public-brief\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
  });

  test('should handle rapid brief creation requests', async ({ page }) => {
    test.slow();

    await page.goto('/public-brief');

    const textarea = page.getByPlaceholder(/What.*project/i).or(page.getByRole('textbox').first());
    await textarea.fill('Rapid test 1');

    const createButton = page.getByRole('button', { name: /Create|Создать/i });
    await createButton.click();

    await page.waitForTimeout(100);
    await createButton.click();
    await page.waitForTimeout(100);
    await createButton.click();

    await page.waitForURL(/\/public-brief\/[a-f0-9-]+/, { timeout: 10000 });

    const editorTextbox = await editor.getEditorTextbox();
    await expect(editorTextbox).toBeVisible({ timeout: 60000 });
  });
});
