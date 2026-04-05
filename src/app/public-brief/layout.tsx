import { ReduxStore } from '@/context/ReduxProvider';

export default function PublicBriefLayout({ children }: { children: React.ReactNode }) {
  return <ReduxStore>{children}</ReduxStore>;
}
