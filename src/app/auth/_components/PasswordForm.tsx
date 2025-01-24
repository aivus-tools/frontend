'use client';
import styles from '../styles.module.css';
import { Input } from '@/components';
import { Button } from 'antd';
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
				<Button htmlType='reset' block>
					Back
				</Button>
				<Button type='primary' htmlType='submit' block>
					Sign in
				</Button>
			</div>
		</form>
	);
};
