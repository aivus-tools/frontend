'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { App } from 'antd';
import { ReduxStore } from '@/context/ReduxProvider';
import { BetaFooter, useBetaFooterHeight } from '@/components/BetaFooter/BetaFooter';
import { BetaFooterProvider, useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';

interface BriefLayoutContentProps {
  isEmbed: boolean;
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
          background: props.isEmbed ? 'transparent' : 'var(--bg-gray-page)',
          paddingBottom: props.isEmbed || dismissed ? 0 : footerHeight,
          ...(props.isEmbed ? { '--bg-gray-page': 'transparent' } : {}),
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
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get('embed') === '1';

  useEffect(() => {
    if (!isEmbed) {
      return;
    }
    const root = document.documentElement;
    root.classList.add('aivus-embed');
    return () => {
      root.classList.remove('aivus-embed');
    };
  }, [isEmbed]);

  return (
    <ReduxStore>
      <BetaFooterProvider>
        <BriefLayoutContent isEmbed={isEmbed}>{props.children}</BriefLayoutContent>
        {!isEmbed ? <BetaFooter /> : null}
      </BetaFooterProvider>
    </ReduxStore>
  );
}
