import { ReduxStore } from '@/context/ReduxProvider';
import { MobileStub } from '@/components/MobileStub/MobileStub';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReduxStore>
      <MobileStub />
      <div className="aivus-desktop-content">
        {children}
      </div>
    </ReduxStore>
  );
}
