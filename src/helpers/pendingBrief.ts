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
  const value = sessionStorage.getItem(RETURN_URL_KEY);
  sessionStorage.removeItem(RETURN_URL_KEY);
  return value;
};
