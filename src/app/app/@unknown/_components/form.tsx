'use client';
import { Button, Typography } from 'antd';

import styles from './form.module.css';
import { ROLES } from '@/lib/constants';
import { Roles } from '@/types/user';
import useSWRMutation from 'swr/mutation';

const { Title } = Typography;

const changeGroup = async (url: string, { arg: body }: { arg: { group: Roles } }) =>
	await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

export function Form() {
	const { trigger, isMutating } = useSWRMutation('/api/v1/change-group', changeGroup);

	return (
		<main className={styles.main}>
			<div className={styles.container}>
				<Title level={2}>Please, choose your role:</Title>
				<Button type='primary' onClick={() => trigger({ group: ROLES.client })} loading={isMutating}>
					I&apos;m a client
				</Button>
				<Button onClick={() => trigger({ group: ROLES.vendor })} loading={isMutating}>
					I&apos;m a vendor
				</Button>
			</div>
		</main>
	);
}
