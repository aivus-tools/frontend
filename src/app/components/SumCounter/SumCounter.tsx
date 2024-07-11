'use client';
import { SumCounterProps } from './SumCounter.props';
import styles from './SumCounter.module.css';
import cn from 'classnames';
import { formatPrice } from '@/app/helpers/helper';


export const SumCounter = ({title, count, highlight = false, children, className, ...props }: SumCounterProps) => {

	return (
		<div className={cn(styles.counter, className)}
				 {...props}
		>
			<div className={cn(styles.title)}>{title}</div>
			<div className={cn(styles.count, {
				[styles.primary]: highlight,
			})}>
				<div className={cn(styles.currency)}>$</div>
				<div className={cn(styles.num)}>{formatPrice(count)}</div>
			</div>
			<div className={cn(styles.item)}>
				{children}
			</div>
		</div>
	);
};
