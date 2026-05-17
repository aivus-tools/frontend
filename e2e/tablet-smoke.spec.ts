import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 768, height: 1024 },
  isMobile: true,
  hasTouch: true,
});

test('tablet portrait: dashboard renders as mobile (below 1024 threshold)', async ({ page }) => {
  await page.goto('/app/dashboard');
  await expect(page).toHaveURL(/\/app\/dashboard/);

  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(viewportWidth).toBeLessThan(1024);

  await expect(page.getByLabel('Open navigation')).toBeVisible();
});

test('tablet portrait: no horizontal scroll on rates page', async ({ page }) => {
  await page.goto('/app/rates');
  await expect(page).toHaveURL(/\/app\/rates/);

  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
});
