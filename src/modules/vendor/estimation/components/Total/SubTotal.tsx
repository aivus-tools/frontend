'use client';

import { Flex, Input } from 'antd';
import AddIcon from '@/icons/add-icon.svg';
import { LibraryDropdown } from '../LibraryDropdown/LibraryDropdown';
import { useSelectOffer } from '@/modules/vendor/estimation/hooks/useSelectOffer';
import { useMemo } from 'react';
import { t } from '@/lib/i18n';
import { filterOptionsById } from '@/modules/vendor/estimation/helpers/filters';

import styles from './SubTotal.module.css';

interface SubTotalProps {
  value: string;
  clientValue: string;
  subCategoryId?: string;
  name?: string;
}

export const SubTotal = (props: SubTotalProps) => {
  const handleSelect = useSelectOffer();
  const handleFilter = useMemo(() => filterOptionsById(props.subCategoryId), [props.subCategoryId]);
  const name = props.name ?? '';

  return (
    <>
      <Flex
        align='center'
        justify='center'
        style={{ backgroundColor: 'var(--bg-blue-subtotal)', borderRadius: '0 0 0 6px' }}
      >
        <AddIcon color={'var(--gray-light)'} />
      </Flex>
      <Flex align='center' className={styles.label}>
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
      <div className={styles.labelSubTotal} style={{ gridColumn: 'span 3' }}>
        {t('SUBTOTAL_OF_LOCATIONS', name.toLowerCase())}
      </div>
      <div className={styles.subTotalSum}>{props.value}</div>
      <div className={styles.emptyBlockSubTotalSum} style={{ borderRadius: ' 0 0 6px 0' }} />
      <div />
      <Flex style={{ gridColumn: 'span 4' }}>
        <div className={styles.subTotalSum}>{props.clientValue}</div>
      </Flex>
      <div className={styles.emptyBlockSubTotalSum} style={{ gridColumn: 'span 1' }} />
    </>
  );
};
