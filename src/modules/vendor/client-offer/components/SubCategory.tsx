'use client';

import React, { useCallback } from 'react';
import type { Category as TypeCategory } from '@/types/estimation.interface';
import { useExpandedKeys } from '@/modules/vendor/estimation/context/expanded';
import { useAppSelector } from '@/store/hooks';
import { selectOffersByCategoryId, selectTotalSumByCategoryId } from '@/store/slices/offer/selectors';
import { RootState } from '@/store/store';
import { KEY_SEPARATOR } from '@/modules/vendor/estimation/constants';
import { SubTitle } from '@/modules/vendor/client-offer/components/Title/SubTitle';
import { Entries } from '@/modules/vendor/client-offer/components/Entries';
import { SubTotal } from '@/modules/vendor/client-offer/components/Total/SubTotal';

export function SubCategory({ subCategory }: { subCategory: TypeCategory }) {
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
      <SubTitle text={subCategory.name} itemKey={key} value={`$ ${clientTotal}`} />
      {isOpen && (
        <>
          <Entries data={offers} />
          <SubTotal
            value={`$ ${clientTotal}`}
            subCategoryId={subCategory.id}
            name={subCategory.name}
          />
        </>
      )}
    </>
  );
}
