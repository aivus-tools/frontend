'use client';
import { ButtonProps } from './Button.props';
import styles from './Button.module.css';
import cn from 'classnames';

export const Button = ({ size='m', color='primary', children, className, ...props }: ButtonProps) => {
	return (
		<button
			className={cn(styles.button, className, {
				[styles.s]: size === 's',
				[styles.m]: size === 'm',
				[styles.l]: size === 'l',
				[styles.primary]: color === 'primary',
				[styles.beige]: color === 'beige',
				[styles.transparent]: color === 'transparent',
			})}
			{...props}
		>
			{children}
		</button>
	);
};
