'use client';
import { Button, message, Typography } from 'antd';
import { useState } from 'react';

import { GROUPS } from '@/lib/constants';
import { Groups } from '@/types/user';

import styles from './form.module.css';
import { useChangeGroup } from '@/hooks/useChangeGroup';

const { Title } = Typography;

export function Form() {
	const [messageApi, contextHolder] = message.useMessage();
	const [loading, setLoading] = useState(false);
	const { change } = useChangeGroup();
	const [group, setGroup] = useState<Groups | null>(null);

	const trigger = (group: Groups) => async () => {
		setLoading(true);
		setGroup(group);
		try {
			await change(group);
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
				<Button
					type='primary'
					onClick={trigger(GROUPS.client)}
					loading={loading && group === GROUPS.client}
					disabled={loading}
				>
					I&apos;m a client
				</Button>
				<Button onClick={trigger(GROUPS.vendor)} loading={loading && group === GROUPS.vendor} disabled={loading}>
					I&apos;m a vendor
				</Button>
			</div>
		</main>
	);
}
