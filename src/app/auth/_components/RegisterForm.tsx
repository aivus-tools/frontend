'use client';
import { Button, Form, Input, message } from 'antd';
import { signIn } from 'next-auth/react';

import styles from '../styles.module.css';
import { useState } from 'react';
import { CALLBACK_URL } from '@/lib/service-routes';
import { AUTH_TYPES } from '@/lib/constants';
import { AuthType } from '@/types/user';

export interface ResponseData {
	statusCode: number;
	timestamp: string;
	path: string;
	message: string;
	errorDetails: ErrorDetails;
}

export interface ErrorDetails {
	message: string[];
	error: string;
	statusCode: number;
}

const register = async ({
	name,
	email,
	authType,
	password = '',
}: {
	name: string;
	email: string;
	authType: AuthType;
	password?: string;
}) =>
	await fetch('service/auth/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			email,
			name,
			authType,
			password,
		}),
	});

type RegisterFormFields = {
	name: string;
	password: string;
	repeatPassword: string;
};

export const RegisterForm = ({ email, prevStepAction }: { email: string; prevStepAction: () => void }) => {
	const [messageApi, contextHolder] = message.useMessage();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	const handleFinish = async ({ name, password, repeatPassword }: RegisterFormFields) => {
		if (loading) {
			return;
		}
		if (password !== repeatPassword) {
			messageApi.error('Passwords do not match');
			form.setFields([{ name: 'repeatPassword', errors: [''] }]);
			return;
		}
		setLoading(true);

		try {
			const response = await register({
				name,
				email,
				password,
				authType: AUTH_TYPES.credentials,
			});
			if (!response.ok) {
				const data: ResponseData | null = await response.json();
				if (data) {
					data.errorDetails.message.forEach((message) => {
						messageApi.error(message);
					});
				} else {
					messageApi.error('Failed to register');
				}
				return;
			}
			messageApi.success('Registration successful');
			const signInResult = await signIn('credentials', { email, password, redirect: false });
			if (signInResult?.error) {
				messageApi.error('Invalid credentials');
				form.resetFields();
				form.setFields([{ name: 'password', errors: [''] }]);
			} else {
				window.location.href = CALLBACK_URL ?? '/';
			}
		} catch (error) {
			messageApi.error('An unexpected error occurred');
			console.error('Error checking email:', error);
		} finally {
			setLoading(false);
		}
	};
	return (
		<Form form={form} layout='vertical' onFinish={handleFinish}>
			{contextHolder}
			<div className={styles.inputWrapper}>
				<Form.Item name='name'>
					<Input size='large' placeholder='Name' type='text' id='name' name='name' />
				</Form.Item>
			</div>
			<div className={styles.inputWrapper}>
				<Form.Item name='password'>
					<Input size='large' placeholder='Enter your password' type='password' id='password' name='password' />
				</Form.Item>
			</div>
			<div className={styles.inputWrapper}>
				<Form.Item name='repeatPassword'>
					<Input
						size='large'
						placeholder='Repeat your password'
						type='password'
						id='repeatPassword'
						name='repeatPassword'
					/>
				</Form.Item>
			</div>
			<div className={styles.buttonRowGroup}>
				<Button htmlType='reset' block onClick={prevStepAction}>
					Back
				</Button>
				<Button type='primary' htmlType='submit' block>
					Sign up
				</Button>
			</div>
		</Form>
	);
};
