import { Page, Locator, Request, expect } from '@playwright/test';

const REFERENCE_FILE_TEXT =
  'Reference notes for the video brief.\nBrand tone: energetic and modern.\nPreferred colors: deep blue and white.\nMust include a clear call to action at the end.';

const CHAT_RESPONSE_TIMEOUT = 150_000;
const GENERATION_TIMEOUT = 200_000;
const FINALIZE_TIMEOUT = 240_000;

const START_URL_RE = /\/briefs\/ai\/[^/]+\/start(\?|$)/;
const CHAT_URL_RE = /\/briefs\/ai\/[^/]+\/chat(\?|$)/;
const DRAFTS_URL_RE = /\/briefs\/ai\/drafts(\?|$)/;

export const referenceUpload = (name = 'reference.txt'): { name: string; mimeType: string; buffer: Buffer } => ({
  name,
  mimeType: 'text/plain',
  buffer: Buffer.from(REFERENCE_FILE_TEXT, 'utf-8'),
});

export const startHeading = (page: Page): Locator =>
  page.getByRole('heading', { name: 'Describe your video production project' });
export const startTextarea = (page: Page): Locator => page.getByPlaceholder(/We are launching a new energy drink/i);
export const startButton = (page: Page): Locator => page.getByRole('button', { name: 'Start brief', exact: true });
export const fileInput = (page: Page): Locator => page.locator('input[type="file"]');
export const generatingHeading = (page: Page): Locator => page.getByRole('heading', { name: 'Reading your brief...' });
export const finalizingHeading = (page: Page): Locator => page.getByText('Assembling your final package...');
export const loadingDocsHeading = (page: Page): Locator => page.getByText('Loading documents...');

export const messageInput = (page: Page): Locator => page.getByPlaceholder('Write a message...');
// antd prefixes the icon label, so the accessible name is "send Send".
export const sendButton = (page: Page): Locator => page.getByRole('button', { name: /Send$/ });
export const voiceButton = (page: Page): Locator => page.getByRole('button', { name: 'Record voice message' });
export const voiceCancelButton = (page: Page): Locator => page.getByRole('button', { name: 'Cancel', exact: true });
export const voiceStopButton = (page: Page): Locator => page.getByRole('button', { name: 'Stop and transcribe' });

export const assistantBubbles = (page: Page): Locator =>
  page.locator('[class*="messageBubble"]:not([class*="messageBubbleUser"])');
export const userBubbles = (page: Page): Locator => page.locator('[class*="messageBubbleUser"]');
export const attachmentChips = (page: Page): Locator => page.locator('[class*="attachmentChip"]');

export const signUpCtaText = (page: Page): Locator => page.getByText('Sign up to receive your brief package.');
export const signUpButton = (page: Page): Locator => page.getByRole('button', { name: 'Sign up', exact: true });

export const productionBriefTab = (page: Page): Locator =>
  page.getByRole('button', { name: 'Production Brief', exact: true });
export const vendorEmailTab = (page: Page): Locator => page.getByRole('button', { name: 'Vendor Email', exact: true });
export const documentBody = (page: Page): Locator => page.locator('.ProseMirror').first();
export const briefHeaderSlot = (page: Page): Locator => page.locator('#brief-header-slot');

interface StartBriefOptions {
  prompt: string;
  attach?: boolean;
  attachName?: string;
  expectGenerating?: boolean;
}

export const fillStartScreen = async (page: Page, options: StartBriefOptions): Promise<void> => {
  await expect(startHeading(page)).toBeVisible();
  await startTextarea(page).fill(options.prompt);

  if (options.attach) {
    const draftCreated = page.waitForResponse((x) => DRAFTS_URL_RE.test(x.url()) && x.request().method() === 'POST');
    await fileInput(page).setInputFiles(referenceUpload(options.attachName));
    await draftCreated;
    await expect(page.getByText(options.attachName ?? 'reference.txt')).toBeVisible();
  }
};

export const submitStartScreen = async (page: Page, options: StartBriefOptions): Promise<void> => {
  await expect(startButton(page)).toBeEnabled();
  const started = page.waitForResponse((x) => START_URL_RE.test(x.url()) && x.request().method() === 'POST', {
    timeout: 30_000,
  });
  await startButton(page).click();
  await started;

  if (options.expectGenerating !== false) {
    await expect(generatingHeading(page)).toBeVisible({ timeout: 15_000 });
  }
  await expect(messageInput(page)).toBeVisible({ timeout: GENERATION_TIMEOUT });
};

