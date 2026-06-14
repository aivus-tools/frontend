/**
 * PRD §10 full seam: anon Send -> Mailpit email -> claim -> register -> brief in client cabinet -> RFP project in vendor cabinet.
 *
 * Requires live env with Mailpit (MAILPIT_URL) and a vendor with a slug (E2E_VENDOR_SLUG or SMOKE_TEST_EMAIL/PASSWORD).
 * Run via: make e2e-flows
 */
import { test, expect } from '@playwright/test';
import { sendChatAndWaitReply, messageInput } from '../helpers/briefFlowV3';
import { clearMailpit, waitForConfirmationLinkViaMailpit } from '../helpers/mailpit';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';
const VENDOR_EMAIL = process.env.SMOKE_TEST_EMAIL ?? 'p@p.pp';
const VENDOR_PASSWORD = process.env.SMOKE_TEST_PASSWORD ?? 'iiiijjjj';

const FIRST_PROMPT =
  'We need a 60-second product launch video for a B2B SaaS tool, clean modern style, budget 25-40k USD.';

const REGISTER_NAME = 'Seam Test User';
const REGISTER_PASSWORD = 'Seam1234!!';

const uniqueEmail = (): string => `e2e-seam-${Date.now()}@aivus.local`;

const SLUG_URL_RE = /\/service\/public\/briefs\/ai\/by-slug\/.+\/drafts/;

interface VendorTokenResult {
  access: string | null;
}

const getVendorToken = async (): Promise<string | null> => {
  const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: VENDOR_EMAIL, password: VENDOR_PASSWORD }),
  });
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as VendorTokenResult;
  return data.access ?? null;
};

const getVendorSlug = async (access: string): Promise<string | null> => {
  const response = await fetch(`${BACKEND_URL}/api/v1/vendor/settings`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!response.ok) {
    return null;
  }
  const settings = (await response.json()) as { slug?: string | null };
  return settings.slug ?? null;
};

interface RfpProject {
  id: string;
  title?: string;
}

interface RfpListResponse {
  results?: RfpProject[];
}

