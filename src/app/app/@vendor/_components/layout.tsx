'use client';
import cn from 'classnames';
import { LayoutProps } from '@/layout/Layout.props';
import { Header } from '@/layout/Header/Header';
import { Sidebar } from '@/layout/Sidebar/Sidebar';

import { SidebarDash, SidebarEst } from '@/components';
import styles from '../../../../layout/Layout.module.css';
import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';

const Layout = ({ theme = 'light', sidebarContent, className, hideNavigation, children, ...props }: LayoutProps) => {
	return (
		<div className={cn(styles.layout, className)} {...props}>
			<Header className={styles.header} hideNavigation={hideNavigation} />
			<Sidebar theme={theme} sidebarContent={sidebarContent} className={styles.sidebar} />
			<div className={styles.main}>{children}</div>
		</div>
	);
};

const VendorLayout = ({ children }: PropsWithChildren) => {
	const pathname = usePathname();
	const isRoot = (pathname?.split('/').length ?? 0) <= 3;

	return (
		<Layout
			theme={isRoot ? 'dark' : 'light'}
			sidebarContent={isRoot ? <SidebarDash /> : <SidebarEst />}
			hideNavigation={isRoot}
		>
			{children}
		</Layout>
	);
};

export { VendorLayout };
