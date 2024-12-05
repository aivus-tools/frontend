import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/dashboard';
import { Estimation } from './pages/estimation';
import cn from 'classnames';
import { ModalProvider } from '@/context/ModalContext';
import { Provider } from 'react-redux';
import store from '@/store/store';
import { LayoutProps } from '@/layout/Layout.props';
import { Header } from '@/layout/Header/Header';
import { Sidebar } from '@/layout/Sidebar/Sidebar';

import styles from '../layout/Layout.module.css';
import { SidebarDash, SidebarEst } from '@/components';

export const Layout = ({ theme = 'light', sidebarContent, className, hideNavigation, ...props }: LayoutProps) => {
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

const App = () => {
	return (
		<Provider store={store}>
			<Router
				future={{
					v7_startTransition: true,
					v7_relativeSplatPath: true,
				}}
			>
				<ModalProvider>
					<Routes>
						<Route
							path='/dashboard'
							element={<Layout theme={'dark'} sidebarContent={<SidebarDash />} hideNavigation />}
						>
							<Route index element={<Dashboard />}></Route>
						</Route>
						<Route path='/projects' element={<Layout sidebarContent={<SidebarEst />} />}>
							<Route path='estimation' element={<Estimation />} />
							<Route path='*' element={<></>} />
						</Route>
						<Route path='*' element={<Navigate to={'/dashboard'} />} />
					</Routes>
				</ModalProvider>
			</Router>
		</Provider>
	);
};

export default App;
