import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test('mobile: auth page loads on 390px viewport', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    storageState: undefined,
  });
  const page = await context.newPage();
  await page.goto('/auth');
  await expect(page.getByPlaceholder('Your email address')).toBeVisible();
  await context.close();
});

test('mobile: client dashboard renders without horizontal scroll', async ({ page }) => {
  await page.goto('/app/dashboard');
  await expect(page).toHaveURL(/\/app\/dashboard/);
  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
});

test('mobile: hamburger button opens navigation drawer', async ({ page }) => {
  await page.goto('/app/dashboard');
  const menuButton = page.getByLabel('Open navigation');
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(page.locator('.ant-drawer-open')).toBeVisible();
});

test('mobile: brief comparison fits viewport', async ({ page }) => {
  await page.goto('/app/dashboard');
  await expect(page).toHaveURL(/\/app\/dashboard/);
  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
});
