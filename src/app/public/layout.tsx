import { ReduxStore } from '@/context/ReduxProvider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <ReduxStore>{children}</ReduxStore>;
}
