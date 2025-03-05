import { PropsWithChildren } from 'react';
import { GroupSwitch } from './_components/group-switch';

export default function Layout({ children }: PropsWithChildren) {
	return <GroupSwitch>{children}</GroupSwitch>;
}
