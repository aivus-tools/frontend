import { SidebarDashProps } from './SidebarDash.props';
import styles from './SidebarDash.module.css';
import cn from 'classnames';
import { Search } from '@/app/components';
import Link from 'next/link';

export const SidebarDash = ({ children, className, ...props }: SidebarDashProps) => {

	return (
		<div className={cn(styles.sidebar, className)}
				{...props}
		>
			<div className={cn(styles.sidebarItem)}>
				<Search type="white" />
			</div>
			<div className={cn(styles.sidebarItem)}>
				<div className={cn(styles.sidebarNavEl)}>Recently viewed</div>
				<div className={cn(styles.sidebarNavEl)}>Favorites</div>
				<div className={cn(styles.sidebarNavEl)}>Completed</div>
			</div>
			<div className={cn(styles.sidebarItem)}>
				<div className={cn(styles.sidebarNavEl)}>By status</div>
				<div className={cn(styles.sidebarNavEl)}>Drafts</div>
				<div className={cn(styles.sidebarNavEl)}>Collecting offers</div>
				<div className={cn(styles.sidebarNavEl)}>Reviewing</div>
				<div className={cn(styles.sidebarNavEl)}>Launched</div>
				<div className={cn(styles.sidebarNavEl)}>Canceled</div>
				<div className={cn(styles.sidebarNavEl)}>Deleted</div>
			</div>

			<div className={cn(styles.fixed)}>
				<div className={cn(styles.sidebarNavEl)}>Templates</div>
				<div className={cn(styles.sidebarNavEl)}>Rates</div>
			</div>
		</div>
	);
};
