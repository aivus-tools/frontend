'use client';
import { Button, message, Typography } from 'antd';
import { useState } from 'react';

import { ROLES } from '@/lib/constants';
import { Roles } from '@/types/user';

import styles from './form.module.css';

const { Title } = Typography;

const changeGroup = (group: Roles) =>
	fetch('/api/v1/change-group', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ group }),
	});

export function Form() {
	const [messageApi, contextHolder] = message.useMessage();
	const [loading, setLoading] = useState(false);

	const trigger = async (group: Roles) => {
		setLoading(true);
		try {
			const response = await changeGroup(group);
			const data = await response.json();
			if (response.ok) {
				window.location.href = '/app/dashboard';
			} else {
				console.error(data);
				messageApi.error('An unexpected error occurred');
			}
		} catch (error) {
			messageApi.error('An unexpected error occurred');
			console.error('Failed to change role:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className={styles.main}>
			{contextHolder}
			<div className={styles.container}>
				<Title level={2}>Please, choose your role:</Title>
				<Button type='primary' onClick={() => trigger(ROLES.client)} loading={loading}>
					I&apos;m a client
				</Button>
				<Button onClick={() => trigger(ROLES.vendor)} loading={loading}>
					I&apos;m a vendor
				</Button>
			</div>
		</main>
	);
}
