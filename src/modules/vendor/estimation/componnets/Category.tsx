'use client';

import type { Category as TypeCategory } from '@/types/estimation.interface';
import { Entries } from './Entries/Entries';
import { useExpandedKeys } from '../context/expanded';
import { Total } from './Total/Total';
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

interface CategoryProps {
  category: TypeCategory;
  clientView?: boolean;
}

export function Category({ category, clientView = false }: CategoryProps) {
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
    <>
      <Title
        category={category}
        itemKey={key}
        value={`$ ${total}`}
        clientValue={`$ ${clientTotal}`}
        clientView={clientView}
      />
      {isOpen && (
        <>
          {subCategories?.map((subCategory) => (
            <SubCategory key={`${key}${subCategory.id}`} subCategory={subCategory} clientView={clientView} />
          ))}
          <Entries data={offers} clientView={clientView} />
          <Total
            text={category.name}
            value={`$ ${total}`}
            clientValue={`$ ${clientTotal}`}
            categoryId={category.id}
            clientView={clientView}
          />
        </>
      )}
      <div style={{ gridColumn: 'span 13', padding: '15px' }} />
    </>
  );
}
