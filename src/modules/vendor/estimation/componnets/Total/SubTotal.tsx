'use client';

import { Flex, Input } from 'antd';
import { styled } from 'styled-components';
import AddIcon from '@/icons/add-icon.svg';
import { LibraryDropdown } from '../LibraryDropdown/LibraryDropdown';
import { useSelectOffer } from '../../hooks/useSelectOffer';
import { useMemo } from 'react';
import { t } from '@/lib/i18n';
import { filterOptionsById } from '../../helpers/filters';

const LabelSubTotal = styled.div`
  font-weight: 600;
  font-size: 13px;
  line-height: 15.85px;
  text-align: right;
  padding: 12px 0;
  background-color: var(--bg-blue-subtotal);
`;
const SubTotalSum = styled.div`
  width: 100%;
  padding: 12px 0;
  font-weight: 700;
  font-size: 14px;
  line-height: 17.07px;
  border-radius: 0 0 6px 6px;
  text-align: right;
  color: var(--blue);
  background-color: var(--bg-blue-subtotal);
  justify-content: flex-end;
`;

const EmptyBlockSubTotalSum = styled.div`
  background-color: var(--bg-blue-subtotal);
  border-radius: 0 0 6px 6px;
`;

const Label = styled(Flex)`
  font-weight: 500;
  font-size: 10px;
  line-height: 100%;
  vertical-align: middle;
  background-color: var(--bg-blue-subtotal);
  color: var(--gray);
  cursor: pointer;
`;

interface Props {
  value: string;
  clientValue: string;
  subCategoryId?: number;
}

export const SubTotal = ({ value, clientValue, subCategoryId }: Props) => {
  const handleSelect = useSelectOffer();
  const handleFilter = useMemo(() => filterOptionsById(subCategoryId), [subCategoryId]);

  return (
    <>
      <Flex
        align='center'
        justify='center'
        style={{ backgroundColor: 'var(--bg-blue-subtotal)', borderRadius: '0 0 0 6px' }}
      >
        <AddIcon color={'var(--gray-light)'} />
      </Flex>
      <Label align='center'>
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
      </Label>
      <LabelSubTotal style={{ gridColumn: 'span 3' }}>{t('SUBTOTAL_OF_LOCATIONS')}</LabelSubTotal>
      <SubTotalSum>{value}</SubTotalSum>
      <EmptyBlockSubTotalSum style={{ borderRadius: ' 0 0 6px 0' }} />
      <div />
      <Flex style={{ gridColumn: 'span 4' }}>
        <SubTotalSum>{clientValue}</SubTotalSum>
      </Flex>
      <EmptyBlockSubTotalSum style={{ gridColumn: 'span 1' }} />
    </>
  );
};
