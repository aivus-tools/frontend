import { test, expect } from '@playwright/test';
import { BriefEditorHelper } from '../helpers/editor';

const TEST_USER_EMAIL = process.env.SMOKE_TEST_EMAIL || 'p@p.pp';
const TEST_USER_PASSWORD = process.env.SMOKE_TEST_PASSWORD || 'iiiijjjj';
const TEST_BRIEF_ID = 'ff42ed28-a12b-41de-aaa7-007a1c441598';

test.describe('Brief Editor', () => {
  let editor: BriefEditorHelper;

  test.beforeEach(async ({ page }) => {
    editor = new BriefEditorHelper(page);

    await page.goto('/auth');
    await page.getByPlaceholder('Your email address').fill(TEST_USER_EMAIL);
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    const passwordInput = page.getByPlaceholder('Enter your password');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL(/\/app/, { timeout: 15000 });

    await page.goto(`/app/brief/${TEST_BRIEF_ID}`);
    await expect(page).toHaveURL(`/app/brief/${TEST_BRIEF_ID}`);
    await page.waitForLoadState('networkidle');
  });

  test('should persist manual edits after page reload', async ({ page }) => {
    const uniqueText = `EDIT-TEST-${Date.now()}`;

    await editor.clickIntoSection('project_header');
    await editor.typeInCurrentSection(uniqueText);

    await editor.waitForSaveRequest();
    await page.waitForTimeout(700);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await editor.expectSectionContainsText('project_header', uniqueText);
  });

  test('should handle rapid section switching with immediate flush', async ({ page }) => {
    const text1 = `SECTION1-${Date.now()}`;
    const text2 = `SECTION2-${Date.now()}`;

    await editor.clickIntoSection('project_header');
    await editor.typeInCurrentSection(text1);

    await page.waitForTimeout(200);

    await editor.clickIntoSection('deliverables');
    await editor.typeInCurrentSection(text2);

    await page.waitForTimeout(1000);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await editor.expectSectionContainsText('project_header', text1);
    await editor.expectSectionContainsText('deliverables', text2);
  });

  test('should save pending changes on unmount', async ({ page }) => {
    const uniqueText = `UNMOUNT-${Date.now()}`;

    await editor.clickIntoSection('budget_timeline');
    await editor.typeInCurrentSection(uniqueText);

    await page.waitForTimeout(200);

    await page.goto('/app/dashboard');
    await expect(page).toHaveURL('/app/dashboard');

    await page.waitForTimeout(500);

    await page.goto(`/app/brief/${TEST_BRIEF_ID}`);
    await page.waitForLoadState('networkidle');

    await editor.expectSectionContainsText('budget_timeline', uniqueText);
  });

  test('should handle multiple edits in same section', async ({ page }) => {
    const text1 = 'FIRST';
    const text2 = 'SECOND';

    await editor.clickIntoSection('strategic_foundation');
    await editor.typeInCurrentSection(text1);

    await page.waitForTimeout(300);

    await editor.typeInCurrentSection(text2);

    await editor.waitForSaveRequest();
    await page.waitForTimeout(700);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await editor.expectSectionContainsText('strategic_foundation', text1);
    await editor.expectSectionContainsText('strategic_foundation', text2);
  });

  test('should display cost badge', async ({ page }) => {
    const costBadge = await editor.getCostBadge();
    await expect(costBadge).toBeVisible();
  });

  test('should have toolbar visible for editable brief', async () => {
    await editor.expectEditorIsEditable();
    const toolbar = await editor.getAllToolbarButtons();
    await expect(toolbar).toBeVisible();
  });
});
