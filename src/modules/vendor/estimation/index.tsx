'use client';

import { Header } from './Header';
import { HoverProvider } from './context/hover';
import { Category } from './Category';
import { KeysProvider } from './context/expanded';
import { Wrapper, Table } from './styled';
import Spinner from '@/components/Spinner';
import { Summary } from './Summary/Summary';
import { useAppSelector } from '@/lib/hooks';
import { selectIsExternal, selectRootCategories } from '@/store/slices/offer/selectors';
import { AddButton } from './AddButton';
import { DrawerOfferProvider } from './context/drawer';
import { useLoadData } from './hooks/useLoadData';
import { useSetExternal } from './hooks/useSetExternal';

export function Estimation({ external }: { external?: boolean }) {
	useSetExternal(external);
	const isExternal = useAppSelector(selectIsExternal);
	const categories = useAppSelector(selectRootCategories);
	const isLoading = useLoadData(external);
	const hasData = categories.length > 0;

	if (isLoading || (external === true && !isExternal)) {
		return <Spinner />;
	}

	return (
		<DrawerOfferProvider>
			<KeysProvider>
				<HoverProvider>
					<Wrapper>
						<Table>
							<Header />
							{categories.map((category) => (
								<Category key={category.id} category={category} />
							))}
							{hasData && <Summary />}
						</Table>
					</Wrapper>
					{!hasData && <AddButton />}
				</HoverProvider>
			</KeysProvider>
		</DrawerOfferProvider>
	);
}
