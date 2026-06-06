const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';
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
