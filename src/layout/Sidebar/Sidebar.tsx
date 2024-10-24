import { SidebarProps } from './Sidebar.props';
import styles from './Sidebar.module.css';
import cn from 'classnames';
import HomeIcon from '@/icons/home-icon.svg';
import LogoIcon from '@/icons/aivus-logo.svg';
import Link from 'next/link';

export const Sidebar = ({ theme = 'light', sidebarContent, className, ...props }: SidebarProps) => {
	return (
		<aside
			className={cn(styles.sidebar, className, {
				[styles.dark]: theme === 'dark',
			})}
			{...props}
		>
			<Link href='/' className={cn(styles.logoWrap)}>
				<HomeIcon className={cn(styles.home)} />
				<LogoIcon className={cn(styles.logo)} />
			</Link>
			{sidebarContent}
		</aside>
	);
};
