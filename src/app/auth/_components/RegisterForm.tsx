'use client';
import styles from '../styles.module.css';
import { Button, Input } from '@/components';
import { FormHTMLAttributes } from 'react';

export const RegisterForm = ({
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
				<Input className={styles.input} placeholder='Name' type='text' id='name' name='name' />
				{error && <p className={styles.error}>{error}</p>}
			</div>
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
			<div className={styles.inputWrapper}>
				<Input
					className={styles.input}
					placeholder='Repeat your password'
					type='password'
					id='repeat-password'
					name='repeat-password'
				/>
				{error && <p className={styles.error}>{error}</p>}
			</div>
			<div className={styles.buttonRowGroup}>
				<Button className={styles.submit} type='reset'>
					Back
				</Button>
				<Button className={styles.submit} type='submit'>
					Sign up
				</Button>
			</div>
		</form>
	);
};
