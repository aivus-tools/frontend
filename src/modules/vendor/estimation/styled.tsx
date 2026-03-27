'use client';

import { Flex, InputNumber } from 'antd';
import { cloneElement, ComponentProps, useMemo, useState } from 'react';
import { styled } from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: 10px 30px 30px 30px;
`;
export const Table = styled.div`
  display: grid;
  grid-template-columns: 38px 1fr 90px 160px 50px 105px 40px 50px 30px 65px 80px 75px 20px;
  grid-template-rows: auto auto;
  grid-auto-flow: row;

  & > .estimation-header {
    font-weight: 500;
    color: var(--gray);

    font-size: 10px;
    line-height: 12.19px;
    padding: 8px 0;
    text-align: center;
  }
`;

export const Line = styled.div`
  display: flex;
  border-bottom: 0.5px dashed var(--gray);
`;

export const CategorySection = styled.div`
  grid-column: span 13;
  display: grid;
  grid-template-columns: subgrid;
  position: relative;
  z-index: 1;
  margin-top: 20px;
  margin-bottom: -10px;

  &:nth-child(odd) {
    z-index: 2;
  }

  &:first-of-type {
    margin-top: 0;
  }

  /* Vendor block shadow (columns 1-7) */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: calc(38px + 100% * 0.85);
    max-width: 270px;
    height: 100%;
    box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
    border-radius: 6px;
    pointer-events: none;
    z-index: -1;
  }

  /* Client block shadow (columns 9-13) */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 270px;
    height: 100%;
    box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
    border-radius: 6px;
    pointer-events: none;
    z-index: -1;
  }
`;

export const EstimationItem = styled.div<{ $hovered?: boolean; $focused?: boolean }>`
  text-align: center;
  background-color: ${({ $hovered }) => ($hovered ? 'var(--bg-blue-subsection)' : 'var(--white)')};

  font-weight: 500;
  font-size: 13px;
  line-height: 15.85px;
  padding: 4px 2px;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const DropdownButton = styled.div`
  cursor: pointer;
`;

export const SelectWrapper = styled(Flex) <{ $hovered?: boolean }>`
  gap: 5px;
  width: 100%;

  span.ant-select-arrow {
    ${({ $hovered }) => ($hovered ? '' : 'color: transparent;')};
  }
`;
export const UnitSelect = styled(SelectWrapper)`
  .ant-select-selection-item {
    text-align: left;
  }
`;

export const IconPlaceholder = styled.div`
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const IconButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`;

export const InputNumberStyled = styled(InputNumber)`
  .ant-input-number-input-wrap input.ant-input-number-input {
    text-align: right;
    padding: 4px;
  }
`;

// Summary row wrappers with shadows and overlapping
export const SummaryRowWrapper = styled.div`
  grid-column: span 13;
  display: grid;
  grid-template-columns: subgrid;
  position: relative;
  margin-top: 20px;
  margin-bottom: -8px;
  z-index: 3;

  /* Vendor block shadow */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: calc(38px + 100% * 0.55);
    max-width: 270px;
    height: 100%;
    box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
    border-radius: 6px;
    pointer-events: none;
    z-index: -1;
  }

  /* Client block shadow */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 270px;
    height: 100%;
    box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
    border-radius: 6px;
    pointer-events: none;
    z-index: -1;
  }
`;

export const UnforeseenRowWrapper = styled(SummaryRowWrapper)`
  z-index: 2;
  min-height: 50px;
  margin-top: 0;
  &::before, &::after {
    box-shadow: none;
  }
`;

export const GrandTotalRowWrapper = styled(SummaryRowWrapper)`
  z-index: 1;
  margin-top: 0;
`;

export const InputNumberRight = ((props: ComponentProps<typeof InputNumber> = {}) => {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const handlers = useMemo(() => {
    return {
      variant: focused || hovered ? ('outlined' as const) : ('borderless' as const),
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    };
  }, [focused, hovered]);

  return cloneElement(<InputNumberStyled />, { ...handlers, ...props });
}) as typeof InputNumber;
