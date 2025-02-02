import { auth, signOut } from '@/auth';
import { ReduxStore } from '@/context/Redux';
import { ROLES } from '@/lib/constants';

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
	const { role } = session?.user ?? {};

	const getComponent = () => {
		switch (role) {
			case ROLES.vendor:
				return vendor;
			case ROLES.client:
				return client;
			case ROLES.unconfirmed:
				return unknown;
			default: {
				signOut();
				return null;
			}
		}
	};

	return <ReduxStore>{getComponent()}</ReduxStore>;
}
