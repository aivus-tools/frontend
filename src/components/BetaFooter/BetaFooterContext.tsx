'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface BetaFooterContextValue {
  dismissed: boolean;
  dismiss: () => void;
  measuredHeight: number | null;
  setMeasuredHeight: (height: number | null) => void;
}

const BetaFooterContext = createContext<BetaFooterContextValue>({
  dismissed: false,
  dismiss: () => {
    /* no-op fallback */
  },
  measuredHeight: null,
  setMeasuredHeight: () => {
    /* no-op fallback */
  },
});

export const BetaFooterProvider = (props: { children: React.ReactNode }) => {
  const [dismissed, setDismissed] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const dismiss = useCallback(() => setDismissed(true), []);
  const handleSetMeasuredHeight = useCallback((height: number | null) => setMeasuredHeight(height), []);
  const value = useMemo(
    () => ({ dismissed, dismiss, measuredHeight, setMeasuredHeight: handleSetMeasuredHeight }),
    [dismissed, dismiss, measuredHeight, handleSetMeasuredHeight]
  );
  return <BetaFooterContext.Provider value={value}>{props.children}</BetaFooterContext.Provider>;
};

export const useBetaFooter = (): BetaFooterContextValue => useContext(BetaFooterContext);
