import { SidebarProps } from './Sidebar.props';
import styles from './Sidebar.module.css';
import cn from 'classnames';
import HomeIcon from '@/app/icons/home-icon.svg';
import LogoIcon from '@/app/icons/aivus-logo.svg';
import { Percent, Search, SidebarNav, SumCounter } from '@/app/components';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectGrandTotalCost } from '@/app/store/selectors';

export const Sidebar = ({ theme = 'light', sidebarContent, className, ...props }: SidebarProps) => {
	const grandTotalCost = useSelector(selectGrandTotalCost);

	return (
		<aside className={cn(styles.sidebar, className, {
			[styles.dark]: theme === 'dark'
		})}
					 {...props}
		>

			<Link href='/' className={cn(styles.logoWrap)}>
				<HomeIcon className={cn(styles.home)}/>
				<LogoIcon className={cn(styles.logo)}/>
			</Link>
			{ sidebarContent }

		</aside>
);
};
