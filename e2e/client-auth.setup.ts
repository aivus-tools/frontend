import { test as setup, expect } from '@playwright/test';

// Local-dev convenience defaults only — the throwaway CLIENT account a developer
// has in their local Docker DB. CI/staging override both via env
// (secrets.STAGING_CLIENT_EMAIL / STAGING_CLIENT_PASSWORD). No reachable
// (staging/prod) account must ever use these published credentials.
const email = process.env.E2E_CLIENT_EMAIL ?? 'a@a.aa';
const password = process.env.E2E_CLIENT_PASSWORD ?? 'iiiijjjj';

setup('authenticate client', async ({ page }) => {
  await page.goto('/auth');

  await page.getByPlaceholder('Your email address').fill(email);
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  const passwordInput = page.getByPlaceholder('Enter your password');
  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page).toHaveURL(/\/app(\/|$)/, { timeout: 20_000 });
  await page.context().storageState({ path: 'e2e/.auth/client.json' });
});
