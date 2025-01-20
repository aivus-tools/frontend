import useSWRMutation from 'swr/mutation';
import { useSession } from 'next-auth/react';

type BriefReqBody = {
	key: string;
	status: 'DRAFT';
	details: string;
	clientId: string;
};

async function createBrief(url: string, { arg: body }: { arg: BriefReqBody }) {
	await fetch('/service/briefs', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
}

export const useBrief = () => {
	const { trigger } = useSWRMutation('/service/briefs', createBrief);
	const session = useSession();

	return (details: object) => {
		if (session.data?.user?.id) {
			trigger({
				key: Math.random().toString(36).substring(7),
				status: 'DRAFT',
				details: JSON.stringify(details),
				clientId: session.data?.user?.id,
			});
		}
	};
};
