import { App } from 'antd';
import { ReduxStore } from '@/context/ReduxProvider';
import { MobileStub } from '@/components/MobileStub/MobileStub';
import { BetaFooter, BETA_FOOTER_HEIGHT } from '@/components/BetaFooter/BetaFooter';

export default function PublicBriefLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxStore>
      <MobileStub />
      <div className='aivus-desktop-content' style={{ paddingBottom: BETA_FOOTER_HEIGHT }}>
        <App>{children}</App>
      </div>
      <BetaFooter />
    </ReduxStore>
  );
}
