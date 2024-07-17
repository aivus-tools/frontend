import { InputProps } from './Input.props';
import styles from './Input.module.css';
import cn from 'classnames';
import React, { ForwardedRef, forwardRef } from 'react';
import ArrowIcon from '@/app/icons/arrow-down-icon.svg';

export const Input = forwardRef(({ className, showIcon = false, error, ...props }: InputProps, ref: ForwardedRef<HTMLInputElement>) => {

	return (
		<div className={cn(className, styles.wrapper)}>
			<div className={cn(styles.inputWrapper)}>
				<input
					ref={ref}
					className={cn(styles.input, {
						[styles.withIcon]: showIcon,
						[styles.error]: error,
					})}
					{...props}
				/>
				{showIcon && <ArrowIcon className={styles.icon} />}
			</div>
			<div className={styles.errorMessage}>{error && error.message}</div>
		</div>
	);
});

Input.displayName = 'Input';
