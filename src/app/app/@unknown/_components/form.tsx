'use client';
import { Button, message, Typography } from 'antd';
import { useState } from 'react';

import { GROUPS } from '@/lib/constants';
import { Groups } from '@/types/user';

import styles from './form.module.css';
import { useChangeGroup } from '@/hooks/useChangeGroup';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

const invalidateUser = () =>
	fetch('/api/v1/invalidate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});

export function Form() {
	const [messageApi, contextHolder] = message.useMessage();
	const [loading, setLoading] = useState(false);
	const { change } = useChangeGroup();
	const router = useRouter();

	const trigger = (group: Groups) => async () => {
		setLoading(true);
		try {
			await invalidateUser();
			await change(group);
			router.push(`/app/dashboard`);
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
				<Button type='primary' onClick={trigger(GROUPS.client)} loading={loading}>
					I&apos;m a client
				</Button>
				<Button onClick={trigger(GROUPS.vendor)} loading={loading}>
					I&apos;m a vendor
				</Button>
			</div>
		</main>
	);
}
