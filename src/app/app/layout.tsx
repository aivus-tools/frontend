import { ModalProvider } from '@/context/ModalContext';
import { ReduxStore } from '@/providers/Redux';
import { ROLES } from '@/services/constants';
import { redirect } from 'next/navigation';
import { getSessionInfo } from '../lib/session';

export default async function Layout({
	vendor,
	client,
	unknown,
}: {
	vendor: React.ReactNode;
	client: React.ReactNode;
	unknown: React.ReactNode;
}) {
	const session = await getSessionInfo();

	if (!session) {
		redirect('/auth');
	}

	const { role } = session;

	const getComponent = () => {
		switch (role) {
			case ROLES.vendor:
				return vendor;
			case ROLES.client:
				return client;
			case ROLES.unconfirmed:
				return unknown;
			default:
				return <div>{`Wrong role ${role}`}</div>;
		}
	};

	return (
		<ReduxStore>
			<ModalProvider>{getComponent()}</ModalProvider>
		</ReduxStore>
	);
}
