'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { MOBILE_MEDIA_QUERY } from '@/styles/breakpoints';

export interface BreakpointInfo {
  isMobile: boolean;
  isDesktop: boolean;
  ready: boolean;
}

const subscribe = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
  mediaQuery.addEventListener('change', callback);
  return () => {
    mediaQuery.removeEventListener('change', callback);
  };
};

const getSnapshot = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
};

const getServerSnapshot = (): boolean => false;

export const useBreakpoint = (): BreakpointInfo => {
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return {
    isMobile,
    isDesktop: !isMobile,
    ready,
  };
};
