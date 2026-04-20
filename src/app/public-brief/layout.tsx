import { App } from 'antd';
import { ReduxStore } from '@/context/ReduxProvider';
import { MobileStub } from '@/components/MobileStub/MobileStub';

export default function PublicBriefLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxStore>
      <MobileStub />
      <div className='aivus-desktop-content'>
        <App>{children}</App>
      </div>
    </ReduxStore>
  );
}
