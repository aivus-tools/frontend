import { describe, it, expect } from 'vitest';
import { resolveClientIp } from './resolveClientIp';

describe('resolveClientIp', () => {
  it('returns rightmost non-empty entry from x-forwarded-for', () => {
    expect(resolveClientIp('1.1.1.1, 2.2.2.2, 3.3.3.3', null)).toBe('3.3.3.3');
  });

  it('returns single entry from x-forwarded-for', () => {
    expect(resolveClientIp('4.4.4.4', null)).toBe('4.4.4.4');
  });

  it('falls back to x-real-ip when xff is null', () => {
    expect(resolveClientIp(null, '5.5.5.5')).toBe('5.5.5.5');
  });

  it('returns empty string when both headers are null', () => {
    expect(resolveClientIp(null, null)).toBe('');
  });

  it('skips trailing empty comma segments and returns last non-empty', () => {
    expect(resolveClientIp('1.1.1.1, , ', null)).toBe('1.1.1.1');
  });

  it('falls back to x-real-ip when xff is empty string', () => {
    expect(resolveClientIp('', '9.9.9.9')).toBe('9.9.9.9');
  });
});
