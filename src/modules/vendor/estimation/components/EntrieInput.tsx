'use client';

import { Input } from 'antd';
import { OfferData } from '@/types/estimation.interface';
import { LibraryDropdown } from './LibraryDropdown/LibraryDropdown';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAllCategories } from '@/store/slices/offer/selectors';
import { addOfferRow, removeOfferRow } from '@/store/slices/offer/slice';
import { useExpandedKeys } from '../context/expanded';
import { KEY_SEPARATOR } from '../constants';
import { useRateLookup } from '@/hooks/useRateLookup';

import styles from './EntrieInput.module.css';

interface EntrieInputProps {
  value: OfferData;
  variant?: 'borderless' | 'outlined';
}

export const EntrieInput = (props: EntrieInputProps) => {
  const dispatch = useAppDispatch();
  const allCategories = useAppSelector(selectAllCategories);
  const { addKey } = useExpandedKeys();
  const lookupPrice = useRateLookup();

  const handleSelect = (offer: OfferData) => {
    const ratePrice = lookupPrice(offer.entryId);
    const offerWithRate = ratePrice !== null ? { ...offer, price: ratePrice } : offer;
    dispatch(removeOfferRow(props.value.id));
    dispatch(addOfferRow(offerWithRate));
    const category = allCategories.find((cat) => cat.id === offer.categoryId);
    if (!category) {
      return;
    }
    const parentCategory = allCategories.find((cat) => cat.id === category.parentCategoryId);
    if (parentCategory) {
      addKey(`${parentCategory.id}${KEY_SEPARATOR}${category.id}`);
      addKey(`${parentCategory.id}`);
    } else {
      addKey(`${category.id}`);
    }
  };

  return (
    <div className={styles.dropdownWrapper}>
      <LibraryDropdown
        value={props.value}
        onSelect={handleSelect}
        componentAction={({ handleChange, handleBlur, handleFocus, value }) => (
          <Input
            className={styles.input}
            placeholder={value}
            variant={props.variant}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
        )}
      />
    </div>
  );
};
