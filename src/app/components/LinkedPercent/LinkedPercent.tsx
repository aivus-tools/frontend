'use client';
import { LinkedPercentProps } from './LinkedPercent.props';
import styles from './LinkedPercent.module.css';
import cn from 'classnames';
import { EditableInput } from '@/app/components';
import UnlinkIcon from '@/app/icons/unlink-icon.svg';
import LinkAngleIcon from '@/app/icons/link-angle-icon.svg';


export const LinkedPercent = ({count, highlight = false, linked = true, disabled = false, className, ...props }: LinkedPercentProps) => {
	return (
		<div
			className={cn(styles.percent, className, {
				[styles.highlight]: highlight,
			})}
			{...props}
		>
			{linked ? <LinkAngleIcon className={styles.icon} /> : <UnlinkIcon className={styles.icon} /> }
			<span className={styles.inputWrap}>
				{disabled ? <span className={cn(styles.disabled)}>{count}</span> : <EditableInput type="number" value={count} disabled={disabled}/>}
			</span>
			<span className={styles.additional}> %</span>
		</div>
	);
};
