'use client';

import { Header } from './Header';
import { HoverProvider } from './context/hover';
import { Category } from './Category';
import { KeysProvider } from './context/expanded';
import { Wrapper, Table } from './styled';
import Spinner from '@/components/Spinner';
import { Summary } from './Summary';
import { useOffers } from '@/hooks/useOffers';

export function Estimation() {
	const { loading, data } = useOffers();

	if (loading) {
		return <Spinner />;
	}

	return (
		<KeysProvider>
			<HoverProvider>
				<Wrapper>
					<Table>
						<Header />
						{data?.map((category) => <Category key={category.id} category={category} />)}
						<Summary />
					</Table>
				</Wrapper>
			</HoverProvider>
		</KeysProvider>
	);
}
