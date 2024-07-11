import { SidebarProps } from './Sidebar.props';
import styles from './Sidebar.module.css';
import cn from 'classnames';
import HomeIcon from './home-icon.svg';
import LogoIcon from './aivus-logo.svg';
import TopArrowIcon from './top-arrow-icon.svg';
import { Search, SidebarNav, SumCounter } from '@/app/components';

export const Sidebar = ({ children, className, ...props }: SidebarProps) => {
	return (
		<aside className={cn(styles.sidebar, className)}
					 {...props}
		>
			<div className={cn(styles.logoWrap)}>
				<HomeIcon className={cn(styles.home)}/>
				<LogoIcon className={cn(styles.logo)}/>
			</div>
			<div className={cn(styles.sidebarItem)}>
				<Search/>
			</div>
			<div className={cn(styles.sidebarItem)}>
				<div className={cn(styles.sidebarProjectItem)}>
					<div className={cn(styles.sidebarSubTitle)}>Project</div>
					<div className={cn(styles.sidebarSubText)}>HR-brand commercial</div>
				</div>
				<div className={cn(styles.sidebarProjectItem)}>
					<div className={cn(styles.sidebarSubTitle)}>Vendor</div>
					<div className={cn(styles.sidebarSubText)}>The Coca-Cola Company</div>
				</div>
			</div>
			<div className={cn(styles.sidebarItem)}>
				<SidebarNav/>
			</div>

			<div className={cn(styles.counters)}>
				<SumCounter className={cn(styles.counterItem)} title="Total client’s cost" count={32620.8} />
				<SumCounter className={cn(styles.counterItem)} title="Expenses" count={20727.0} />
				<SumCounter className={cn(styles.counterItem)} title="Revenue & Mark-Up" count={11893.8} highlight={true}>
					<div className={cn(styles.sub)}>
						<TopArrowIcon className={cn(styles.subIcon)} />
						36,5 %
					</div>
				</SumCounter>
			</div>
		</aside>
);
};
