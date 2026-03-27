import { describe, it, expect } from 'vitest';
import { applyPercentage, round, formatCurrency } from './utils';

describe('utils', () => {
  describe('applyPercentage', () => {
    it('should calculate percentage of a value correctly', () => {
      expect(applyPercentage(100, 10)).toBe(10);
      expect(applyPercentage(200, 50)).toBe(100);
      expect(applyPercentage(1000, 15)).toBe(150);
    });

    it('should handle zero percentage', () => {
      expect(applyPercentage(100, 0)).toBe(0);
    });

    it('should handle zero value', () => {
      expect(applyPercentage(0, 50)).toBe(0);
    });

    it('should handle decimal percentages', () => {
      expect(applyPercentage(100, 12.5)).toBe(12.5);
      expect(applyPercentage(200, 7.25)).toBeCloseTo(14.5, 2);
    });

    it('should handle percentage over 100', () => {
      expect(applyPercentage(100, 150)).toBe(150);
      expect(applyPercentage(50, 200)).toBe(100);
    });

    it('should handle negative values', () => {
      expect(applyPercentage(-100, 10)).toBe(-10);
      expect(applyPercentage(100, -10)).toBe(-10);
    });
  });

  describe('round', () => {
    it('should round to 2 decimal places', () => {
      expect(round(1.234)).toBe(1.23);
      expect(round(1.235)).toBe(1.24);
      expect(round(1.999)).toBe(2);
    });

    it('should handle whole numbers', () => {
      expect(round(5)).toBe(5);
      expect(round(100)).toBe(100);
    });

    it('should handle zero', () => {
      expect(round(0)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(round(-1.234)).toBe(-1.23);
      expect(round(-1.235)).toBe(-1.24);
    });

    it('should handle very small numbers', () => {
      expect(round(0.001)).toBe(0);
      expect(round(0.005)).toBe(0.01);
    });

    it('should handle numbers with many decimals', () => {
      expect(round(3.14159265359)).toBe(3.14);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle decimal values', () => {
      expect(formatCurrency(99.99)).toBe('$99.99');
      expect(formatCurrency(0.50)).toBe('$0.50');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(999999.99)).toBe('$999,999.99');
    });

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(1.234)).toBe('$1.23');
      expect(formatCurrency(1.235)).toBe('$1.24');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('should always show 2 decimal places', () => {
      expect(formatCurrency(100)).toContain('.00');
      expect(formatCurrency(100.5)).toBe('$100.50');
    });
  });
});
