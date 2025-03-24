'use client';

import { Header } from './Header';
import { HoverProvider } from './context/hover';
import { Category } from './Category';
import { KeysProvider } from './context/expanded';
import { Wrapper, Table } from './styled';
// import Spinner from '@/components/Spinner';
import { Summary } from './Summary';
import { useAppSelector } from '@/lib/hooks';
import { selectRootCategories } from '@/store/slices/offer';
import { AddButton } from './AddButton';

export function Estimation() {
	const categories = useAppSelector(selectRootCategories);

	const hasData = categories.length > 0;

	// if (loading) {
	// return <Spinner />;
	// }

	return (
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
	);
}
