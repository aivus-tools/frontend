import { test, expect } from '@playwright/test';
import {
  fillStartScreen,
  readBriefTitle,
  readFinalPackageText,
  sendChatAndWaitReply,
  signUpButton,
  submitStartScreen,
  waitForFinalPackage,
} from '../helpers/briefFlowV3';

const FIRST_PROMPT =
  'We need a 45-second brand film for a sustainable coffee startup, warm documentary style, shot on location, for Instagram and the website.';
const REGISTER_NAME = 'Quentin Marsh';
const REGISTER_PASSWORD = 'iiiijjjj';

const uniqueEmail = (): string => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@aivus.local`;

// Full anonymous flow continued into registration, ending in the logged-in
// cabinet with the finalized brief package. E-mail confirmation is soft (no
// gate): registration claims the pending brief and the ready brief auto-finalizes.
test.describe('Public brief — registration and confirmation', () => {
  test('register from the sign-up CTA and receive the finalized package', async ({ page }) => {
    test.setTimeout(720_000);

    const email = uniqueEmail();

    // 1. Build a brief up to the ready-to-finalize sign-up CTA.
    await page.goto('/public-brief');
    await fillStartScreen(page, { prompt: FIRST_PROMPT, attach: true });
    await submitStartScreen(page, { prompt: FIRST_PROMPT });
    await sendChatAndWaitReply(page, 'make bugdet 45k usd');
    await sendChatAndWaitReply(page, 'fill all sections by your own and make sure brief is completely done');
    await expect(signUpButton(page)).toBeVisible({ timeout: 60_000 });

    // 2. Sign up -> auth screen -> registration form (new e-mail).
    await signUpButton(page).click();
    await page.waitForURL(/\/auth(\?|$)/);

    await page.getByPlaceholder('Your email address').fill(email);
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    const nameInput = page.getByPlaceholder('Name', { exact: true });
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill(REGISTER_NAME);
    await page.getByPlaceholder('Enter your password').fill(REGISTER_PASSWORD);
    await page.getByPlaceholder('Repeat your password').fill(REGISTER_PASSWORD);
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();

    // 3. Registration claims the pending brief and drops straight into the
    //    cabinet — e-mail confirmation is no longer a gate (soft confirmation).
    await page.waitForURL(/\/app\/brief\/[0-9a-f-]+/, { timeout: 30_000 });

    // 4. The claimed, ready brief auto-finalizes into the package
    //    ("Assembling your final package..." then the documents).
    await waitForFinalPackage(page);

    // 7. The brief got a generated title (not the "Untitled Brief" placeholder).
    const title = await readBriefTitle(page);
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).not.toBe('untitled brief');

    // 8. The registered name and e-mail surface in the generated documents.
    const packageText = (await readFinalPackageText(page)).toLowerCase();
    expect(packageText).toContain(email.toLowerCase());
    expect(packageText).toContain(REGISTER_NAME.toLowerCase());
  });
});
