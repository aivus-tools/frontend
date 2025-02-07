import { useAppSelector } from '@/lib/hooks';
import { selectIsNewBrief, selectProjectId } from '@/store/slices/project';
import { Brief } from '@/types/brief';
import useSWR from 'swr';

async function getBrief(url: string): Promise<Brief> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.json();
}

export const useBrief = () => {
	const isNew = useAppSelector(selectIsNewBrief);
	const projectId = useAppSelector(selectProjectId);

	return useSWR<Brief>(isNew ? null : `/service/briefs/${projectId}`, getBrief);
};
