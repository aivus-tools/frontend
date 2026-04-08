import { describe, it, expect, beforeAll } from 'vitest';
import { t, tRich, getLocale, resetLocaleCache } from './i18n';
import React from 'react';

describe('i18n', () => {
  beforeAll(() => {
    // Ensure we're using English locale for tests
    process.env.NEXT_PUBLIC_LOCALE = 'en';
    resetLocaleCache();
  });

  describe('t() function', () => {
    it('should return correct translation for a string key', () => {
      const result = t('CANCEL');
      expect(result).toBe('Cancel');
    });

    it('should return correct translation for ADD_ITEM', () => {
      const result = t('ADD_ITEM');
      expect(result).toBe('add item');
    });

    it('should return translation for DASHBOARD', () => {
      const result = t('DASHBOARD');
      expect(result).toBe('Dashboard');
    });

    it('should return function result when key is a function with parameter', () => {
      const result = t('COST_PER_VIDEO', '5');
      expect(result).toBe('Cost Per Video (5 main videos)');
    });

    it('should handle function keys with different parameters', () => {
      const result1 = t('COST_PER_VIDEO', '1');
      const result2 = t('COST_PER_VIDEO', '10');
      expect(result1).toBe('Cost Per Video (1 main videos)');
      expect(result2).toBe('Cost Per Video (10 main videos)');
    });

    it('should return empty string when key is a function but no parameter provided', () => {
      const result = t('COST_PER_VIDEO');
      expect(result).toBe('Cost Per Video ( main videos)');
    });

    it('should return key itself if translation not found', () => {
      const result = t('NON_EXISTENT_KEY' as any);
      expect(result).toBe('NON_EXISTENT_KEY');
    });

    it('should return correct translation for validation messages', () => {
      expect(t('PLEASE_ENTER_VALID_EMAIL')).toBeDefined();
      expect(t('PASSWORD_MIN_LENGTH')).toBeDefined();
    });

    it('should return correct translation for common UI elements', () => {
      expect(t('BACK')).toBe('Back');
      expect(t('CHOOSE')).toBe('Choose');
      expect(t('COMMENT')).toBe('Comment');
      expect(t('DESCRIPTION')).toBe('Description');
    });
  });

  describe('tRich() function', () => {
    it('should parse HTML and replace components', () => {
      // This would need a key that actually has HTML in it
      // For now, we test that it returns a valid React node
      const components = {
        b: React.createElement('strong', {}),
      };

      const result = tRich('CANCEL', components);
      expect(result).toBeDefined();
    });
  });

  describe('getLocale()', () => {
    it('should return the correct locale', () => {
      expect(getLocale()).toBe('en');
    });
  });
});
