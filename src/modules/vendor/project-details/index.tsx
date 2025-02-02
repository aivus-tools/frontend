'use client';

import { useAppSelector } from '@/lib/hooks';
import { selectMode } from '@/store/slices/project';
import dynamic from 'next/dynamic';

const FormProjectDetails = dynamic(() => import('./form/Details'), { ssr: false });
const ViewProjectDetails = dynamic(() => import('./view/Details'), { ssr: false });

export default function Page() {
	const mode = useAppSelector(selectMode);

	return mode === 'edit' ? <FormProjectDetails /> : <ViewProjectDetails />;
}
