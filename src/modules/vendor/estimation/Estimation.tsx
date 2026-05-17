'use client';

import { Header } from './components/Header';
import { HoverProvider } from './context/hover';
import { Category } from './components/Category';
import { KeysProvider } from './context/expanded';
import { PageSpinner } from '@/components/PageSpinner';
import { Summary } from './components/Summary/Summary';
import { useAppSelector } from '@/store/hooks';
import { selectIsExternal, selectRootCategories } from '@/store/slices/offer/selectors';
import { AddButton } from './components/AddButton';
import { useLoadData } from './hooks/useLoadData';
import { useSetExternal } from './hooks/useSetExternal';
import { useOfferSync } from '@/hooks/useOfferSync';
import { OfferMetaForm } from './components/OfferMetaForm/OfferMetaForm';

import styles from './estimation.module.css';

export function Estimation({ external }: { external?: boolean }) {
  useSetExternal(external);
  useOfferSync();
  const isExternal = useAppSelector(selectIsExternal);
  const categories = useAppSelector(selectRootCategories);
  const isLoading = useLoadData(external);
  const hasData = categories.length > 0;

  if (isLoading || (external && !isExternal)) {
    return <PageSpinner />;
  }

  return (
    <KeysProvider>
      <HoverProvider>
        <div className={styles.wrapper}>
          <OfferMetaForm />
          <div className={styles.table}>
            <Header />
            {categories.map((category) => (
              <Category key={category.id} category={category} />
            ))}
            <AddButton hasData={hasData} />
            {hasData && <Summary />}
          </div>
        </div>
      </HoverProvider>
    </KeysProvider>
  );
}
