import { auth, signOut } from '@/auth';
import { ReduxStore } from '@/context/Redux';
import { GROUPS } from '@/lib/constants';

export default async function Layout({
	vendor,
	client,
	unknown,
}: {
	vendor: React.ReactNode;
	client: React.ReactNode;
	unknown: React.ReactNode;
}) {
	const session = await auth();
	const { group } = session?.user ?? {};

	const getComponent = () => {
		switch (group) {
			case GROUPS.vendor:
				return vendor;
			case GROUPS.client:
				return client;
			case GROUPS.unconfirmed:
				return unknown;
			default: {
				signOut();
				return null;
			}
		}
	};

	return <ReduxStore>{getComponent()}</ReduxStore>;
}
