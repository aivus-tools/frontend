import { describe, it, expect } from 'vitest';
import { SignupFormSchema, PasswordSchema } from './definitions';

describe('Form Validation Schemas', () => {
  describe('SignupFormSchema', () => {
    it('should validate correct email', () => {
      const result = SignupFormSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
    });

    it('should validate various email formats', () => {
      const validEmails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.co.uk',
        'user123@test-domain.org',
      ];

      validEmails.forEach((email) => {
        const result = SignupFormSchema.safeParse({ email });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email format', () => {
      const result = SignupFormSchema.safeParse({ email: 'invalid-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBeDefined();
      }
    });

    it('should reject various invalid email formats', () => {
      const invalidEmails = [
        'plaintext',
        '@domain.com',
        'user@',
        'user @domain.com',
        'user@domain',
        '',
      ];

      invalidEmails.forEach((email) => {
        const result = SignupFormSchema.safeParse({ email });
        expect(result.success).toBe(false);
      });
    });

    it('should trim whitespace from email', () => {
      const result = SignupFormSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should reject email with only spaces', () => {
      const result = SignupFormSchema.safeParse({ email: '   ' });
      expect(result.success).toBe(false);
    });
  });

  describe('PasswordSchema', () => {
    it('should validate password with minimum 8 characters', () => {
      const result = PasswordSchema.safeParse({ password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('should validate exactly 8 character password', () => {
      const result = PasswordSchema.safeParse({ password: '12345678' });
      expect(result.success).toBe(true);
    });

    it('should reject password less than 8 characters', () => {
      const result = PasswordSchema.safeParse({ password: '1234567' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBeDefined();
      }
    });

    it('should reject various short passwords', () => {
      const shortPasswords = ['', '1', '12', '123', '1234', '12345', '123456', '1234567'];

      shortPasswords.forEach((password) => {
        const result = PasswordSchema.safeParse({ password });
        expect(result.success).toBe(false);
      });
    });

    it('should accept long passwords', () => {
      const longPasswords = [
        '12345678',
        '123456789',
        'a'.repeat(50),
        'VeryLongPasswordWith$pec!alCharacters123',
      ];

      longPasswords.forEach((password) => {
        const result = PasswordSchema.safeParse({ password });
        expect(result.success).toBe(true);
      });
    });

    it('should accept passwords with special characters', () => {
      const passwords = ['Pass@123', 'Test$ecure!', 'p@$$w0rd'];

      passwords.forEach((password) => {
        const result = PasswordSchema.safeParse({ password });
        expect(result.success).toBe(true);
      });
    });

    it('should accept passwords with spaces', () => {
      const result = PasswordSchema.safeParse({ password: 'pass word 123' });
      expect(result.success).toBe(true);
    });
  });
});
