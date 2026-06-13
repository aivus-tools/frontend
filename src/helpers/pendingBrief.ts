const COOKIE_NAME = 'aivus_pending_brief';
const MAX_AGE = 3600;

export const setPendingBrief = (briefId: string, token: string): void => {
  const value = `${briefId}:${token}`;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)};path=/;max-age=${MAX_AGE};samesite=lax`;
};

export const getPendingBrief = (): { briefId: string; token: string } | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  if (!match) {
    return null;
  }
  const decoded = decodeURIComponent(match[1]);
  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) {
    return null;
  }
  return {
    briefId: decoded.slice(0, separatorIndex),
    token: decoded.slice(separatorIndex + 1),
  };
};

export const clearPendingBrief = (): void => {
  document.cookie = `${COOKIE_NAME}=;path=/;max-age=0`;
};

export const PENDING_BRIEF_COOKIE_NAME = COOKIE_NAME;

const SENT_BRIEFS_KEY = 'aivus_sent_briefs';

export const markBriefAsSent = (briefId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const stored = localStorage.getItem(SENT_BRIEFS_KEY);
    const sent: string[] = stored ? JSON.parse(stored) : [];
    if (!sent.includes(briefId)) {
      sent.push(briefId);
      localStorage.setItem(SENT_BRIEFS_KEY, JSON.stringify(sent));
    }
  } catch {
    // noop
  }
};

export const isBriefSent = (briefId: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const stored = localStorage.getItem(SENT_BRIEFS_KEY);
    if (!stored) {
      return false;
    }
    const sent: string[] = JSON.parse(stored);
    return sent.includes(briefId);
  } catch {
    return false;
  }
};

const DRAFT_BY_SLUG_KEY = 'aivus_draft_by_slug';

export const saveDraftForSlug = (slug: string, briefId: string, token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const stored = sessionStorage.getItem(DRAFT_BY_SLUG_KEY);
    const drafts: Record<string, { briefId: string; token: string }> = stored ? JSON.parse(stored) : {};
    drafts[slug] = { briefId, token };
    sessionStorage.setItem(DRAFT_BY_SLUG_KEY, JSON.stringify(drafts));
  } catch {
    // noop
  }
};

export const getDraftForSlug = (slug: string): { briefId: string; token: string } | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = sessionStorage.getItem(DRAFT_BY_SLUG_KEY);
    if (!stored) {
      return null;
    }
    const drafts: Record<string, { briefId: string; token: string }> = JSON.parse(stored);
    return drafts[slug] ?? null;
  } catch {
    return null;
  }
};

export const clearDraftForSlug = (slug: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const stored = sessionStorage.getItem(DRAFT_BY_SLUG_KEY);
    if (!stored) {
      return;
    }
    const drafts: Record<string, { briefId: string; token: string }> = JSON.parse(stored);
    delete drafts[slug];
    sessionStorage.setItem(DRAFT_BY_SLUG_KEY, JSON.stringify(drafts));
  } catch {
    // noop
  }
};

const RETURN_URL_KEY = 'aivus_auth_return_url';

export const setAuthReturnUrl = (url: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(RETURN_URL_KEY, url);
};

export const consumeAuthReturnUrl = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const nextFromQuery = params.get('next');
  if (nextFromQuery) {
    sessionStorage.removeItem(RETURN_URL_KEY);
    return nextFromQuery;
  }
  const value = sessionStorage.getItem(RETURN_URL_KEY);
  sessionStorage.removeItem(RETURN_URL_KEY);
  return value;
};
