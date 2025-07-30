'use client';

import { Flex, Input } from 'antd';
import { styled } from 'styled-components';
import AddIcon from '@/icons/add-icon.svg';
import { useSelectOffer } from '../hooks/useSelectOffer';
import { LibraryDropdown } from '../LibraryDropdown/LibraryDropdown';
import { filterOptionsBySetOfId } from '../helpers/filters';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectSubcategoryById } from '@/store/slices/offer/selectors';
import { RootState } from '@/store/store';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-blue-important);
  padding-right: 40px;
  gap: 8px;
`;

const Label = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 17.07px;
  letter-spacing: 0;
  text-align: right;
  padding: 16px 0;
  border-radius: 0 0 0 6px;
  text-transform: uppercase;
`;
const TotalSum = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 19.5px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: var(--blue);
  padding: 16px 0;
  min-width: 90px;
`;

const EmptyBlockTotalSum = styled.div`
  background-color: var(--bg-blue-important);
  border-radius: 0 0 6px 6px;
`;

interface Props {
  text: string;
  value: string;
  clientValue: string;
  categoryId?: number;
}

export const Total = ({ text, value, clientValue, categoryId }: Props) => {
  const handleSelect = useSelectOffer();
  const subCategories = useAppSelector(
    useCallback((state: RootState) => selectSubcategoryById(state, categoryId), [categoryId])
  );
  const categorySet = useMemo(() => {
    const set = new Set<number>();
    if (categoryId) {
      set.add(categoryId);
    }
    subCategories?.forEach((subCategory) => {
      if (subCategory.id) {
        set.add(subCategory.id);
      }
    });
    return set;
  }, [categoryId, subCategories]);
  const handleFilter = useMemo(() => filterOptionsBySetOfId(categorySet), [categorySet]);

  return (
    <>
      <Flex
        align='center'
        justify='center'
        style={{ backgroundColor: 'var(--bg-blue-important)', borderRadius: '0 0 0 6px' }}
      >
        <AddIcon />
      </Flex>
      <Wrapper style={{ gridColumn: 'span 6' }}>
        <Flex>
          <LibraryDropdown
            onSelect={handleSelect}
            filterOptions={handleFilter}
            componentAction={({ handleChange, handleBlur, handleFocus, value }) => (
              <Input
                placeholder='add item'
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
          <Label>{text} TOTAL:</Label>
          <TotalSum>{value}</TotalSum>
        </Flex>
      </Wrapper>
      <div />
      <Flex style={{ gridColumn: 'span 4', backgroundColor: 'var(--bg-blue-important)' }} justify='flex-end'>
        <TotalSum>{clientValue}</TotalSum>
      </Flex>
      <EmptyBlockTotalSum style={{ gridColumn: 'span 1' }} />
    </>
  );
};
