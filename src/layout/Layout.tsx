import { LayoutProps } from './Layout.props';
import styles from './Layout.module.css';
import cn from 'classnames';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';
import { ModalProvider } from '@/context/ModalContext';
import { Provider } from 'react-redux';
import store from '@/store/store';

export const Layout = ({ theme = 'light', sidebarContent, children, className, ...props }: LayoutProps) => {
	return (
		<div className={cn(styles.layout, className)} {...props}>
			<Header className={styles.header}></Header>
			<Sidebar theme={theme} sidebarContent={sidebarContent} className={styles.sidebar}></Sidebar>
			<div className={styles.main}>{children}</div>
		</div>
	);
};

const withLayout = <T extends Record<string, unknown>>(
	Component: React.FC<T>,
	theme: 'light' | 'dark' = 'light',
	sidebarContent?: React.ReactNode
) => {
	const WithLayoutComponent: React.FC<T> = (props) => (
		<Provider store={store}>
			<ModalProvider>
				<Layout theme={theme} sidebarContent={sidebarContent}>
					<Component {...props} />
				</Layout>
			</ModalProvider>
		</Provider>
	);

	return WithLayoutComponent;
};

export default withLayout;
