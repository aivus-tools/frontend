import { auth, signOut } from '@/auth';
import { ModalProvider } from '@/context/ModalContext';
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
				console.error('Unknown role:', role);
				signOut();
				return null;
			}
		}
	};

	return (
		<ReduxStore>
			<ModalProvider>{getComponent()}</ModalProvider>
		</ReduxStore>
	);
}
