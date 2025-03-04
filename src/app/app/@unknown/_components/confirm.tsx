'use client';
import { message, Typography } from 'antd';

import { useConfirmEmailQuery } from '@/hooks/useChangeGroup';
import { useSearchParams } from 'next/navigation';
import { Form } from './form';
import Spinner from '@/components/Spinner';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { GROUPS } from '@/lib/constants';

export const Confirm = () => {
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const session = useSession();
	const group = session.data?.user?.group;

	const { isSuccess, isLoading, error } = useConfirmEmailQuery(token!, {
		skip: !token || group !== GROUPS.unconfirmed,
	});

	useEffect(() => {
		if (error) {
			message.error('An unexpected error occurred');
			console.error('Failed to confirm email:', error);
		}
	}, [error]);

	if (isSuccess) {
		return <Form />;
	}

	if (isLoading) {
		return <Spinner />;
	}

	return <Typography.Title level={3}>Please confirm your e-mail</Typography.Title>;
};
