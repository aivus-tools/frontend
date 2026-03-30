import { test as setup, expect } from '@playwright/test';

const email = process.env.SMOKE_TEST_EMAIL!;
const password = process.env.SMOKE_TEST_PASSWORD!;

setup('authenticate', async ({ page }) => {
  await page.goto('/auth');

  await page.getByPlaceholder('Your email address').fill(email);
  await page.getByRole('button', { name: 'Next' }).click();

  const passwordInput = page.getByPlaceholder('Enter your password');
  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page).toHaveURL(/\/app/, { timeout: 15_000 });

  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
