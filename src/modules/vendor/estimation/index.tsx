'use client';

import { Header } from './Header';
import { HoverProvider } from './context/hover';
import { Category } from './Category';
import { KeysProvider } from './context/expanded';
import { Wrapper, Table } from './styled';
import { useCategories } from '@/hooks/useCategories';
import Spinner from '@/components/Spinner';
import { Summary } from './Summary';

export function Estimation() {
	const { loading, data: categories } = useCategories();

	if (loading) {
		return <Spinner />;
	}

	return (
		<KeysProvider>
			<HoverProvider>
				<Wrapper>
					<Table>
						<Header />
						{categories
							?.filter(({ parentCategoryId }) => !parentCategoryId)
							.map((category) => <Category key={category.id} category={category} />)}
						<Summary />
					</Table>
				</Wrapper>
			</HoverProvider>
		</KeysProvider>
	);
}
