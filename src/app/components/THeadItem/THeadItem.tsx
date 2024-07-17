'use client';
import { THeadItemProps } from './THeadItem.props';
import styles from './THeadItem.module.css';
import cn from 'classnames';
import SettingsIcon from './settings-icon.svg';

export const THeadItem = ({text, showIcon = false, className, ...props }: THeadItemProps) => {

	return (
		<div
			className={cn(styles.item, className)}
			{...props}
		>
			{showIcon && <SettingsIcon className={cn(styles.icon)} />}
			<div className={cn(styles.text)}>{text}</div>
		</div>
	);
};
