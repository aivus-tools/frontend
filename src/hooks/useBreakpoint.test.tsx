import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useBreakpoint } from './useBreakpoint';

interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener: (event: string, listener: () => void) => void;
  removeEventListener: (event: string, listener: () => void) => void;
  dispatchChange: (matches: boolean) => void;
}

const ORIGINAL_MATCH_MEDIA = window.matchMedia;

const createFakeMediaQueryList = (initialMatches: boolean): FakeMediaQueryList => {
  const listeners = new Set<() => void>();
  const list: FakeMediaQueryList = {
    matches: initialMatches,
    media: '(max-width: 1023.98px)',
    addEventListener: (_event, listener) => {
      listeners.add(listener);
    },
    removeEventListener: (_event, listener) => {
      listeners.delete(listener);
    },
    dispatchChange: (matches) => {
      list.matches = matches;
      listeners.forEach((listener) => {
        listener();
      });
    },
  };
  return list;
};

describe('useBreakpoint', () => {
  let fakeList: FakeMediaQueryList;

  beforeEach(() => {
    fakeList = createFakeMediaQueryList(false);
    window.matchMedia = vi.fn().mockReturnValue(fakeList) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = ORIGINAL_MATCH_MEDIA;
  });

  it('reports desktop when media query does not match', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('reports mobile when media query matches initially', () => {
    fakeList = createFakeMediaQueryList(true);
    window.matchMedia = vi.fn().mockReturnValue(fakeList) as unknown as typeof window.matchMedia;
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('updates when the media query change event fires', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(false);
    act(() => {
      fakeList.dispatchChange(true);
    });
    expect(result.current.isMobile).toBe(true);
    act(() => {
      fakeList.dispatchChange(false);
    });
    expect(result.current.isMobile).toBe(false);
  });

  it('marks ready after mount', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.ready).toBe(true);
  });
});
