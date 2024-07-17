import { LayoutProps } from './Layout.props';
import styles from './Layout.module.css';
import cn from 'classnames';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';
import { ModalProvider } from '@/app/context/ModalContext';


export const Layout = ({ children, className, ...props }: LayoutProps) => {
	return (
		<div className={cn(styles.layout, className)} {...props}>
			<Header className={styles.header}></Header>
			<Sidebar className={styles.sidebar}></Sidebar>
			<div className={styles.main}>{children}</div>
		</div>
	);
};

const withLayout = <T extends Record<string, unknown>>(Component: React.FC<T>) => {
	const WithLayoutComponent: React.FC<T> = (props) => (
		<ModalProvider>
			<Layout>
					<Component {...props} />
			</Layout>
		</ModalProvider>
	);

	return WithLayoutComponent;
};

export default withLayout;
