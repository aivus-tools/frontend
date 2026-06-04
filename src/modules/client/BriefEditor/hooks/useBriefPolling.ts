import { useCallback, useEffect, useRef, useState } from 'react';
import { useLazyGetBriefAiStatusQuery } from '@/services/client/briefAiApi';
import { useLazyGetPublicBriefStatusQuery } from '@/services/client/publicBriefApi';
import { BriefV3Detail } from '@/types/briefAi.interface';
import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '../constants';

interface UseBriefPollingParams {
  enabled: boolean;
  briefId: string | null;
  isAuth: boolean;
  token: string | null;
  taskId: string | null;
  onDone: (detail: BriefV3Detail) => void;
  onFailed: () => void;
  onTimeout: () => void;
}

interface UseBriefPollingResult {
  isPolling: boolean;
  stop: () => void;
}

export const useBriefPolling = (params: UseBriefPollingParams): UseBriefPollingResult => {
  const [fetchStatusAuth] = useLazyGetBriefAiStatusQuery();
  const [fetchStatusPublic] = useLazyGetPublicBriefStatusQuery();
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settledRef = useRef(false);
  const callbacksRef = useRef({
    onDone: params.onDone,
    onFailed: params.onFailed,
    onTimeout: params.onTimeout,
  });
  callbacksRef.current = {
    onDone: params.onDone,
    onFailed: params.onFailed,
    onTimeout: params.onTimeout,
  };

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const enabled = params.enabled;
  const briefId = params.briefId;
  const isAuth = params.isAuth;
  const token = params.token ?? '';
  const taskId = params.taskId ?? '';

  useEffect(() => {
    if (!enabled || !briefId) {
      stop();
      return;
    }

    const startedAt = Date.now();
    settledRef.current = false;
    setIsPolling(true);

    const settle = (callback: () => void) => {
      if (settledRef.current) {
        return;
      }
      settledRef.current = true;
      stop();
      callback();
    };

    const tick = async () => {
      if (settledRef.current) {
        return;
      }
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        settle(() => callbacksRef.current.onTimeout());
        return;
      }
      try {
        const response = isAuth
          ? await fetchStatusAuth({ briefId, taskId }).unwrap()
          : await fetchStatusPublic({ briefId, taskId, token }).unwrap();
        if (settledRef.current) {
          return;
        }
        if (response.status === 'done') {
          settle(() =>
            response.result ? callbacksRef.current.onDone(response.result) : callbacksRef.current.onFailed()
          );
        } else if (response.status === 'failed') {
          settle(() => callbacksRef.current.onFailed());
        }
      } catch {
        settle(() => callbacksRef.current.onFailed());
      }
    };

    intervalRef.current = setInterval(tick, POLL_INTERVAL_MS);
    void tick();

    return () => {
      settledRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, briefId, isAuth, token, taskId, fetchStatusAuth, fetchStatusPublic, stop]);

  return { isPolling, stop };
};
