'use client';

import { Flex, Input } from 'antd';
import AddIcon from '@/icons/add-icon.svg';
import { useSelectOffer } from '@/modules/vendor/estimation/hooks/useSelectOffer';
import { LibraryDropdown } from '../LibraryDropdown/LibraryDropdown';
import { filterOptionsBySetOfId } from '@/modules/vendor/estimation/helpers/filters';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectSubcategoryById } from '@/store/slices/offer/selectors';
import { RootState } from '@/store/store';
import { t } from '@/lib/i18n';

import styles from './Total.module.css';

interface TotalProps {
  text: string;
  value: string;
  clientValue: string;
  categoryId?: string;
}

export const Total = (props: TotalProps) => {
  const handleSelect = useSelectOffer();
  const subCategories = useAppSelector(
    useCallback((state: RootState) => selectSubcategoryById(state, props.categoryId), [props.categoryId])
  );
  const categorySet = useMemo(() => {
    const set = new Set<string>();
    if (props.categoryId) {
      set.add(props.categoryId);
    }
    subCategories?.forEach((subCategory) => {
      if (subCategory.id) {
        set.add(subCategory.id);
      }
    });
    return set;
  }, [props.categoryId, subCategories]);
  const handleFilter = useMemo(() => filterOptionsBySetOfId(categorySet), [categorySet]);

  return (
    <>
      <Flex
        align='center'
        justify='center'
        style={{ backgroundColor: 'var(--bg-blue-important)', borderRadius: '0 0 0 6px' }}
      >
        <AddIcon color={'var(--gray-light)'} />
      </Flex>
      <div className={styles.wrapper} style={{ gridColumn: 'span 6' }}>
        <Flex>
          <LibraryDropdown
            onSelect={handleSelect}
            filterOptions={handleFilter}
            componentAction={({ handleChange, handleBlur, handleFocus, value }) => (
              <Input
                placeholder={t('ADD_ITEM')}
                variant='borderless'
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
              />
            )}
          />
        </Flex>
        <Flex>
          <div className={styles.label} style={{ marginRight: '16px' }}>
            {props.text} {t('TOTAL')}:
          </div>
          <div className={styles.totalSum}>{props.value}</div>
        </Flex>
      </div>
      <div />
      <Flex style={{ gridColumn: 'span 4', backgroundColor: 'var(--bg-blue-important)' }} justify='flex-end'>
        <div className={styles.totalSum}>{props.clientValue}</div>
      </Flex>
      <div className={styles.emptyBlock} style={{ gridColumn: 'span 1' }} />
    </>
  );
};
