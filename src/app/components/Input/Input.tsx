import { InputProps } from './Input.props';
import styles from './Input.module.css';
import cn from 'classnames';
import React, { ForwardedRef, forwardRef } from 'react';

export const Input = forwardRef(({ className, error, ...props }: InputProps, ref: ForwardedRef<HTMLInputElement>) => {

	return (
		<div className={cn(className, styles.inputWrapper)}>
			<input
				ref={ref}
				className={cn(styles.input, {
					[styles.error]: error,
				})}
				{...props}
			/>
			<div className={styles.errorMessage}>{error && error.message}</div>
		</div>
	);
});

Input.displayName = 'Input';
