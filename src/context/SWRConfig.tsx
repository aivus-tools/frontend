import { PropsWithChildren } from 'react';
import { SWRConfig as SWRConfigLib } from 'swr';
import { fetcher } from '@/lib/fetcher';

export const SWRConfig = ({ children }: PropsWithChildren) => {
	return (
		<SWRConfigLib
			value={{
				refreshInterval: 3000,
				fetcher,
			}}
		>
			{children}
		</SWRConfigLib>
	);
};
