'use client';

import { Header } from './components/Header';
import { HoverProvider } from './context/hover';
import { Category } from './components/Category';
import { KeysProvider } from './context/expanded';
import { Wrapper, Table } from './styled';
import Spinner from '@/components/Spinner';
import { Summary } from './components/Summary/Summary';
import { useAppSelector } from '@/store/hooks';
import { selectIsExternal, selectRootCategories } from '@/store/slices/offer/selectors';
import { AddButton } from './components/AddButton';
import { useLoadData } from './hooks/useLoadData';
import { useSetExternal } from './hooks/useSetExternal';

export function Estimation({ external }: { external?: boolean }) {
  useSetExternal(external);
  const isExternal = useAppSelector(selectIsExternal);
  const categories = useAppSelector(selectRootCategories);
  const isLoading = useLoadData(external);
  const hasData = categories.length > 0;

  if (isLoading || (external && !isExternal)) {
    return <Spinner />;
  }

  return (
    <KeysProvider>
      <HoverProvider>
        <Wrapper>
          <Table>
            <Header />
            {categories.map((category) => (
              <Category key={category.id} category={category} />
            ))}
            <AddButton hasData={hasData} />
            {hasData && <Summary />}
          </Table>
        </Wrapper>
      </HoverProvider>
    </KeysProvider>
  );
}
