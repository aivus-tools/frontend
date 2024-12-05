'use client';
import styles from '../styles.module.css';
import { Button, Input } from '@/components';
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
				<Input className={styles.input} placeholder='Your email address' id='email' name='email' />
				{error && <p className={styles.error}>{error}</p>}
			</div>
			<Button className={styles.submit} type='submit'>
				Next
			</Button>
		</form>
	);
};