// Sends a chat message and resolves once the synchronous /chat POST returns,
// without asserting the bubble count. Use when the panel may immediately swap
// to the finalizing view (logged-in auto-finalize).
export const submitChatMessage = async (page: Page, text: string): Promise<void> => {
  await expect(messageInput(page)).toBeEnabled({ timeout: 30_000 });
  await messageInput(page).fill(text);
  await expect(sendButton(page)).toBeEnabled();

  const replied = page.waitForResponse((x) => CHAT_URL_RE.test(x.url()) && x.request().method() === 'POST', {
    timeout: CHAT_RESPONSE_TIMEOUT,
  });
  await sendButton(page).click();
  await replied;
};

export const sendChatAndWaitReply = async (page: Page, text: string): Promise<void> => {
  const before = await assistantBubbles(page).count();
  await expect(messageInput(page)).toBeEnabled({ timeout: 30_000 });
  await messageInput(page).fill(text);
  await expect(sendButton(page)).toBeEnabled();

  const replied = page.waitForResponse((x) => CHAT_URL_RE.test(x.url()) && x.request().method() === 'POST', {
    timeout: CHAT_RESPONSE_TIMEOUT,
  });
  await sendButton(page).click();
  await expect(userBubbles(page).filter({ hasText: text })).toBeVisible();
  await replied;
  await expect(assistantBubbles(page)).toHaveCount(before + 1, { timeout: 30_000 });
};

type VoiceStage = 'start' | 'chat';

export const assertVoiceButtonDoesNotSubmit = async (page: Page, stage: VoiceStage): Promise<void> => {
  const voice = voiceButton(page);
  await expect(voice).toBeVisible();
  await expect(voice).toBeEnabled();
  await expect(voice).toHaveAttribute('type', 'button');

  const notInsideForm = await voice.evaluate((el) => el.closest('form') === null);
  expect(notInsideForm).toBe(true);

  const submitUrlRe = stage === 'start' ? START_URL_RE : CHAT_URL_RE;
  let submitFired = false;
  const onRequest = (x: Request): void => {
    if (submitUrlRe.test(x.url()) && x.method() === 'POST') {
      submitFired = true;
    }
  };
  page.on('request', onRequest);

  const field = stage === 'start' ? startTextarea(page) : messageInput(page);
  const preserved = await field.inputValue();

  await voice.click();
  await expect(voiceStopButton(page)).toBeVisible({ timeout: 8_000 });
  await voiceCancelButton(page).click();
  await expect(voiceStopButton(page)).toBeHidden();

  page.off('request', onRequest);

  expect(submitFired, 'voice button must not trigger brief start/chat submit').toBe(false);
  await expect(field).toHaveValue(preserved);
  if (stage === 'start') {
    await expect(generatingHeading(page)).toBeHidden();
    await expect(startButton(page)).toBeVisible();
  }
};

export const waitForFinalPackage = async (page: Page): Promise<void> => {
  await expect(productionBriefTab(page)).toBeVisible({ timeout: FINALIZE_TIMEOUT });
  await expect(finalizingHeading(page)).toBeHidden();
  await expect(loadingDocsHeading(page)).toBeHidden({ timeout: 60_000 });
  await expect(documentBody(page)).not.toBeEmpty({ timeout: 30_000 });
};

export const readBriefTitle = async (page: Page): Promise<string> => {
  await expect(briefHeaderSlot(page)).toBeVisible({ timeout: 30_000 });
  const titleButton = briefHeaderSlot(page).getByRole('button').first();
  await expect(titleButton).toBeVisible();
  return (await titleButton.innerText()).trim();
};

export const readFinalPackageText = async (page: Page): Promise<string> => {
  await productionBriefTab(page).click();
  await expect(documentBody(page)).toBeVisible();
  const briefText = await documentBody(page).innerText();

  await vendorEmailTab(page).click();
  await expect(documentBody(page)).toBeVisible();
  const emailText = await documentBody(page).innerText();

  return `${briefText}\n${emailText}`;
};
