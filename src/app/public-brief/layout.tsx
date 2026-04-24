'use client';

import { App } from 'antd';
import { ReduxStore } from '@/context/ReduxProvider';
import { MobileStub } from '@/components/MobileStub/MobileStub';
import { BetaFooter, BETA_FOOTER_HEIGHT } from '@/components/BetaFooter/BetaFooter';
import { BetaFooterProvider, useBetaFooter } from '@/components/BetaFooter/BetaFooterContext';

const PublicBriefContent = ({ children }: { children: React.ReactNode }) => {
  const { dismissed } = useBetaFooter();
  return (
    <div className='aivus-desktop-content' style={{ paddingBottom: dismissed ? 0 : BETA_FOOTER_HEIGHT }}>
      <App>{children}</App>
    </div>
  );
};

export default function PublicBriefLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxStore>
      <MobileStub />
      <BetaFooterProvider>
        <PublicBriefContent>{children}</PublicBriefContent>
        <BetaFooter />
      </BetaFooterProvider>
    </ReduxStore>
  );
}
