'use client';

import type { Category } from '@/types/estimation.interface';
import { Entries } from './Entries/Entries';
import { useExpandedKeys } from '../context/expanded';
import { SubTitle } from './Title/SubTitle';
import {
  selectOffersByCategoryId,
  selectTotalSumByCategoryId,
  selectVisibilityMap,
} from '@/store/slices/offer/selectors';
import { RootState } from '@/store/store';
import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { SubTotal } from './Total/SubTotal';

export function SubCategory({ subCategory }: { subCategory: Category }) {
  const { keys } = useExpandedKeys();
  const key = `${subCategory.parentCategoryId}-${subCategory.id}`;
  const isOpen = keys?.includes(key);
  const visibilityMap = useAppSelector(selectVisibilityMap);

  const offers = useAppSelector(
    useCallback((state: RootState) => selectOffersByCategoryId(state, subCategory.id), [subCategory.id])
  );

  const { total, clientTotal } = useAppSelector(
    useCallback((state: RootState) => selectTotalSumByCategoryId(state, subCategory.id), [subCategory.id])
  );

  // Проверяем видимость подкатегории
  const subCategoryKey = `subcategory-${subCategory.id}`;
  const isSubCategoryVisible = visibilityMap[subCategoryKey] !== false;

  // Фильтруем offers по видимости
  const visibleOffers = offers.filter((offer) => {
    const offerKey = `offer-${offer.id}`;
    return visibilityMap[offerKey] !== false;
  });

  // Если подкатегория скрыта, не отображаем её
  if (!isSubCategoryVisible) {
    return null;
  }

  return (
    <>
      <SubTitle text={subCategory.name} itemKey={key} value={`$ ${total}`} clientValue={`$ ${clientTotal}`} />
      {isOpen && (
        <>
          <Entries data={visibleOffers} />
          <SubTotal value={`$ ${total}`} clientValue={`$ ${clientTotal}`} subCategoryId={subCategory.id} />
        </>
      )}
    </>
  );
}
