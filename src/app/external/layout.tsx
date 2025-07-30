import { ReduxStore } from '@/context/ReduxProvider';

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <ReduxStore>{children}</ReduxStore>;
}
