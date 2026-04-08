import { describe, it, expect } from 'vitest';
import { isDifferentUser } from './confirmEmail';

describe('isDifferentUser', () => {
  it('returns false when session is empty', () => {
    expect(isDifferentUser(null, 'a@b.c')).toBe(false);
    expect(isDifferentUser('', 'a@b.c')).toBe(false);
    expect(isDifferentUser(undefined, 'a@b.c')).toBe(false);
  });

  it('returns false when confirmed email is missing', () => {
    expect(isDifferentUser('a@b.c', null)).toBe(false);
    expect(isDifferentUser('a@b.c', '')).toBe(false);
    expect(isDifferentUser('a@b.c', undefined)).toBe(false);
    expect(isDifferentUser('a@b.c', 42)).toBe(false);
  });

  it('returns false when emails match exactly', () => {
    expect(isDifferentUser('a@b.c', 'a@b.c')).toBe(false);
  });

  it('returns false when emails differ only in case', () => {
    expect(isDifferentUser('A@B.C', 'a@b.c')).toBe(false);
    expect(isDifferentUser('user@example.com', 'USER@EXAMPLE.COM')).toBe(false);
  });

  it('returns true when emails are different accounts', () => {
    expect(isDifferentUser('a@b.c', 'd@e.f')).toBe(true);
    expect(isDifferentUser('alice@x.io', 'bob@x.io')).toBe(true);
  });
});
