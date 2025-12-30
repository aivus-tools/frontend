'use client';

import type { Category } from '@/types/estimation.interface';
import { Entries } from './Entries';
import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { SubTitle } from '@/modules/vendor/estimation/componnets/Title/SubTitle';
import { SubTotal } from './SubTotal';
import { selectOffersByCategoryId, selectTotalSumByCategoryId } from '@/store/slices/offer/selectors';
import { RootState } from '@/store/store';
import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { KEY_SEPARATOR } from '@/modules/vendor/estimation/constants';

export function SubCategory({ subCategory }: { subCategory: Category }) {
  const { keys } = useExpandedKeys();
  const key = `${subCategory.parentCategoryId}${KEY_SEPARATOR}${subCategory.id}`;
  const isOpen = keys?.includes(key);
  const offers = useAppSelector(
    useCallback((state: RootState) => selectOffersByCategoryId(state, subCategory.id), [subCategory.id])
  );

  const { clientTotal } = useAppSelector(
    useCallback((state: RootState) => selectTotalSumByCategoryId(state, subCategory.id), [subCategory.id])
  );

  return (
    <>
      <SubTitle text={subCategory.name} itemKey={key} value={`$ ${clientTotal}`} clientValue={`$ ${clientTotal}`} />
      {isOpen && (
        <>
          <Entries data={offers} />
          <SubTotal clientTotal={clientTotal} subCategoryId={subCategory.id} name={subCategory.name} />
        </>
      )}
    </>
  );
}

