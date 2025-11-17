'use client';

import { Header } from './componnets/Header';
import { HoverProvider } from './context/hover';
import { Category } from './componnets/Category';
import { KeysProvider } from './context/expanded';
import { Wrapper, Table } from './styled';
import Spinner from '@/components/Spinner';
import { Summary } from './componnets/Summary/Summary';
import { useAppSelector } from '@/store/hooks';
import { selectIsExternal, selectRootCategories } from '@/store/slices/offer/selectors';
import { AddButton } from './componnets/AddButton';
import { useLoadData } from './hooks/useLoadData';
import { useSetExternal } from './hooks/useSetExternal';

interface EstimationProps {
  external?: boolean;
  clientView?: boolean;
}

export function Estimation({ external, clientView = false }: EstimationProps) {
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
            <Header clientView={clientView} />
            {categories.map((category) => (
              <Category key={category.id} category={category} clientView={clientView} />
            ))}
            {!clientView && <AddButton hasData={hasData} />}
            {hasData && <Summary clientView={clientView} />}
          </Table>
        </Wrapper>
      </HoverProvider>
    </KeysProvider>
  );
}
