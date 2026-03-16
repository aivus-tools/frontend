'use client';

import type { Category as TypeCategory } from '@/types/estimation.interface';
import { Entries } from './Entries/Entries';
import { useExpandedKeys } from '../context/expanded';
import { Total } from './Total/Total';
import { CategoryFees } from './Total/CategoryFees';
import { CategoryExternalMarkup } from './Total/CategoryExternalMarkup';
import { Title } from './Title/Title';
import { SubCategory } from './SubCategory';
import { useAppSelector } from '@/store/hooks';
import {
  selectSubcategoryById,
  selectOffersByCategoryId,
  selectTotalSumByCategoryId,
} from '@/store/slices/offer/selectors';
import { useCallback } from 'react';
import { RootState } from '@/store/store';
import { CategorySection } from '../styled';

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

  const { total, clientTotal } = useAppSelector(
    useCallback((state: RootState) => selectTotalSumByCategoryId(state, category.id), [category.id])
  );

  return (
    <CategorySection>
      <Title category={category} itemKey={key} value={total} clientValue={clientTotal} />
      {isOpen && (
        <>
          {subCategories?.map((subCategory) => (
            <SubCategory key={`${key}${subCategory.id}`} subCategory={subCategory} />
          ))}
          <Entries data={offers} />
          <Total text={category.name} value={total} clientValue={clientTotal} categoryId={category.id} />
          <CategoryFees categoryId={category.id} />
          <CategoryExternalMarkup categoryId={category.id} />
        </>
      )}
    </CategorySection>
  );
}
