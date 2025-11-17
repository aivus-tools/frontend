'use client';

import type { Category as TypeCategory } from '@/types/estimation.interface';
import { Entries } from './Entries';
import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { Total } from './Total';
import { Title } from './Title';
import { SubCategory } from './SubCategory';
import { useAppSelector } from '@/store/hooks';
import { selectOffersByCategoryId, selectSubcategoryById, selectTotalSumByCategoryId } from '@/store/slices/offer/selectors';
import { useCallback } from 'react';
import { RootState } from '@/store/store';

export function Category({ category }: { category: TypeCategory }) {
  const { keys } = useExpandedKeys();
  const key = `${category.id}`;
  const isOpen = keys?.includes(key);
  const subCategories = useAppSelector(
    useCallback((state: RootState) => selectSubcategoryById(state, category.id), [category.id])
  );
  const offers = useAppSelector(
    useCallback((state: RootState) => selectOffersByCategoryId(state, category.id), [category.id])
  );

  const { clientTotal } = useAppSelector(
    useCallback((state: RootState) => selectTotalSumByCategoryId(state, category.id), [category.id])
  );

  return (
    <>
      <Title category={category} itemKey={key} clientTotal={clientTotal} />
      {isOpen && (
        <>
          {subCategories?.map((subCategory) => (
            <SubCategory key={`${key}${subCategory.id}`} subCategory={subCategory} />
          ))}
          <Entries data={offers} />
          <Total text={category.name} clientTotal={clientTotal} />
        </>
      )}
      <div style={{ gridColumn: 'span 13', padding: '15px' }} />
    </>
  );
}

