import { test, expect } from '@playwright/test';

// Post-deploy smoke against production (SMOKE_TEST_URL). Public, no-auth checks
// only: verify the freshly deployed app serves its key public surfaces and that
// the Wix lead webhook is live and gated. Authenticated vendor flows
// (dashboard / rates / templates) depend on a maintained prod account and
// belong in the staging E2E suite — kept below as `.skip` until staging exists.

const WEBHOOK_API_URL = process.env.SMOKE_API_URL || 'https://api.aivus.co';
const WEBHOOK_PATH = '/api/v1/public/briefs/ai/from-webhook';

test('auth page loads', async ({ page }) => {
  await page.goto('/auth');
  await expect(page.getByPlaceholder(/Your email address|электронной почты/i)).toBeVisible();
});

test('public-brief start screen renders', async ({ page }) => {
  await page.goto('/public-brief');
  await expect(page).toHaveURL(/\/public-brief/);
  await expect(page.locator('textarea').first()).toBeVisible();
  await expect(page.getByText(/Attach references|Прикрепить/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Start brief|Поехали/i })).toBeVisible();
});

test('wix lead webhook is live and rejects a call without a key', async ({ request }) => {
  const response = await request.post(`${WEBHOOK_API_URL}${WEBHOOK_PATH}`, {
    data: { email: 'smoke@example.com', name: 'Smoke Test', message: 'smoke health check' },
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(401);
});

test.describe.skip('authenticated vendor pages (move to staging E2E)', () => {
  test('dashboard loads', async ({ page }) => {
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/app\/dashboard/);
    await expect(
      page.locator('nav, [class*="sidebar"], [class*="Sidebar"], [class*="sider"], [class*="Sider"]').first()
    ).toBeVisible();
  });

  test('rates page loads', async ({ page }) => {
    await page.goto('/app/rates');
    await expect(page).toHaveURL(/\/app\/rates/);
    await expect(page.locator('main, [class*="content"], [class*="Content"]').first()).toBeVisible();
  });

  test('templates page loads', async ({ page }) => {
    await page.goto('/app/templates');
    await expect(page).toHaveURL(/\/app\/templates/);
    await expect(page.locator('main, [class*="content"], [class*="Content"]').first()).toBeVisible();
  });
});
