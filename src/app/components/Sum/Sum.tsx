'use client';
import { SumProps } from './Sum.props';
import styles from './Sum.module.css';
import cn from 'classnames';
import { formatPrice } from '@/app/helpers/helper';


export const Sum = ({count, size = 'm', type = 'gray',className, ...props }: SumProps) => {

	return (
		<div className={cn(styles.sum, className, {
			[styles.xs]: size === 'xs',
			[styles.s]: size === 's',
			[styles.m]: size === 'm',
			[styles.l]: size === 'l',
			[styles.green]: type === 'green',
			[styles.blue]: type === 'blue',
			[styles.gray]: type === 'gray',
			[styles.dark]: type === 'dark',
		})}
				 {...props}
		>
			$ {formatPrice(count)}
		</div>
	);
};
