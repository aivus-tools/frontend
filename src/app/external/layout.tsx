import { ReduxStore } from '@/context/Redux';

export default async function Layout({ children }: { children: React.ReactNode }) {
	return <ReduxStore>{children}</ReduxStore>;
}
