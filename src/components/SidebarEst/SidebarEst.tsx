'use client';
import { SidebarEstProps } from './SidebarEst.props';
import styles from './SidebarEst.module.css';
import cn from 'classnames';
import { Percent, Search, SidebarNav, SumCounter } from '@/components';
import { useSelector } from 'react-redux';
import { selectGrandTotalCost } from '@/store/selectors';

export const SidebarEst = ({ className, ...props }: SidebarEstProps) => {
	const grandTotalCost = useSelector(selectGrandTotalCost);

	return (
		<div className={cn(styles.sidebar, className)} {...props}>
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
		</div>
	);
};
