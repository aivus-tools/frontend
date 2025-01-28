import { NEW_BRIEF_SLUG } from '@/lib/constants';
import { useAppSelector } from '@/lib/hooks';
import { selectProjectId } from '@/store/slices/project';
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
	const projectId = useAppSelector(selectProjectId);

	return useSWR<Brief>(projectId === NEW_BRIEF_SLUG ? null : `/service/briefs/${projectId}`, getBrief);
};
