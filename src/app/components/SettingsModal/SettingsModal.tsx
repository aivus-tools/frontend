'use client';
import { SettingsModalProps } from './SettingsModal.props';
import styles from './SettingsModal.module.css';
import cn from 'classnames';



export const SettingsModal = ({children, className, ...props }: SettingsModalProps) => {
	return (
		<div
			className={cn(styles.settings, className)}
			{...props}
		>
			<h2>Settings</h2>
			<div>Some content of Settings Modal</div>
		</div>
	);
};
