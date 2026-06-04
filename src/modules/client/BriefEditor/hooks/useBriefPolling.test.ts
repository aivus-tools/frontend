import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { BriefV3TaskStatus } from '@/types/briefAi.interface';

let authResponse: BriefV3TaskStatus;
let authShouldThrow = false;
const authTrigger = vi.fn(() => ({
  unwrap: () => (authShouldThrow ? Promise.reject(new Error('net')) : Promise.resolve(authResponse)),
}));

vi.mock('../constants', () => ({
  POLL_INTERVAL_MS: 20,
  POLL_TIMEOUT_MS: 120,
}));

const publicTrigger = vi.fn(() => ({ unwrap: () => Promise.resolve(authResponse) }));

vi.mock('@/services/client/briefAiApi', () => ({
  useLazyGetBriefAiStatusQuery: () => [authTrigger],
}));

vi.mock('@/services/client/publicBriefApi', () => ({
  useLazyGetPublicBriefStatusQuery: () => [publicTrigger],
}));

import { useBriefPolling } from './useBriefPolling';

const detailResult = {
  id: 'b1',
  messages: [{ id: 'a1', role: 'assistant' }],
} as unknown as BriefV3TaskStatus['result'];

const baseParams = {
  enabled: true,
  briefId: 'b1',
  isAuth: true,
  token: null,
  taskId: 'task-1',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('useBriefPolling', () => {
  beforeEach(() => {
    authShouldThrow = false;
    authResponse = { status: 'pending', result: null, error: null };
    authTrigger.mockClear();
  });

  it('does not poll when disabled', async () => {
    const onDone = vi.fn();
    const { unmount } = renderHook(() =>
      useBriefPolling({ ...baseParams, enabled: false, onDone, onFailed: vi.fn(), onTimeout: vi.fn() })
    );
    await delay(80);
    expect(authTrigger).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
    unmount();
  });

  it('calls onDone with the result when status is done', async () => {
    authResponse = { status: 'done', result: detailResult, error: null };
    const onDone = vi.fn();
    const onFailed = vi.fn();
    const { unmount } = renderHook(() => useBriefPolling({ ...baseParams, onDone, onFailed, onTimeout: vi.fn() }));
    await waitFor(() => expect(onDone).toHaveBeenCalledWith(detailResult));
    expect(onFailed).not.toHaveBeenCalled();
    unmount();
  });

  it('calls onFailed when status is failed', async () => {
    authResponse = { status: 'failed', result: null, error: 'boom' };
    const onFailed = vi.fn();
    const { unmount } = renderHook(() =>
      useBriefPolling({ ...baseParams, onDone: vi.fn(), onFailed, onTimeout: vi.fn() })
    );
    await waitFor(() => expect(onFailed).toHaveBeenCalledTimes(1));
    unmount();
  });

  it('calls onFailed when status is done but result is null', async () => {
    authResponse = { status: 'done', result: null, error: null };
    const onDone = vi.fn();
    const onFailed = vi.fn();
    const { unmount } = renderHook(() => useBriefPolling({ ...baseParams, onDone, onFailed, onTimeout: vi.fn() }));
    await waitFor(() => expect(onFailed).toHaveBeenCalledTimes(1));
    expect(onDone).not.toHaveBeenCalled();
    unmount();
  });

  it('calls onFailed when the request throws', async () => {
    authShouldThrow = true;
    const onFailed = vi.fn();
    const { unmount } = renderHook(() =>
      useBriefPolling({ ...baseParams, onDone: vi.fn(), onFailed, onTimeout: vi.fn() })
    );
    await waitFor(() => expect(onFailed).toHaveBeenCalledTimes(1));
    unmount();
  });

  it('calls onTimeout after the timeout while status stays pending', async () => {
    authResponse = { status: 'pending', result: null, error: null };
    const onTimeout = vi.fn();
    const onDone = vi.fn();
    const { unmount } = renderHook(() => useBriefPolling({ ...baseParams, onDone, onFailed: vi.fn(), onTimeout }));
    await waitFor(() => expect(onTimeout).toHaveBeenCalledTimes(1), { timeout: 1000 });
    expect(onDone).not.toHaveBeenCalled();
    unmount();
  });
});
