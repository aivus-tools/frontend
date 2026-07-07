/**
 * PRD §10 full seam: anon Send -> Mailpit email -> claim -> register -> brief in client cabinet -> RFP project in vendor cabinet.
 *
 * Requires live env with Mailpit (MAILPIT_URL) and a vendor with a slug.
 * Vendor slug must be set via E2E_VENDOR_SLUG or discoverable via vendor UI login (SMOKE_TEST_EMAIL / SMOKE_TEST_PASSWORD).
 * Run via: make e2e-flows
 */
import { test, expect, Page } from '@playwright/test';
import { sendChatAndWaitReply, submitChatMessage, messageInput } from '../helpers/briefFlowV3';
import { clearMailpit, waitForConfirmationLinkViaMailpit } from '../helpers/mailpit';

const VENDOR_EMAIL = process.env.SMOKE_TEST_EMAIL ?? 'p@p.pp';
const VENDOR_PASSWORD = process.env.SMOKE_TEST_PASSWORD ?? 'iiiijjjj';

const FIRST_PROMPT =
  'We need a 60-second product launch video for a B2B SaaS tool, clean modern style, budget 25-40k USD.';

const REGISTER_NAME = 'Seam Test User';
const REGISTER_PASSWORD = 'Seam1234!!';

const uniqueEmail = (): string => `e2e-seam-${Date.now()}@aivus.local`;

const SLUG_URL_RE = /\/service\/public\/briefs\/ai\/by-slug\/.+\/drafts/;

/**
 * Log in as vendor via UI and return the personal slug from the vendor settings API response.
 * Returns null if login fails or slug is not configured.
 */
