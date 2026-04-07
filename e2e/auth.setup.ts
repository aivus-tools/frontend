import { test as setup, expect } from '@playwright/test';

const email = process.env.SMOKE_TEST_EMAIL;
const password = process.env.SMOKE_TEST_PASSWORD;

setup('authenticate', async ({ page }) => {
  setup.skip(!email || !password, 'SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD must be set');

  await page.goto('/auth');

  const emailInput = page
    .getByPlaceholder(/Your email address|Адрес.*электронной почты/i)
    .or(page.getByRole('textbox').first());
  await emailInput.fill(email!);

  const nextButton = page.getByRole('button', { name: /^(Next|Далее)$/i });
  await nextButton.click();

  const passwordInput = page
    .getByPlaceholder(/Enter.*password|Введите.*пароль/i)
    .or(page.getByRole('textbox', { name: /password/i }));
  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.fill(password!);

  const signInButton = page.getByRole('button', { name: /^(Sign in|Войти)$/i });
  await signInButton.click();

  await expect(page).toHaveURL(/\/app/, { timeout: 15_000 });

  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});
