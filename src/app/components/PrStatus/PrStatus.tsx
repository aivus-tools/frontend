'use client';
import { PrStatusProps } from './PrStatus.props';
import styles from './PrStatus.module.css';
import cn from 'classnames';

export const PrStatus = ({status, className, ...props }: PrStatusProps) => {
	return (
		<div className={cn(styles.status, className, {
			[styles.rfp]: status === 'RFP',
			[styles.reviewing]: status === 'Reviewing',
			[styles.ongoing]: status === 'Ongoing',
		})}
				 {...props}
		>
			{status}
		</div>
	);
};
