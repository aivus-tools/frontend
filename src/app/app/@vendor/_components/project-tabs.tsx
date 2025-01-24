'use client';
import { useRouter, useSelectedLayoutSegments } from 'next/navigation';
import { Tabs } from './tabs';
import { VENDOR_PROJECT_TABS } from '@/lib/constants';

export const ProjectTabs = () => {
	const router = useRouter();
	const [, , tab] = useSelectedLayoutSegments();

	const handleClick = (pathname: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		router.push(pathname);
	};

	return <Tabs activeKey={tab} items={VENDOR_PROJECT_TABS} onChange={handleClick} />;
};
