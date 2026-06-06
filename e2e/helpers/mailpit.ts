const MAILPIT_URL = process.env.MAILPIT_URL ?? 'http://localhost:8025';

interface MailpitSummary {
  ID: string;
  Subject: string;
}

interface MailpitSearchResponse {
  messages: MailpitSummary[];
}

interface MailpitMessage {
  HTML: string;
  Text: string;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const clearMailpit = async (): Promise<void> => {
  await fetch(`${MAILPIT_URL}/api/v1/messages`, { method: 'DELETE' });
};

const searchByRecipient = async (email: string): Promise<MailpitSummary[]> => {
  const query = encodeURIComponent(`to:${email}`);
  const response = await fetch(`${MAILPIT_URL}/api/v1/search?query=${query}&limit=5`);
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as MailpitSearchResponse;
  return data.messages ?? [];
};

const messageBody = async (id: string): Promise<string> => {
  const response = await fetch(`${MAILPIT_URL}/api/v1/message/${id}`);
  const data = (await response.json()) as MailpitMessage;
  return `${data.HTML ?? ''}\n${data.Text ?? ''}`;
};

export const waitForConfirmationLinkViaMailpit = async (email: string, timeoutMs = 60_000): Promise<string> => {
  const deadline = Date.now() + timeoutMs;
  let lastState = 'no message yet';
  while (Date.now() < deadline) {
    const messages = await searchByRecipient(email);
    if (messages.length > 0) {
      const body = await messageBody(messages[0].ID);
      const match = body.match(/https?:\/\/[^\s"'<>)]*\/auth\/confirm-email\?token=[A-Za-z0-9_-]+/);
      if (match) {
        return match[0];
      }
      lastState = 'message found but confirm link missing';
    }
    await sleep(1_000);
  }
  throw new Error(`Confirmation email for ${email} not found within ${timeoutMs}ms (${lastState}).`);
};
