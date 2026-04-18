import { test, expect } from '@playwright/test';

/**
 * Smoke tests for the Brief AI v3 UI — cover navigation without driving the
 * LLM end-to-end. Full happy-path runs (start → chat → finalize → share) are
 * tracked manually because they depend on live Vertex/Gemini calls.
 */

test.describe('Brief v3 smoke', () => {
  test('public-brief start screen renders textarea + upload zone', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('/public-brief');
    await expect(page).toHaveURL('/public-brief');

    // Start textarea visible
    await expect(page.locator('textarea').first()).toBeVisible();

    // File upload zone
    await expect(page.getByText(/Attach references|Прикрепить референсы/i)).toBeVisible();

    // Start button
    await expect(page.getByRole('button', { name: /Start brief|Поехали/i })).toBeVisible();

    await context.close();
  });

  test('inactive share token shows not-found message', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('/shared-brief/definitely-not-a-real-token-xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    await expect(page.getByText(/This link is no longer active|Эта ссылка больше не активна/i)).toBeVisible({
      timeout: 10_000,
    });

    await context.close();
  });

  test('authenticated create-v2 renders start screen', async ({ page }) => {
    // Requires SMOKE_TEST_EMAIL/PASSWORD env vars for auth.setup.ts. When
    // unauthenticated, middleware redirects to /auth — skip the assertion
    // so the suite stays green locally without credentials.
    await page.goto('/app/brief/create-v2');
    if (page.url().includes('/auth')) {
      test.skip(true, 'auth storageState not populated (SMOKE_TEST_EMAIL/PASSWORD missing)');
      return;
    }

    // Start screen textarea + upload zone. Tabs appear only after first
    // message (stage=chat) — that requires a real LLM call and is out of
    // scope for the smoke suite.
    await expect(page.locator('textarea').first()).toBeVisible();
    await expect(page.getByText(/Attach references|Прикрепить референсы/i)).toBeVisible();
  });
});
