import { describe, it, expect, beforeEach } from 'vitest';
import { createHmacSHA256 } from './hmac';

describe('HMAC', () => {
  beforeEach(() => {
    // Ensure HMAC_SECRET is set for tests
    process.env.HMAC_SECRET = 'test-hmac-secret-key';
  });

  describe('createHmacSHA256', () => {
    it('should generate HMAC-SHA256 signature', async () => {
      const message = 'test-message';
      const signature = await createHmacSHA256(message);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA-256 hash is 64 hex characters
    });

    it('should generate consistent signatures for the same message', async () => {
      const message = 'test-message';
      const signature1 = await createHmacSHA256(message);
      const signature2 = await createHmacSHA256(message);

      expect(signature1).toBe(signature2);
    });

    it('should generate different signatures for different messages', async () => {
      const message1 = 'test-message-1';
      const message2 = 'test-message-2';

      const signature1 = await createHmacSHA256(message1);
      const signature2 = await createHmacSHA256(message2);

      expect(signature1).not.toBe(signature2);
    });

    it('should generate hex string (only 0-9 and a-f characters)', async () => {
      const message = 'test-message';
      const signature = await createHmacSHA256(message);

      expect(signature).toMatch(/^[0-9a-f]+$/);
    });

    it('should handle empty string', async () => {
      const signature = await createHmacSHA256('');

      expect(signature).toBeDefined();
      expect(signature.length).toBe(64);
    });

    it('should handle special characters', async () => {
      const message = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
      const signature = await createHmacSHA256(message);

      expect(signature).toBeDefined();
      expect(signature.length).toBe(64);
    });

    it('should handle JSON strings', async () => {
      const message = JSON.stringify({ foo: 'bar', nested: { key: 'value' } });
      const signature = await createHmacSHA256(message);

      expect(signature).toBeDefined();
      expect(signature.length).toBe(64);
    });
  });
});
