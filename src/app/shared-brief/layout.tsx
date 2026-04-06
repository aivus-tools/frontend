import { ReduxStore } from '@/context/ReduxProvider';

export default function SharedBriefLayout({ children }: { children: React.ReactNode }) {
  return <ReduxStore>{children}</ReduxStore>;
}
