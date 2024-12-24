import { auth } from '@/auth';
import { ModalProvider } from '@/context/ModalContext';
import { ReduxStore } from '@/providers/Redux';
import { ROLES } from '@/services/constants';
import { Roles } from '@/services/types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

	if (!session) {
		redirect('/auth');
	}

	const role = (await cookies()).get('role')?.value as Roles | undefined;

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