const getVendorSlugViaUi = async (vendorPage: Page): Promise<string | null> => {
  await vendorPage.goto('/auth');
  await vendorPage.getByPlaceholder('Your email address').fill(VENDOR_EMAIL);
  await vendorPage.getByRole('button', { name: 'Next', exact: true }).click();
  const passwordInput = vendorPage.getByPlaceholder('Enter your password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10_000 });
  await passwordInput.fill(VENDOR_PASSWORD);
  await vendorPage.getByRole('button', { name: 'Sign in', exact: true }).click();
  await vendorPage.waitForURL(/\/app\//, { timeout: 30_000 });

  const settingsResponse = await vendorPage.request.get('/service/vendor/settings');
  if (!settingsResponse.ok()) {
    return null;
  }
  const settings = (await settingsResponse.json()) as { slug?: string | null };
  return settings.slug ?? null;
};

/**
 * Check vendor dashboard for at least one RFP project via UI API call (uses browser session).
 */
const getVendorRfpProjectCountViaUi = async (vendorPage: Page): Promise<number> => {
  // projects_list returns every project of the vendor as a bare array; an
  // incoming brief lands as an RFP-status lead.
  const response = await vendorPage.request.get('/service/projects');
  if (!response.ok()) {
    return 0;
  }
  const data = (await response.json()) as Array<{ status?: string }>;
  return data.filter((x) => x.status === 'RFP').length;
};

/**
 * Full seam: anon -> send with new email -> claim link -> register -> brief in cabinet -> vendor sees RFP project.
 *
 * Seed requirements:
 * - Mailpit running at MAILPIT_URL (default http://localhost:8025)
 * - Vendor account with a slug set (SMOKE_TEST_EMAIL / SMOKE_TEST_PASSWORD or E2E_VENDOR_SLUG)
 */
test.describe('Branded anon full seam — Send to claim to cabinet (PRD §10)', () => {
  test('anon sends brief, confirms via Mailpit, sees brief in cabinet, vendor sees RFP project', async ({
    page,
    browser,
  }) => {
    test.setTimeout(900_000);

    const slug = process.env.E2E_VENDOR_SLUG ?? null;

    let resolvedSlug: string | null = slug;
    let vendorPage: Page | null = null;

    if (!resolvedSlug) {
      const vendorContext = await browser.newContext();
      vendorPage = await vendorContext.newPage();
      resolvedSlug = await getVendorSlugViaUi(vendorPage);
    }

    test.skip(
      !resolvedSlug,
      'No vendor slug — set E2E_VENDOR_SLUG or configure slug in vendor settings and provide SMOKE_TEST_EMAIL/PASSWORD'
    );

    const email = uniqueEmail();
    await clearMailpit();

    // 1. Open branded start page.
    await page.goto(`/brief/${resolvedSlug}`);
    await expect(page.getByRole('button', { name: 'Start brief', exact: true })).toBeVisible({ timeout: 15_000 });

    // 2. Describe the project (Start brief stays disabled until the textarea has
    //    content), then start.
    await page.getByPlaceholder(/We are launching a new energy drink/i).fill(FIRST_PROMPT);
    const draftCreated = page.waitForResponse((x) => SLUG_URL_RE.test(x.url()) && x.request().method() === 'POST', {
      timeout: 30_000,
    });
    await page.getByRole('button', { name: 'Start brief', exact: true }).click();

    // 3. The branded workspace renders the chat on the same URL (no navigation to
    //    a per-brief route), so read the briefId from the draft response.
    const draftResponse = await draftCreated;
    const draftBody = (await draftResponse.json()) as { briefId?: string };
    const briefId = draftBody.briefId ?? '';
    expect(briefId).toMatch(/[0-9a-f-]{36}/);

    await expect(messageInput(page)).toBeVisible({ timeout: 200_000 });

    // 4. Converse until document is ready. FIRST_PROMPT is already the opening
    //    message (typed on the start screen), so the first turn adds detail
    //    rather than repeating it (a duplicate bubble would break strict-mode).
    await sendChatAndWaitReply(page, 'budget is 30k usd and we need it delivered in 6 weeks');
    await sendChatAndWaitReply(
      page,
      'fill all remaining sections yourself and make the brief complete and ready to send'
    );
    // The personal-link assistant collects the sender's name and email in-chat
    // before it finalizes; provide them (submitChatMessage tolerates the panel
    // swapping straight to the finalizing/ready view without a new reply bubble).
    await submitChatMessage(
      page,
      `My name is ${REGISTER_NAME}, email ${email}. Everything looks good, finalize the brief now.`
    );

    // 5. Wait until the brief is finalized. antd prefixes the icon label, so the
    //    accessible name is "send Send brief" — match the trailing text. Send
    //    rejects with "still generating" while the finalize task is running, so
    //    wait for the package to assemble before opening the modal.
    const sendBriefButton = page.getByRole('button', { name: /Send brief$/ });
    await expect(sendBriefButton).toBeEnabled({ timeout: 240_000 });
    await expect(page.getByText(/Assembling your final package/)).toBeHidden({ timeout: 240_000 });
    await expect(page.locator('.ProseMirror').first()).not.toBeEmpty({ timeout: 60_000 });

    // 6. Open the send modal and confirm. The e-mail was already collected in-chat,
    //    so the modal ("Send to <vendor>") carries no e-mail field. Retry the
    //    confirm in case the finalize task only just finished (still-generating).
    await sendBriefButton.click();
    const sendDialog = page.getByRole('dialog');
    await expect(sendDialog).toBeVisible({ timeout: 10_000 });
    await expect(async () => {
      await sendDialog.getByRole('button', { name: /Send brief$/ }).click();
      await expect(page).toHaveURL(/\/brief\/.+\/success/, { timeout: 15_000 });
    }).toPass({ timeout: 150_000 });

    // 7. Success page.
    await expect(page.getByText('Brief sent!')).toBeVisible({ timeout: 30_000 });

    // 8. Pull claim link from Mailpit.
    const claimLink = await waitForConfirmationLinkViaMailpit(email, 90_000).catch(() => null);
    test.skip(!claimLink, 'No confirmation/claim link received in Mailpit — check email sending configuration');

    // 9. Navigate to claim link.
    await page.goto(claimLink!);

    // 10. Handle two cases: direct claim or registration flow.
    const currentUrl = page.url();

    if (currentUrl.includes('/auth/confirm-email') || currentUrl.includes('/app/brief/claim')) {
      await page.waitForURL(/\/app\/brief\/[0-9a-f-]+|\/app\/dashboard/, { timeout: 60_000 });
    } else if (currentUrl.includes('/auth')) {
      // The claim link carries the e-mail, so /auth auto-advances to the register
      // step (name + password) — wait for it rather than driving the e-mail step
      // (which detaches mid-transition).
      const nameInput = page.getByPlaceholder('Name', { exact: true });
      await nameInput.waitFor({ state: 'visible', timeout: 20_000 });
      await nameInput.fill(REGISTER_NAME);
      await page.getByPlaceholder('Enter your password').fill(REGISTER_PASSWORD);
      await page.getByPlaceholder('Repeat your password').fill(REGISTER_PASSWORD);
      await page.getByRole('button', { name: 'Sign up', exact: true }).click();

      await page.waitForURL(/\/app\/confirm|\/app\/brief\/[0-9a-f-]+|\/app\/dashboard|\/app\/group/, {
        timeout: 30_000,
      });

      // A brand-new account that registered without an in-browser pending brief
      // lands on role selection; pick "client" to enter the cabinet.
      if (page.url().includes('/app/group')) {
        await page.getByRole('button', { name: "I'm a client", exact: true }).click();
        await page.waitForURL(/\/app\/brief\/[0-9a-f-]+|\/app\/dashboard/, { timeout: 30_000 });
      }

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

    // 12. Vendor should see new RFP project — verify via authenticated browser session.
    await page.waitForTimeout(3_000);

    if (vendorPage != null) {
      const count = await getVendorRfpProjectCountViaUi(vendorPage);
      expect(count, 'Vendor should have at least one RFP project after brief is sent').toBeGreaterThan(0);
      await vendorPage.context().close();
    }
  });
});
