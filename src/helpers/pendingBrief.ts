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

const DRAFT_COOKIE_PREFIX = 'aivus_draft_';
const DRAFT_MAX_AGE = 3600;

const encodeDraftSlugKey = (slug: string): string => slug.replace(/[^a-zA-Z0-9_-]/g, '_');

export const saveDraftForSlug = (slug: string, briefId: string, token: string): void => {
  if (typeof document === 'undefined') {
    return;
  }
  const key = `${DRAFT_COOKIE_PREFIX}${encodeDraftSlugKey(slug)}`;
  const value = encodeURIComponent(`${briefId}:${token}`);
  document.cookie = `${key}=${value};path=/;max-age=${DRAFT_MAX_AGE};samesite=lax`;
};

export const getDraftForSlug = (slug: string): { briefId: string; token: string } | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const key = `${DRAFT_COOKIE_PREFIX}${encodeDraftSlugKey(slug)}`;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${key}=([^;]*)`));
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

export const clearDraftForSlug = (slug: string): void => {
  if (typeof document === 'undefined') {
    return;
  }
  const key = `${DRAFT_COOKIE_PREFIX}${encodeDraftSlugKey(slug)}`;
  document.cookie = `${key}=;path=/;max-age=0`;
};

const RETURN_URL_KEY = 'aivus_auth_return_url';

export const setAuthReturnUrl = (url: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(RETURN_URL_KEY, url);
};

const sanitizeReturnUrl = (value: string | null): string | null => {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null;
};

export const consumeAuthReturnUrl = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const nextFromQuery = params.get('next');
  if (nextFromQuery) {
    sessionStorage.removeItem(RETURN_URL_KEY);
    return sanitizeReturnUrl(nextFromQuery);
  }
  const value = sessionStorage.getItem(RETURN_URL_KEY);
  sessionStorage.removeItem(RETURN_URL_KEY);
  return sanitizeReturnUrl(value);
};
