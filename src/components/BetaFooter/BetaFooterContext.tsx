'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface BetaFooterContextValue {
  dismissed: boolean;
  dismiss: () => void;
}

const BetaFooterContext = createContext<BetaFooterContextValue>({
  dismissed: false,
  dismiss: () => {
    /* no-op fallback */
  },
});

export const BetaFooterProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [dismissed, setDismissed] = useState(false);
  const dismiss = useCallback(() => setDismissed(true), []);
  const value = useMemo(() => ({ dismissed, dismiss }), [dismissed, dismiss]);
  return <BetaFooterContext.Provider value={value}>{props.children}</BetaFooterContext.Provider>;
};

export const useBetaFooter = (): BetaFooterContextValue => useContext(BetaFooterContext);
