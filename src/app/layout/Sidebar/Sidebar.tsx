import { SidebarProps } from './Sidebar.props';
import styles from './Sidebar.module.css';
import cn from 'classnames';

export const Sidebar = ({ children, className, ...props }: SidebarProps) => {
	return (
		<aside className={cn(styles.sidebar, className)} {...props}>
			Sidebar
		</aside>
	);
};
