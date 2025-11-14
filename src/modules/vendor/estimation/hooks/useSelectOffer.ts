import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAllCategories } from '@/store/slices/offer/selectors';
import { addOfferRow } from '@/store/slices/offer/slice';
import { useCallback } from 'react';
import { useExpandedKeys } from '../context/expanded';
import { OfferData } from '@/types/estimation.interface';
import { KEY_SEPARATOR } from '../constants';

export const useSelectOffer = () => {
  const dispatch = useAppDispatch();
  const allCategories = useAppSelector(selectAllCategories);
  const { addKey } = useExpandedKeys();

  return useCallback(
    (offer: OfferData) => {
      dispatch(addOfferRow(offer));
      const category = allCategories.find((cat) => cat.id === offer.categoryId);
      if (!category) return;
      const parentCategory = allCategories.find((cat) => cat.id === category.parentCategoryId);
      if (parentCategory) {
        addKey(`${parentCategory.id}${KEY_SEPARATOR}${category.id}`);
        addKey(`${parentCategory.id}`);
      } else {
        addKey(`${category.id}`);
      }
    },
    [addKey, allCategories, dispatch]
  );
};
