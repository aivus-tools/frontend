'use client';

import { App } from 'antd';
import { ReduxStore } from '@/context/ReduxProvider';
import { BetaFooter, useBetaFooterHeight } from '@/components/BetaFooter/BetaFooter';
import { BetaFooterProvider, useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';

interface BriefLayoutContentProps {
  children: React.ReactNode;
}

const BriefLayoutContent = (props: BriefLayoutContentProps) => {
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
      <App>{props.children}</App>
    </div>
  );
};

interface BriefLayoutProps {
  children: React.ReactNode;
}

export default function BriefLayout(props: BriefLayoutProps) {
  return (
    <ReduxStore>
      <BetaFooterProvider>
        <BriefLayoutContent>{props.children}</BriefLayoutContent>
        <BetaFooter />
      </BetaFooterProvider>
    </ReduxStore>
  );
}
