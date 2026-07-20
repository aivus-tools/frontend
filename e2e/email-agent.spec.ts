import { test, expect } from '@playwright/test';

// Authenticated vendor sweep of the Stage 3 Email agent section. Runs under the
// `chromium` project (storageState from auth.setup.ts) against a running stack
// with a seeded vendor. It exercises navigation and the empty-state surfaces, so
// it needs no seeded email data — the section renders for any vendor.

test.describe('Email agent section', () => {
  test('the section and its sub-navigation are reachable', async ({ page }) => {
    await page.goto('/app/email-agent');
    await expect(page).toHaveURL(/\/app\/email-agent/);
    await expect(page.getByText(/Conversations|Переписки/).first()).toBeVisible();
    await expect(page.getByText(/Follow-ups|Напоминания/).first()).toBeVisible();
    await expect(page.getByText(/Settings|Настройки/).first()).toBeVisible();
  });

  test('settings page shows the instruction field and mailbox panel', async ({ page }) => {
    await page.goto('/app/email-agent/settings');
    await expect(page).toHaveURL(/\/app\/email-agent\/settings/);
    await expect(
      page.getByPlaceholder(/Describe your business so the agent can speak for you|Опишите бизнес/)
    ).toBeVisible();
    await expect(page.getByText(/Connected mailboxes|Подключенные ящики/)).toBeVisible();
    await expect(page.getByText(/Monitoring inbox|Ящик для чтения/)).toBeVisible();
    await expect(page.getByText(/Sending mailbox|Ящик для отправки/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Save settings|Сохранить настройки/ })).toBeVisible();
  });

  test('follow-ups page shows the drafts and dashboard sections', async ({ page }) => {
    await page.goto('/app/email-agent/followups');
    await expect(page).toHaveURL(/\/app\/email-agent\/followups/);
    await expect(page.getByText(/Drafts to review|Черновики на проверку/)).toBeVisible();
    await expect(page.getByText(/Follow-ups|Напоминания/).first()).toBeVisible();
  });
});
