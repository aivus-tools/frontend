'use client';
import styles from '../styles.module.css';
import { Button, Input } from 'antd';
import { FormHTMLAttributes } from 'react';

export const EmailForm = ({
	action,
	error,
}: {
	action: FormHTMLAttributes<HTMLFormElement>['action'];
	error?: string;
}) => {
	return (
		<form action={action}>
			<div className={styles.inputWrapper}>
				<Input placeholder='Your email address' id='email' name='email' size='large' />
				{error && <p className={styles.error}>{error}</p>}
			</div>
			<Button block type='primary' size='large' htmlType='submit'>
				Next
			</Button>
		</form>
	);
};
