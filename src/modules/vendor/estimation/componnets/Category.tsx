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
  selectVisibilityMap,
} from '@/store/slices/offer/selectors';
import { useCallback } from 'react';
import { RootState } from '@/store/store';

export function Category({ category }: { category: TypeCategory }) {
  const { keys } = useExpandedKeys();
  const key = `${category.id}`;
  const isOpen = keys?.includes(key);
  const visibilityMap = useAppSelector(selectVisibilityMap);

  const subCategories = useAppSelector(
    useCallback((state: RootState) => selectSubcategoryById(state, category.id), [category.id])
  );
  const offers = useAppSelector(
    useCallback((state: RootState) => selectOffersByCategoryId(state, category.id), [category.id])
  );

  const { total, clientTotal } = useAppSelector(
    useCallback((state: RootState) => selectTotalSumByCategoryId(state, category.id), [category.id])
  );

  // Проверяем видимость категории
  const categoryKey = `category-${category.id}`;
  const isCategoryVisible = visibilityMap[categoryKey] !== false;

  // Фильтруем подкатегории по видимости
  const visibleSubCategories = subCategories.filter((subCategory) => {
    const subCategoryKey = `subcategory-${subCategory.id}`;
    return visibilityMap[subCategoryKey] !== false;
  });

  // Фильтруем offers по видимости
  const visibleOffers = offers.filter((offer) => {
    const offerKey = `offer-${offer.id}`;
    return visibilityMap[offerKey] !== false;
  });

  // Если категория скрыта, не отображаем её
  if (!isCategoryVisible) {
    return null;
  }

  return (
    <>
      <Title category={category} itemKey={key} value={`$ ${total}`} clientValue={`$ ${clientTotal}`} />
      {isOpen && (
        <>
          {visibleSubCategories?.map((subCategory) => (
            <SubCategory key={`${key}${subCategory.id}`} subCategory={subCategory} />
          ))}
          <Entries data={visibleOffers} />
          <Total text={category.name} value={`$ ${total}`} clientValue={`$ ${clientTotal}`} categoryId={category.id} />
        </>
      )}
      <div style={{ gridColumn: 'span 13', padding: '15px' }} />
    </>
  );
}
