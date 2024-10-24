import { DSidebarProps } from './DSidebar.props';
import styles from './DSidebar.module.css';
import cn from 'classnames';
import HomeIcon from './home-icon.svg';
import LogoIcon from '@/icons/aivus-logo.svg';
import { Percent, Search, SidebarNav, SumCounter } from '@/components';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectGrandTotalCost } from '@/store/selectors';

export const DSidebar = ({ className, ...props }: DSidebarProps) => {
	const grandTotalCost = useSelector(selectGrandTotalCost);

	return (
		<aside className={cn(styles.sidebar, className)} {...props}>
			<Link href='/' className={cn(styles.logoWrap)}>
				<HomeIcon className={cn(styles.home)} />
				<LogoIcon className={cn(styles.logo)} />
			</Link>
			<div className={cn(styles.sidebarItem)}>
				<Search />
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
			<div className={cn(styles.sidebarItem, styles.sidebarNav)}>
				<SidebarNav />
			</div>

			<div className={cn(styles.counters)}>
				<SumCounter className={cn(styles.counterItem)} title='Total client’s cost' count={grandTotalCost.total} />
				<SumCounter className={cn(styles.counterItem)} title='Expenses' count={grandTotalCost.ctotal} />
				<SumCounter
					className={cn(styles.counterItem)}
					title='Revenue & Mark-Up'
					count={grandTotalCost.ctotal - grandTotalCost.total}
					highlight={true}
				>
					<Percent className={cn(styles.sub)} mark='average' size='l' count={36.5} />
				</SumCounter>
			</div>
		</aside>
	);
};
