import { Brief } from '@/types/brief';
import useSWR from 'swr';

async function getBriefs(url: string): Promise<Brief[]> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.json();
}

export const useBriefs = () => {
	return useSWR<Brief[]>('/service/briefs', getBriefs);
};
