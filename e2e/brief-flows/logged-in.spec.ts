import { test, expect } from '@playwright/test';
import {
  assistantBubbles,
  attachmentChips,
  fillStartScreen,
  finalizingHeading,
  readBriefTitle,
  sendChatAndWaitReply,
  signUpCtaText,
  submitChatMessage,
  submitStartScreen,
  userBubbles,
  waitForFinalPackage,
} from '../helpers/briefFlowV3';

const FIRST_PROMPT =
  'We are producing a 60-second product launch video for a B2B analytics platform, clean motion-graphics style, for the website hero and LinkedIn.';

// Logged-in client: /public-brief redirects to /app/brief/create and the flow is
// identical to the anonymous one, except there is no registration CTA — the brief
// auto-finalizes straight into "Assembling your final package...".
test.describe('Logged-in client brief', () => {
  test.use({ storageState: 'e2e/.auth/client.json' });

  test('redirect, chat and auto-finalize without registration', async ({ page }) => {
    test.setTimeout(720_000);

    // 1. A logged-in client visiting /public-brief is sent to /app/brief/create.
    await page.goto('/public-brief');
    await page.waitForURL(/\/app\/brief\/create(\?|$)/, { timeout: 20_000 });

    // 2. Same start screen + chat as the anonymous flow.
    await fillStartScreen(page, { prompt: FIRST_PROMPT, attach: true });
    await submitStartScreen(page, { prompt: FIRST_PROMPT });
    await expect(page).toHaveURL(/\/app\/brief\/[0-9a-f-]+/);

    await expect(userBubbles(page).filter({ hasText: 'B2B analytics platform' })).toBeVisible();
    await expect(attachmentChips(page).first()).toContainText('reference.txt');
    await expect(assistantBubbles(page).first()).toBeVisible();

    await sendChatAndWaitReply(page, 'make bugdet 45k usd');

    // 3. Completing the brief auto-finalizes (no sign-up CTA for a logged-in user).
    await submitChatMessage(page, 'fill all sections by your own and make sure brief is completely done');
    await expect(finalizingHeading(page)).toBeVisible({ timeout: 90_000 });
    await expect(signUpCtaText(page)).toBeHidden();

    // 4. Finalized cabinet with a generated title.
    await waitForFinalPackage(page);
    const title = await readBriefTitle(page);
    expect(title.toLowerCase()).not.toBe('untitled brief');
  });
});
