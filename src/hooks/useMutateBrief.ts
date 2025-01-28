import useSWRMutation from 'swr/mutation';
import { useSession } from 'next-auth/react';
import { Brief, Details } from '@/types/brief';

async function createBrief(url: string, { arg: body }: { arg: Pick<Brief, 'details' | 'clientId' | 'status'> }) {
	await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
}

async function updateBrief(url: string, { arg: body }: { arg: Brief }) {
	await fetch(`${url}/${body.id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
}

export const useMutateBrief = () => {
	const { trigger: create } = useSWRMutation('/service/briefs', createBrief);
	const { trigger: update } = useSWRMutation('/service/briefs', updateBrief);
	const session = useSession();

	return {
		create: (details: Details) => {
			if (session.data?.user?.id) {
				create({
					status: 'DRAFT',
					details,
					clientId: session.data?.user?.id,
				});
			}
		},
		update,
	};
};
