import { test, expect } from '@playwright/test';
import { assistantBubbles, messageInput, sendChatAndWaitReply } from '../helpers/briefFlowV3';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';
const VENDOR_EMAIL = process.env.SMOKE_TEST_EMAIL ?? 'p@p.pp';
const VENDOR_PASSWORD = process.env.SMOKE_TEST_PASSWORD ?? 'iiiijjjj';

const FIRST_PROMPT =
  'We need a 90-second brand documentary for a fintech startup, cinematic style, for investor pitch and LinkedIn. Budget around 60k USD.';

const getVendorSlug = async (): Promise<string | null> => {
  const loginResponse = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: VENDOR_EMAIL, password: VENDOR_PASSWORD }),
  });
  if (!loginResponse.ok) {
    return null;
  }
  const loginData = (await loginResponse.json()) as { access?: string };
  if (!loginData.access) {
    return null;
  }
  const settingsResponse = await fetch(`${BACKEND_URL}/api/v1/vendor/settings`, {
    headers: { Authorization: `Bearer ${loginData.access}` },
  });
  if (!settingsResponse.ok) {
    return null;
  }
  const settings = (await settingsResponse.json()) as { slug?: string | null };
  return settings.slug ?? null;
};

const SLUG_DRAFT_URL_RE = /\/service\/public\/briefs\/ai\/by-slug\/.+\/drafts/;
const SEND_URL_RE = /\/service\/client\/briefs\/ai\/.+\/send/;

test.describe('Branded brief — logged-in client flow (SF-3)', () => {
  test.use({ storageState: 'e2e/.auth/client.json' });

  test('logged-in client opens branded page, chats, sends without email field, no resend', async ({ page }) => {
    test.setTimeout(720_000);

    const slug = process.env.E2E_VENDOR_SLUG ?? (await getVendorSlug());
    test.skip(!slug, 'No vendor slug — set E2E_VENDOR_SLUG or ensure vendor has a slug in settings');

    // 1. Logged-in client opens branded page — no redirect, stays on /brief/<slug>.
    await page.goto(`/brief/${slug}`);
    await expect(page.getByRole('button', { name: 'Start brief', exact: true })).toBeVisible({ timeout: 15_000 });

    // 2. Start brief — for a logged-in client this uses the by-slug draft endpoint
    //    (same as anon) but redirects to /brief/<slug>/<briefId>.
    const draftCreated = page.waitForResponse(
      (x) => SLUG_DRAFT_URL_RE.test(x.url()) && x.request().method() === 'POST',
      { timeout: 30_000 }
    );
    await page.getByRole('button', { name: 'Start brief', exact: true }).click();
    await draftCreated;

    await page.waitForURL(/\/brief\/.+\/.+/, { timeout: 20_000 });
    await expect(messageInput(page)).toBeVisible({ timeout: 200_000 });

    // 3. Chat until ready_to_finalize.
    await sendChatAndWaitReply(page, FIRST_PROMPT);
    await sendChatAndWaitReply(
      page,
      'fill all remaining sections yourself and make the brief complete and ready to send'
    );

    // 4. Send button must become enabled once document is ready.
    const sendBriefButton = page.getByRole('button', { name: 'Send brief', exact: true });
    await expect(sendBriefButton).toBeEnabled({ timeout: 240_000 });

    // 5. For a logged-in client, clicking Send opens a modal WITHOUT an email field
    //    (no email input needed — the account is already known).
    await sendBriefButton.click();
    const emailInput = page.getByLabel('Your email');
    await expect(emailInput).toBeHidden({ timeout: 5_000 });

    // 6. Submit — call goes to the client send endpoint.
    const sendRequest = page.waitForResponse((x) => SEND_URL_RE.test(x.url()) && x.request().method() === 'POST', {
      timeout: 30_000,
    });
    await page.getByRole('button', { name: 'Send brief', exact: true }).last().click();
    await sendRequest;

    // 7. Redirects to success page.
    await page.waitForURL(/\/brief\/.+\/success/, { timeout: 120_000 });
    await expect(page.getByText('Brief sent!')).toBeVisible({ timeout: 30_000 });

    // 8. No-resend: returning to the same brief disables the Send button.
    await page.goBack();
    await expect(page).toHaveURL(/\/brief\/.+\/.+/);
    await expect(assistantBubbles(page).first()).toBeVisible({ timeout: 30_000 });
    await expect(sendBriefButton).toBeDisabled({ timeout: 10_000 });
  });
});
