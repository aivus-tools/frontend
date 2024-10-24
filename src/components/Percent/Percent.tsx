'use client';
import { PercentProps } from './Percent.props';
import styles from './Percent.module.css';
import cn from 'classnames';
import ArrowUpIcon from '@/icons/arrow-up.svg';

export const Percent = ({
	mark,
	count,
	size = 'm',
	rounded = false,
	type = 'filled',
	className,
	...props
}: PercentProps) => {
	return (
		<span
			className={cn(styles.percent, className, {
				[styles.average]: mark === 'average',
				[styles.below]: mark === 'below',
				[styles.above]: mark === 'above',
				[styles.na]: mark === 'na',
				[styles.s]: size === 's',
				[styles.m]: size === 'm',
				[styles.l]: size === 'l',
				[styles.rounded]: rounded,
				[styles.filled]: type === 'filled',
				[styles.transparent]: type === 'transparent',
				[styles.inversion]: type === 'inversion',
			})}
			{...props}
		>
			{mark !== 'na' && <ArrowUpIcon className={cn(styles.icon)} />}
			<span className={cn(styles.count)}>{mark === 'na' ? 'N/A' : `${count} %`}</span>
		</span>
	);
};
