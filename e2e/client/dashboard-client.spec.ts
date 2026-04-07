import { test, expect } from '@playwright/test';
import { BriefHelper } from '../helpers/brief';

const TEST_USER_EMAIL = process.env.SMOKE_TEST_EMAIL || 'p@p.pp';
const TEST_USER_PASSWORD = process.env.SMOKE_TEST_PASSWORD || 'iiiijjjj';

test.describe('Client Dashboard', () => {
  let brief: BriefHelper;

  test.beforeEach(async ({ page }) => {
    brief = new BriefHelper(page);

    await page.goto('/auth');
    await page.getByPlaceholder('Your email address').fill(TEST_USER_EMAIL);
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    const passwordInput = page.getByPlaceholder('Enter your password');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL(/\/app/, { timeout: 15000 });
  });

  test('should display dashboard with sidebar', async ({ page }) => {
    await brief.navigateToDashboard();

    const sidebar = page.locator('nav, [class*="sidebar"], [class*="Sidebar"]').first();
    await expect(sidebar).toBeVisible();

    const dashboard = page.locator('main, [class*="content"]').first();
    await expect(dashboard).toBeVisible();
  });

  test('should show "Create Brief" button', async ({ page }) => {
    await brief.navigateToDashboard();

    const createButton = page.getByRole('button', { name: /Create.*brief|Создать.*бриф/i });
    await expect(createButton).toBeVisible();
  });

  test('should have navigation tabs', async ({ page }) => {
    await brief.navigateToDashboard();

    const briefTab = page.getByRole('button', { name: /Brief/i });
    const comparisonTab = page.getByRole('button', { name: /Comparison|Сравнение/i });

    await expect(briefTab).toBeVisible();
    await expect(comparisonTab).toBeVisible();
  });

  test('should filter briefs by status', async ({ page }) => {
    await brief.navigateToDashboard();

    const statusFilters = page.locator('text=/Черновики|Drafts/i, text=/Сбор|Collecting/i');
    const firstFilter = statusFilters.first();

    if (await firstFilter.isVisible()) {
      await firstFilter.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveURL(/\/app\/dashboard/);
    }
  });

  test('should display user menu', async ({ page }) => {
    await brief.navigateToDashboard();

    const userMenu = page.locator('[class*="user"], img[alt*="user"]').first();
    await expect(userMenu).toBeVisible();
  });

  test('should navigate to brief detail on click', async ({ page }) => {
    await brief.navigateToDashboard();

    await page.waitForTimeout(1000);

    const firstBrief = page
      .locator('[class*="brief"], [class*="card"], [class*="item"]')
      .filter({ hasText: /test|project/i })
      .first();

    if (await firstBrief.isVisible()) {
      await firstBrief.click();
      await page.waitForURL(/\/app\/brief\//, { timeout: 10000 });
      await expect(page).toHaveURL(/\/app\/brief\//);
    }
  });

  test('should show search functionality', async ({ page }) => {
    await brief.navigateToDashboard();

    const searchIcon = page.locator('img[alt="search"], [aria-label*="search"], text=/Поиск|Search/i').first();
    await expect(searchIcon).toBeVisible();
  });
});
