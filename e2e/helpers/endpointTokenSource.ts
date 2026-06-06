const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';
const FRONTEND_URL = process.env.SMOKE_TEST_URL ?? 'http://localhost:3000';
const SECRET = process.env.E2E_CONFIRMATION_TOKEN_SECRET ?? '';

interface TokenResponse {
  token: string;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Resolves the confirmation link via the hard-gated backend endpoint, for
// staging where the mailbox is real (Resend) and Mailpit is unavailable.
export const waitForConfirmationLinkViaEndpoint = async (email: string, timeoutMs = 60_000): Promise<string> => {
  const deadline = Date.now() + timeoutMs;
  const base = FRONTEND_URL.replace(/\/$/, '');
  let lastStatus = 0;
  while (Date.now() < deadline) {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/auth/e2e-confirmation-token?email=${encodeURIComponent(email)}`,
      { headers: { 'X-E2E-Token-Secret': SECRET } }
    );
    lastStatus = response.status;
    if (response.status === 200) {
      const data = (await response.json()) as TokenResponse;
      if (data.token) {
        return `${base}/auth/confirm-email?token=${data.token}`;
      }
    }
    if (response.status === 403 || response.status === 400) {
      throw new Error(`Confirmation token endpoint rejected the request (HTTP ${response.status}).`);
    }
    await sleep(1_000);
  }
  throw new Error(
    `Confirmation token endpoint returned no token for ${email} within ${timeoutMs}ms (last status ${lastStatus}). ` +
      'Is E2E_CONFIRMATION_TOKEN_ENABLED set on the target?'
  );
};
