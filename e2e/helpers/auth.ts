import { Page, expect } from '@playwright/test';

export class AuthHelper {
  constructor(private readonly page: Page) {}

  async login(email: string, password: string): Promise<void> {
    await this.page.goto('/auth');

    const emailInput = this.page.getByPlaceholder('Your email address');
    await emailInput.fill(email);

    const nextButton = this.page.getByRole('button', { name: 'Next', exact: true });
    await nextButton.click();

    const passwordInput = this.page.getByPlaceholder('Enter your password');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);

    const signInButton = this.page.getByRole('button', { name: 'Sign in', exact: true });
    await signInButton.click();

    await expect(this.page).toHaveURL(/\/app/, { timeout: 15000 });
  }

  async logout(): Promise<void> {
    const userMenu = this.page.locator('[class*="userMenu"], [class*="UserMenu"]').first();
    await userMenu.click();

    const logoutButton = this.page.getByRole('button', { name: /Logout|Sign out|Выйти/i });
    await logoutButton.click();

    await expect(this.page).toHaveURL(/\/auth/, { timeout: 5000 });
  }

  async isLoggedIn(): Promise<boolean> {
    return this.page.url().includes('/app');
  }
}
