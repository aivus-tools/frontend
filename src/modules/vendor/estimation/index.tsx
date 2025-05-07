'use client';

import { Header } from './Header';
import { HoverProvider } from './context/hover';
import { Category } from './Category';
import { KeysProvider } from './context/expanded';
import { Wrapper, Table } from './styled';
import Spinner from '@/components/Spinner';
import { Summary } from './Summary/Summary';
import { useAppSelector } from '@/lib/hooks';
import { selectRootCategories } from '@/store/slices/offer/selectors';
import { AddButton } from './AddButton';
import { DrawerOfferProvider } from './context/drawer';
import { categoriesApi } from '@/services/client/categoriesApi';
import { offersApi } from '@/services/client/offersApi';

export function Estimation() {
	const categories = useAppSelector(selectRootCategories);
	const categoriesQuery = categoriesApi.useGetCategoriesQuery();
	const entriesQuery = categoriesApi.useGetEntriesQuery();
	const projectId = useAppSelector((state) => state.project.projectId);
	offersApi.useGetOffersByBriefIdQuery(projectId!, {
		skip: !projectId,
	});

	const hasData = categories.length > 0;

	if (categoriesQuery.isLoading || entriesQuery.isLoading) {
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
