import { describe, it, expect } from 'vitest';
import { priceFormat, priceParser, percentFormat, percentParser } from './format';

describe('priceFormat', () => {
  it('formats integer with commas', () => {
    expect(priceFormat!(1000, { userTyping: false, input: '' })).toBe('1,000');
  });

  it('formats large number', () => {
    expect(priceFormat!(1234567, { userTyping: false, input: '' })).toBe('1,234,567');
  });

  it('does not add commas for small numbers', () => {
    expect(priceFormat!(999, { userTyping: false, input: '' })).toBe('999');
  });

  it('formats zero', () => {
    expect(priceFormat!(0, { userTyping: false, input: '' })).toBe('0');
  });

  it('formats decimal number', () => {
    expect(priceFormat!(1234.56, { userTyping: false, input: '' })).toBe('1,234.56');
  });
});

describe('priceParser', () => {
  it('removes commas', () => {
    expect(String(priceParser!('1,234,567'))).toBe('1234567');
  });

  it('removes dollar sign and spaces', () => {
    expect(String(priceParser!('$1,000'))).toBe('1000');
  });

  it('handles plain number', () => {
    expect(String(priceParser!('500'))).toBe('500');
  });
});

describe('percentFormat', () => {
  it('appends percent sign', () => {
    expect(percentFormat!(10, { userTyping: false, input: '' })).toBe('10 %');
  });

  it('formats zero', () => {
    expect(percentFormat!(0, { userTyping: false, input: '' })).toBe('0 %');
  });
});

describe('percentParser', () => {
  it('removes percent suffix', () => {
    expect(String(percentParser!('10 %'))).toBe('10');
  });

  it('handles plain number', () => {
    expect(String(percentParser!('25'))).toBe('25');
  });
});
