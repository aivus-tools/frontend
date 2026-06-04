'use client';

import { App } from 'antd';
import { ReduxStore } from '@/context/ReduxProvider';
import { BetaFooter, useBetaFooterHeight } from '@/components/BetaFooter/BetaFooter';
import { BetaFooterProvider, useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';

const PublicBriefContent = ({ children }: { children: React.ReactNode }) => {
  const { dismissed } = useBetaFooter();
  const footerHeight = useBetaFooterHeight();
  return (
    <div
      style={
        {
          '--aivus-header-h': '0px',
          minHeight: '100dvh',
          background: 'var(--bg-gray-page)',
          paddingBottom: dismissed ? 0 : footerHeight,
        } as React.CSSProperties
      }
    >
      <App>{children}</App>
    </div>
  );
};

export default function PublicBriefLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxStore>
      <BetaFooterProvider>
        <PublicBriefContent>{children}</PublicBriefContent>
        <BetaFooter />
      </BetaFooterProvider>
    </ReduxStore>
  );
}
