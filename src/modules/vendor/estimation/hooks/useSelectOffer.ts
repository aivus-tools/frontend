import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addOfferRow, selectAllCategories } from '@/store/slices/offer';
import { useCallback } from 'react';
import { useExpandedKeys } from '../context/expanded';
import { OfferData } from '../types';

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
				addKey(`${parentCategory.id}-${category.id}`);
				addKey(`${parentCategory.id}`);
			} else {
				addKey(`${category.id}`);
			}
		},
		[addKey, allCategories, dispatch]
	);
};