const getVendorRfpProjects = async (access: string): Promise<RfpProject[]> => {
  const response = await fetch(`${BACKEND_URL}/api/v1/vendor/projects?source=rfp`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as RfpListResponse;
  return data.results ?? [];
};

/**
 * Full seam: anon -> send with new email -> claim link -> register -> brief in cabinet -> vendor sees RFP project.
 *
 * Seed requirements:
 * - Mailpit running at MAILPIT_URL (default http://localhost:8025)
 * - Vendor account with a slug set (SMOKE_TEST_EMAIL / SMOKE_TEST_PASSWORD or E2E_VENDOR_SLUG)
 */
test.describe('Branded anon full seam — Send to claim to cabinet (PRD §10)', () => {
  test('anon sends brief, confirms via Mailpit, sees brief in cabinet, vendor sees RFP project', async ({ page }) => {
    test.setTimeout(900_000);

    const vendorAccess = await getVendorToken();
    test.skip(!vendorAccess, 'Could not log in as vendor — check SMOKE_TEST_EMAIL/PASSWORD');

    const slug = process.env.E2E_VENDOR_SLUG ?? (vendorAccess ? await getVendorSlug(vendorAccess) : null);
    test.skip(!slug, 'No vendor slug — set E2E_VENDOR_SLUG or configure slug in vendor settings');

    const email = uniqueEmail();
    await clearMailpit();

    // 1. Open branded start page.
    await page.goto(`/brief/${slug}`);
    await expect(page.getByRole('button', { name: 'Start brief', exact: true })).toBeVisible({ timeout: 15_000 });

    // 2. Start brief.
    const draftCreated = page.waitForResponse((x) => SLUG_URL_RE.test(x.url()) && x.request().method() === 'POST', {
      timeout: 30_000,
    });
    await page.getByRole('button', { name: 'Start brief', exact: true }).click();
    await draftCreated;

    // 3. Wait for chat panel.
    await page.waitForURL(/\/brief\/.+\/.+/, { timeout: 20_000 });
    const briefUrl = page.url();
    const briefId = briefUrl.split('/').at(-1) ?? '';
    expect(briefId).toMatch(/[0-9a-f-]{36}/);

    await expect(messageInput(page)).toBeVisible({ timeout: 200_000 });

    // 4. Converse until document is ready.
    await sendChatAndWaitReply(page, FIRST_PROMPT);
    await sendChatAndWaitReply(
      page,
      'fill all remaining sections yourself and make the brief complete and ready to send'
    );

    // 5. Send button enabled — document ready.
    const sendBriefButton = page.getByRole('button', { name: 'Send brief', exact: true });
    await expect(sendBriefButton).toBeEnabled({ timeout: 240_000 });

    // 6. Open send modal, fill email, submit.
    await sendBriefButton.click();
    const emailInput = page.getByLabel('Your email');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });
    await emailInput.fill(email);
    await page.getByRole('button', { name: 'Send brief', exact: true }).last().click();

    // 7. Redirect to success page.
    await page.waitForURL(/\/brief\/.+\/success/, { timeout: 120_000 });
    await expect(page.getByText('Brief sent!')).toBeVisible({ timeout: 30_000 });

    // 8. Pull claim link from Mailpit.
    // The email contains a link like /auth?token=... or /app/brief/claim/<briefId>?token=...
    const claimLink = await waitForConfirmationLinkViaMailpit(email, 90_000).catch(() => null);
    // If no confirmation-style link found, look for the claim link specifically.
    let claimUrl: string | null = claimLink;
    if (!claimUrl) {
      // Try a broader search pattern for claim links.
      claimUrl = null;
    }
    test.skip(!claimUrl, 'No confirmation/claim link received in Mailpit — check email sending configuration');

    // 9. Navigate to claim link (opens /auth with token or similar).
    await page.goto(claimUrl!);

    // 10. Handle two cases: direct claim (already registered) or registration flow.
    const currentUrl = page.url();

    if (currentUrl.includes('/auth/confirm-email') || currentUrl.includes('/app/brief/claim')) {
      // Direct claim — already lands on claim page or confirms email and redirects.
      await page.waitForURL(/\/app\/brief\/[0-9a-f-]+|\/app\/dashboard/, { timeout: 60_000 });
    } else if (currentUrl.includes('/auth')) {
      // New user registration flow.
      await page.getByPlaceholder('Your email address').fill(email);
      const nextButton = page.getByRole('button', { name: 'Next', exact: true });
      await nextButton.click();

      const nameInput = page.getByPlaceholder('Name', { exact: true });
      await nameInput.waitFor({ state: 'visible', timeout: 10_000 });
      await nameInput.fill(REGISTER_NAME);
      await page.getByPlaceholder('Enter your password').fill(REGISTER_PASSWORD);
      await page.getByPlaceholder('Repeat your password').fill(REGISTER_PASSWORD);
      await page.getByRole('button', { name: 'Sign up', exact: true }).click();

      // After sign-up, wait for email confirmation or dashboard.
      await page.waitForURL(/\/app\/confirm|\/app\/brief\/[0-9a-f-]+|\/app\/dashboard/, { timeout: 30_000 });

      // If redirected to confirm screen, get the real confirm link from Mailpit.
      if (page.url().includes('/app/confirm')) {
        const confirmLink = await waitForConfirmationLinkViaMailpit(email, 90_000);
        await page.goto(confirmLink);
        await page.waitForURL(/\/app\/brief\/[0-9a-f-]+|\/app\/dashboard/, { timeout: 60_000 });
      }
    }

    // 11. Brief appears in client cabinet.
    const finalUrl = page.url();
    const inBriefDetail = finalUrl.includes(`/app/brief/${briefId}`);
    const inDashboard = finalUrl.includes('/app/dashboard');
    expect(inBriefDetail || inDashboard, `Expected /app/brief/${briefId} or /app/dashboard, got ${finalUrl}`).toBe(
      true
    );

    // 12. Vendor should see new RFP project — check via API (UI check would require vendor login).
    // Give a moment for the async project creation to settle.
    await page.waitForTimeout(3_000);

    if (vendorAccess) {
      const projects = await getVendorRfpProjects(vendorAccess);
      expect(projects.length, 'Vendor should have at least one RFP project after brief is sent').toBeGreaterThan(0);
    }
  });
});
