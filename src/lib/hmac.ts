const HMAC_SECRET = process.env.HMAC_SECRET;

export async function createHmacSHA256(message: string) {
  const enc = new TextEncoder();
  const keyData = enc.encode(HMAC_SECRET);
  const msgData = enc.encode(message);

  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  // Convert to hex string
  const string = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return string;
}
