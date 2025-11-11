import { useRef, useEffect } from 'react';

/**
 * Hook для выполнения эффекта строго один раз, даже в React Strict Mode.
 *
 * В отличие от обычного useEffect, этот hook гарантирует однократное выполнение
 * даже при unmount/remount компонента в dev-режиме.
 *
 * @example
 * ```typescript
 * useOnce(() => {
 *   confirmEmail(token); // Выполнится строго один раз
 * }, [token]);
 * ```
 *
 * @param effect - Функция для выполнения
 * @param deps - Зависимости (как в useEffect)
 */
export function useOnce(effect: () => void | (() => void), deps: React.DependencyList = []) {
  const hasRun = useRef(false);
  const cleanup = useRef<(() => void) | void>();

  useEffect(() => {
    if (hasRun.current) return cleanup.current;

    hasRun.current = true;
    cleanup.current = effect();

    return cleanup.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook для выполнения async эффекта строго один раз, даже в React Strict Mode.
 *
 * @example
 * ```typescript
 * useOnceAsync(async () => {
 *   await confirmEmail(token);
 *   console.log('Email confirmed');
 * }, [token]);
 * ```
 *
 * @param effect - Async функция для выполнения
 * @param deps - Зависимости (как в useEffect)
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
