'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { selectMode } from '@/store/slices/project';
import dynamic from 'next/dynamic';
import ViewProjectDetails from './view/Details';
import Spinner from '@/components/Spinner';
import i18n from 'i18n-iso-countries';

const FormProjectDetails = dynamic(() => import('./form/Details'), { ssr: false, loading: () => <Spinner /> });

export default function Page() {
	const mode = useAppSelector(selectMode);
	const [isClient, setIsClient] = useState(false);

	// Регистрация локали и установка isClient только на клиенте
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		i18n.registerLocale(require('i18n-iso-countries/langs/en.json'));
		setIsClient(true);
	}, []);

	// Пока компонент не смонтирован на клиенте — показываем заглушку (например, <Spinner />)
	if (!isClient) return <Spinner />;

	return mode === 'edit' ? <FormProjectDetails /> : <ViewProjectDetails />;
}
