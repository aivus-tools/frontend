import { test, expect } from '@playwright/test';
import {
  assertVoiceButtonDoesNotSubmit,
  assistantBubbles,
  attachmentChips,
  fillStartScreen,
  sendChatAndWaitReply,
  signUpButton,
  signUpCtaText,
  submitStartScreen,
  userBubbles,
} from '../helpers/briefFlowV3';

const FIRST_PROMPT =
  'We are launching a new energy drink for gamers. Need a 30-second hero video for YouTube and two 9:16 social cutdowns. Rough budget 50-80k USD, delivery in two months.';

// Anonymous public brief: start screen -> generating -> chat -> ready-to-finalize CTA.
// Drives the live LLM, so the whole turn budget is generous.
test.describe('Public brief — anonymous creation', () => {
  test('start, chat and reach the sign-up call to action', async ({ page }) => {
    test.setTimeout(540_000);

    await page.goto('/public-brief');
    await expect(page).toHaveURL('/public-brief');

    // 1. Fill the first prompt and attach a reference file (creates the draft).
    await fillStartScreen(page, { prompt: FIRST_PROMPT, attach: true });

    // 2. Voice recorder on the start screen works but never submits the form.
    await assertVoiceButtonDoesNotSubmit(page, 'start');

    // 3. Submit -> "Reading your brief..." loader -> chat.
    await submitStartScreen(page, { prompt: FIRST_PROMPT });
    await expect(page).toHaveURL(/\/public-brief\/[0-9a-f-]+/);

    // 4. Chat shows the seeded user message, its attachment and the AI reply.
    await expect(userBubbles(page).filter({ hasText: 'energy drink for gamers' })).toBeVisible();
    await expect(attachmentChips(page).first()).toBeVisible();
    await expect(attachmentChips(page).first()).toContainText('reference.txt');
    await expect(assistantBubbles(page).first()).toBeVisible();

    // 5. Second user message -> AI reply.
    await sendChatAndWaitReply(page, 'make bugdet 45k usd');

    // 6. Voice recorder inside the chat composer also never submits the message.
    await assertVoiceButtonDoesNotSubmit(page, 'chat');

    // 7. Ask the assistant to complete the brief -> ready-to-finalize.
    await sendChatAndWaitReply(page, 'fill all sections by your own and make sure brief is completely done');

    // 8. Anonymous user is invited to register to receive the package.
    await expect(signUpCtaText(page)).toBeVisible({ timeout: 60_000 });
    await expect(signUpButton(page)).toBeVisible();
  });
});
