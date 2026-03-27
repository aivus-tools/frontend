import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAllCategories } from '@/store/slices/offer/selectors';
import { addOfferRow } from '@/store/slices/offer/slice';
import { useCallback } from 'react';
import { useExpandedKeys } from '../context/expanded';
import { OfferData } from '@/types/estimation.interface';
import { KEY_SEPARATOR } from '../constants';
import { useRateLookup } from '@/hooks/useRateLookup';

export const useSelectOffer = () => {
  const dispatch = useAppDispatch();
  const allCategories = useAppSelector(selectAllCategories);
  const { addKey } = useExpandedKeys();
  const lookupPrice = useRateLookup();

  return useCallback(
    (offer: OfferData) => {
      const ratePrice = lookupPrice(offer.entryId);
      const offerWithRate = ratePrice !== null ? { ...offer, price: ratePrice } : offer;
      dispatch(addOfferRow(offerWithRate));
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
    [addKey, allCategories, dispatch, lookupPrice]
  );
};
