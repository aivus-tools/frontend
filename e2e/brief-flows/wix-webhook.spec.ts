import { test, expect } from '@playwright/test';
import { assistantBubbles, messageInput, userBubbles } from '../helpers/briefFlowV3';
import { postWixBrief } from '../helpers/wix';

const WIX_PAYLOAD: Record<string, unknown> = {
  formName: 'My form',
  submissions: [{ label: 'First name', value: 'Jaime' }],
  'field:long_answer': 'Need a 60-second explainer video for our fintech app, animation, target Gen Z.',
  'field:initial_files': [
    {
      fileId: 'abc',
      displayName: 'brief.gif',
      url: 'https://static.wixstatic.com/media/4c8fbe_7c885c2c9fe0496eadfbc29a7854e3d9~mv2.gif',
      fileType: 'gif',
    },
  ],
  contact: {
    name: { first: 'Jamie', last: 'Brooks' },
    email: 'jamie@example.com',
  },
};

// The logged-in claim only succeeds when the brief's contact e-mail matches the
// signed-in account — claim rejects a mismatch with 403 (Brief belongs to a
// different email). Mirrors the account from client-auth.setup.ts.
const CLIENT_EMAIL = process.env.E2E_CLIENT_EMAIL ?? 'a@a.aa';

// Inbound Wix webhook: a brief is created server-side, the response hands back a
// public brief URL that opens straight into the seeded chat.
test.describe('Wix webhook brief', () => {
  test('webhook creates a brief reachable via its public URL', async ({ page }) => {
    test.setTimeout(300_000);

    // 1. The webhook returns the brief identifiers and a ready-to-open URL.
    const result = await postWixBrief(WIX_PAYLOAD);
    expect(result.briefId).toMatch(/[0-9a-f-]{36}/);
    expect(result.briefUrl).toMatch(/\/public-brief\/[0-9a-f-]+\?token=.+&taskId=.+/);

    // 2. Opening it lands on the public brief and resolves to the chat.
    await page.goto(result.briefUrl);
    await expect(messageInput(page)).toBeVisible({ timeout: 200_000 });

    // 3. The seeded first message, its attachment and the AI reply are present.
    await expect(userBubbles(page).filter({ hasText: '60-second explainer video' })).toBeVisible();
    await expect(page.getByText('brief.gif')).toBeVisible();
    await expect(assistantBubbles(page).first()).toBeVisible();
  });
});

// A logged-in client opening a Wix URL addressed to their e-mail is redirected
// through the claim page into their own cabinet (/app/brief/<id>) with the brief
// attached.
test.describe('Wix webhook brief — logged-in claim', () => {
  test.use({ storageState: 'e2e/.auth/client.json' });

  test('logged-in client opening the URL claims the brief into the cabinet', async ({ page }) => {
    test.setTimeout(300_000);

    const result = await postWixBrief({
      ...WIX_PAYLOAD,
      contact: { name: { first: 'Jamie', last: 'Brooks' }, email: CLIENT_EMAIL },
    });

    // /public-brief/<id>?token=... -> /app/brief/claim/<id> -> /app/brief/<id>.
    await page.goto(result.briefUrl);
    await page.waitForURL(/\/app\/brief\/[0-9a-f-]{36}(\?|$)/, { timeout: 30_000 });

    await expect(messageInput(page)).toBeVisible({ timeout: 200_000 });
    await expect(userBubbles(page).filter({ hasText: '60-second explainer video' })).toBeVisible();
    await expect(page.getByText('brief.gif')).toBeVisible();
    await expect(assistantBubbles(page).first()).toBeVisible();
  });
});
