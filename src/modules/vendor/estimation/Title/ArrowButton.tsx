'use client';

import { styled } from 'styled-components';
import ArrowIcon from '@/icons/arrow-icon.svg';

const ArrowButtonWrapper = styled.div<{ $isOpen: boolean }>`
  margin: 0 8px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  transform: rotate(${({ $isOpen }) => ($isOpen ? '0deg' : '270deg')});
`;

export const ArrowButton = ({ isOpen, onClick }: { isOpen: boolean; onClick?: () => void }) => (
  <ArrowButtonWrapper $isOpen={isOpen} onClick={onClick}>
    <ArrowIcon />
  </ArrowButtonWrapper>
);
