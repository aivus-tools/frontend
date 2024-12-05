'use client';
import styles from '../styles.module.css';
import { Button, Input } from '@/components';
import { FormHTMLAttributes } from 'react';

export const PasswordForm = ({
	action,
	error,
	onResetAction,
}: {
	action: FormHTMLAttributes<HTMLFormElement>['action'];
	onResetAction: () => void;
	error?: string;
}) => {
	return (
		<form action={action} onReset={onResetAction}>
			<div className={styles.inputWrapper}>
				<Input
					className={styles.input}
					placeholder='Enter your password'
					type='password'
					id='password'
					name='password'
				/>
				{error && <p className={styles.error}>{error}</p>}
			</div>
			<div className={styles.buttonRowGroup}>
				<Button className={styles.submit} type='reset'>
					Back
				</Button>
				<Button className={styles.submit} type='submit'>
					Sign in
				</Button>
			</div>
		</form>
	);
};
