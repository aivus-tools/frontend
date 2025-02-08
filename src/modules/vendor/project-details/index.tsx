'use client';

import { useAppSelector } from '@/lib/hooks';
import { selectMode } from '@/store/slices/project';
import dynamic from 'next/dynamic';
import ViewProjectDetails from './view/Details';

const FormProjectDetails = dynamic(() => import('./form/Details'), { ssr: false });

export default function Page() {
	const mode = useAppSelector(selectMode);

	return mode === 'edit' ? <FormProjectDetails /> : <ViewProjectDetails />;
}
