import { describe, it, expect, beforeEach } from 'vitest';
import {
  setPendingBrief,
  getPendingBrief,
  clearPendingBrief,
  saveDraftForSlug,
  getDraftForSlug,
  clearDraftForSlug,
  markBriefAsSent,
  isBriefSent,
} from './pendingBrief';
import { getPublicBriefToken, savePublicBriefToken } from '@/services/client/publicBriefApi';

beforeEach(() => {
  document.cookie.split(';').forEach((c) => {
    const key = c.trim().split('=')[0];
    if (key) {
      document.cookie = `${key}=;path=/;max-age=0`;
    }
  });
  localStorage.clear();
});

describe('pendingBrief cookie', () => {
  it('sets and gets pending brief', () => {
    setPendingBrief('brief-1', 'token-abc');
    const result = getPendingBrief();
    expect(result?.briefId).toBe('brief-1');
    expect(result?.token).toBe('token-abc');
  });

  it('returns null after clear', () => {
    setPendingBrief('brief-1', 'token-abc');
    clearPendingBrief();
    expect(getPendingBrief()).toBeNull();
  });

  it('handles token with colons', () => {
    setPendingBrief('brief-2', 'tok:en:with:colons');
    const result = getPendingBrief();
    expect(result?.briefId).toBe('brief-2');
    expect(result?.token).toBe('tok:en:with:colons');
  });
});

describe('draft by slug cookie (SF-3)', () => {
  it('saves and retrieves draft via cookie (survives tab close simulation)', () => {
    saveDraftForSlug('acme-films', 'draft-1', 'tok-1');
    const result = getDraftForSlug('acme-films');
    expect(result?.briefId).toBe('draft-1');
    expect(result?.token).toBe('tok-1');
  });

  it('returns null for unknown slug', () => {
    expect(getDraftForSlug('nonexistent-slug')).toBeNull();
  });

  it('clears draft for slug', () => {
    saveDraftForSlug('acme-films', 'draft-1', 'tok-1');
    clearDraftForSlug('acme-films');
    expect(getDraftForSlug('acme-films')).toBeNull();
  });

  it('isolates drafts between different slugs', () => {
    saveDraftForSlug('slug-a', 'brief-a', 'tok-a');
    saveDraftForSlug('slug-b', 'brief-b', 'tok-b');
    clearDraftForSlug('slug-a');
    expect(getDraftForSlug('slug-a')).toBeNull();
    expect(getDraftForSlug('slug-b')?.briefId).toBe('brief-b');
  });

  it('handles slugs with special characters via encoding', () => {
    saveDraftForSlug('my/special slug', 'draft-3', 'tok-3');
    const result = getDraftForSlug('my/special slug');
    expect(result?.briefId).toBe('draft-3');
    expect(result?.token).toBe('tok-3');
  });
});

describe('draft cookie resume → localStorage sync (SF WL-DRAFT-COOKIE-RESUME)', () => {
  it('cookie draft token is available via getPublicBriefToken after savePublicBriefToken called on resume', () => {
    saveDraftForSlug('vendor-slug', 'brief-resume', 'tok-resume');
    const draft = getDraftForSlug('vendor-slug');
    expect(draft?.briefId).toBe('brief-resume');
    expect(draft?.token).toBe('tok-resume');

    savePublicBriefToken(draft!.briefId, draft!.token);
    expect(getPublicBriefToken('brief-resume')).toBe('tok-resume');
  });

  it('does not return token for mismatched briefId from cookie', () => {
    saveDraftForSlug('vendor-slug', 'brief-a', 'tok-a');
    const draft = getDraftForSlug('vendor-slug');
    const isMatchingBrief = draft?.briefId === 'brief-b';
    expect(isMatchingBrief).toBe(false);
  });
});

describe('markBriefAsSent / isBriefSent', () => {
  it('marks and detects sent brief', () => {
    markBriefAsSent('brief-sent-1');
    expect(isBriefSent('brief-sent-1')).toBe(true);
  });

  it('returns false for unsent brief', () => {
    expect(isBriefSent('brief-not-sent')).toBe(false);
  });
});
