import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Dashboard } from '../dashboard';
import { Estimation } from '../estimation';
import cn from 'classnames';
import { LayoutProps } from '@/layout/Layout.props';
import { Header } from '@/layout/Header/Header';
import { Sidebar } from '@/layout/Sidebar/Sidebar';

import { SidebarDash, SidebarEst } from '@/components';
import styles from '../../../layout/Layout.module.css';
import { Details } from './Details';

const Layout = ({ theme = 'light', sidebarContent, className, hideNavigation, ...props }: LayoutProps) => {
	return (
		<div className={cn(styles.layout, className)} {...props}>
			<Header className={styles.header} hideNavigation={hideNavigation} />
			<Sidebar theme={theme} sidebarContent={sidebarContent} className={styles.sidebar} />
			<div className={styles.main}>
				<Outlet />
			</div>
		</div>
	);
};

const VendorRoutes = () => {
	return (
		<Routes>
			<Route path='/app'>
				<Route path='dashboard' element={<Layout theme={'dark'} sidebarContent={<SidebarDash />} hideNavigation />}>
					<Route index element={<Dashboard />}></Route>
				</Route>
				<Route path='projects' element={<Layout sidebarContent={<SidebarEst />} />}>
					<Route path='details' element={<Details />} />
					<Route path='estimation' element={<Estimation />} />
					<Route path='*' element={<></>} />
				</Route>
			</Route>
			<Route path='*' element={<Navigate to={'/app/dashboard'} />} />
		</Routes>
	);
};
export default VendorRoutes;
