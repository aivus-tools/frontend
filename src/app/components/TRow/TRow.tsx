'use client';
import { TRowProps } from './TRow.props';
import styles from './TRow.module.css';
import cn from 'classnames';


export const TRow = ({className, ...props }: TRowProps) => {
	return (
		<div className={cn(styles.row, className)}
			{...props}
		>

		</div>
	);
};
