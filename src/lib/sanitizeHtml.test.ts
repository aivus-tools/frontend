import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('returns empty string for null/undefined/empty input', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
    expect(sanitizeHtml('')).toBe('');
  });

  it('keeps allowed formatting tags', () => {
    const input = '<h2>Title</h2><p>Hello <strong>world</strong></p>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('strips <script> tags', () => {
    const input = '<p>safe</p><script>alert(1)</script>';
    const out = sanitizeHtml(input);
    expect(out).toContain('safe');
    expect(out.toLowerCase()).not.toContain('<script');
  });

  it('strips inline event handlers', () => {
    const input = '<a href="https://example.com" onclick="alert(1)">click</a>';
    const out = sanitizeHtml(input);
    expect(out.toLowerCase()).not.toContain('onclick');
    expect(out).toContain('href="https://example.com"');
  });

  it('strips iframe and object', () => {
    expect(sanitizeHtml('<iframe src="x"></iframe>').toLowerCase()).not.toContain('iframe');
    expect(sanitizeHtml('<object data="x"></object>').toLowerCase()).not.toContain('<object');
  });

  it('strips javascript: hrefs', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out.toLowerCase()).not.toContain('javascript:');
  });

  it('strips data attributes', () => {
    const out = sanitizeHtml('<p data-secret="x">hi</p>');
    expect(out).not.toContain('data-secret');
    expect(out).toContain('hi');
  });

  it('keeps tables', () => {
    const input = '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr></tbody></table>';
    expect(sanitizeHtml(input)).toBe(input);
  });
});
