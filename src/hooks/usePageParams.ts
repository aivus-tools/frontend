import { usePathname } from 'next/navigation';

export const usePageParams = () => {
	const pathname = usePathname();
	const [, app = '', dashboard = '', projectId = '', tab = ''] = pathname?.split('/') ?? [];
	return { app, dashboard, projectId, tab };
};
