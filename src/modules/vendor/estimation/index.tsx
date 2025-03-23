'use client';

import { Header } from './Header';
import { HoverProvider } from './context/hover';
import { Category } from './Category';
import { KeysProvider } from './context/expanded';
import { Wrapper, Table } from './styled';
// import Spinner from '@/components/Spinner';
import { Summary } from './Summary';
import { useAppSelector } from '@/lib/hooks';
import { selectOfferDetails } from '@/store/slices/offer';
import { AddButton } from './AddButton';
// import { useOffers } from '@/hooks/useOffers';

export function Estimation() {
	const offerDetails = useAppSelector(selectOfferDetails);
	// const { loading, data } = useOffers();

	// if (loading) {
	// return <Spinner />;
	// }

	return (
		<KeysProvider>
			<HoverProvider>
				<AddButton />
				<Wrapper>
					<Table>
						<Header />
						{offerDetails?.map((category) => <Category key={category.id} category={category} />)}
						<Summary />
					</Table>
				</Wrapper>
			</HoverProvider>
		</KeysProvider>
	);
}
