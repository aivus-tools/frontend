'use client';
import styles from '../styles.module.css';
import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';
import { Steps } from './types';

const checkEmail = async ({ email }: { email: string }) => {
	const response = await fetch('/service/auth/check-email', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email }),
	});
	const data: { exist: boolean } = await response.json();
	return data.exist;
};

export const EmailForm = ({ nextAction }: { nextAction: (step: Steps, email: string) => void }) => {
	const [messageApi, contextHolder] = message.useMessage();

	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	const handleFinish = async ({ email }: { email: string }) => {
		if (loading) {
			return;
		}
		try {
			setLoading(true);
			const exist = await checkEmail({ email });
			setLoading(false);
			nextAction(exist ? 'signin' : 'register', email);
		} catch (error) {
			setLoading(false);
			messageApi.error('An unexpected error occurred');
			console.error('Error checking email:', error);
		}
	};

	return (
		<Form form={form} layout='vertical' style={{ marginTop: 20 }} onFinish={handleFinish}>
			{contextHolder}
			<div className={styles.inputWrapper}>
				<Form.Item name='email' noStyle rules={[{ required: true, message: 'Email is required' }]}>
					<Input placeholder='Your email address' id='email' name='email' size='large' />
				</Form.Item>
			</div>
			<Button block type='primary' size='large' loading={loading} disabled={loading} htmlType='submit'>
				Next
			</Button>
		</Form>
	);
};
