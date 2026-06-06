const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';
// Local-dev convenience default only — mirrors the local `.envs/.local/.django`
// value so `make e2e-flows` works out of the box. CI/staging override it via
// the WIX_WEBHOOK_SECRET env (secrets.STAGING_WIX_SECRET). A real environment's
// backend WIX_WEBHOOK_SECRET must NEVER be set to this published string.
const WIX_SECRET = process.env.WIX_WEBHOOK_SECRET ?? 'local-dev-wix-secret';

interface WixWebhookResponse {
  briefId: string;
  token: string;
  taskId: string;
  briefUrl: string;
}

export const postWixBrief = async (payload: Record<string, unknown>): Promise<WixWebhookResponse> => {
  const response = await fetch(`${BACKEND_URL}/api/v1/public/briefs/ai/from-wix`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Aivus-Webhook-Secret': WIX_SECRET,
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (response.status !== 201) {
    throw new Error(`Wix webhook expected 201, got ${response.status}: ${text}`);
  }
  return JSON.parse(text) as WixWebhookResponse;
};
