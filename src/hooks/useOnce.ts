import { useRef, useEffect } from 'react';

/**
 * Hook to execute an effect strictly once, even in React Strict Mode.
 *
 * Unlike regular useEffect, this hook guarantees single execution
 * even during unmount/remount of the component in dev mode.
 *
 * @example
 * ```typescript
 * useOnce(() => {
 *   confirmEmail(token); // Will execute strictly once
 * }, [token]);
 * ```
 *
 * @param effect - Function to execute
 * @param deps - Dependencies (same as useEffect)
 */
export function useOnce(effect: () => void | (() => void), deps: React.DependencyList = []) {
  const hasRun = useRef(false);
  const cleanup = useRef<(() => void) | void>(undefined);

  useEffect(() => {
    if (hasRun.current) {
      return typeof cleanup.current === 'function' ? cleanup.current : undefined;
    }

    hasRun.current = true;
    cleanup.current = effect();

    return typeof cleanup.current === 'function' ? cleanup.current : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook to execute an async effect strictly once, even in React Strict Mode.
 *
 * @example
 * ```typescript
 * useOnceAsync(async () => {
 *   await confirmEmail(token);
 *   console.log('Email confirmed');
 * }, [token]);
 * ```
 *
 * @param effect - Async function to execute
 * @param deps - Dependencies (same as useEffect)
 */
export function useOnceAsync(effect: () => Promise<void>, deps: React.DependencyList = []) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    hasRun.current = true;
    void effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
