'use client';

import type { Category } from '@/types/estimation.interface';
import { Entries } from './Entries/Entries';
import { useExpandedKeys } from '../context/expanded';
import { SubTitle } from './Title/SubTitle';
import { selectOffersByCategoryId, selectTotalSumByCategoryId } from '@/store/slices/offer/selectors';
import { RootState } from '@/store/store';
import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { SubTotal } from './Total/SubTotal';
import { KEY_SEPARATOR } from '../constants';

export function SubCategory({ subCategory }: { subCategory: Category }) {
  const { keys } = useExpandedKeys();
  const key = `${subCategory.parentCategoryId}${KEY_SEPARATOR}${subCategory.id}`;
  const isOpen = keys?.includes(key);
  const offers = useAppSelector(
    useCallback((state: RootState) => selectOffersByCategoryId(state, subCategory.id), [subCategory.id])
  );

  const { total, clientTotal } = useAppSelector(
    useCallback((state: RootState) => selectTotalSumByCategoryId(state, subCategory.id), [subCategory.id])
  );

  return (
    <>
      <SubTitle text={subCategory.name} itemKey={key} value={`$ ${total}`} clientValue={`$ ${clientTotal}`} />
      {isOpen && (
        <>
          <Entries data={offers} />
          <SubTotal value={`$ ${total}`} clientValue={`$ ${clientTotal}`} subCategoryId={subCategory.id} />
        </>
      )}
    </>
  );
}
