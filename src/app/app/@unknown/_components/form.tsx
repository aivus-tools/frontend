'use client';
import { Button, Typography } from 'antd';

import styles from './form.module.css';
import { role } from '@/app/actions/role';
import { ROLES } from '@/services/constants';

const { Title } = Typography;

export function Form() {
	return (
		<main className={styles.main}>
			<div className={styles.container}>
				<Title>Please choose your role:</Title>
				<Button type='primary' onClick={() => role(ROLES.client)}>
					I&apos;m a client
				</Button>
				<Button onClick={() => role(ROLES.vendor)}>I&apos;m a vendor</Button>
			</div>
		</main>
	);
}
