'use client';

import { useAppSelector } from '@/lib/hooks';
import { selectMode } from '@/store/slices/project';
import dynamic from 'next/dynamic';
import ViewProjectDetails from './view/Details';
import i18n from 'i18n-iso-countries';
import Spinner from '@/components/Spinner';
// Загрузка локалей
// eslint-disable-next-line @typescript-eslint/no-require-imports
i18n.registerLocale(require('i18n-iso-countries/langs/en.json'));

const FormProjectDetails = dynamic(() => import('./form/Details'), { ssr: false, loading: () => <Spinner /> });

export default function Page() {
	const mode = useAppSelector(selectMode);

	return mode === 'edit' ? <FormProjectDetails /> : <ViewProjectDetails />;
}
