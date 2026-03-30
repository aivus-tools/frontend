import { test, expect } from '@playwright/test';

test('auth page loads', async ({ browser }) => {
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();

  await page.goto('/auth');
  await expect(page.getByPlaceholder('Your email address')).toBeVisible();

  await context.close();
});

test('dashboard loads', async ({ page }) => {
  await page.goto('/app/dashboard');
  await expect(page).toHaveURL(/\/app\/dashboard/);
  await expect(page.locator('nav, [class*="sidebar"], [class*="Sidebar"], [class*="sider"], [class*="Sider"]').first()).toBeVisible();
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
