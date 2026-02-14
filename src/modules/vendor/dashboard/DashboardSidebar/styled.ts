'use client';

import { styled, css } from 'styled-components';

export const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  font-family: 'Montserrat', sans-serif;
  color: #ffffff;
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  margin-bottom: 16px;
`;

export const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.65);
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 500;

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }
`;

export const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.35);
  font-size: 14px;
`;

export const FilterIcon = styled.div`
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.35);
  font-size: 14px;
  cursor: pointer;

  &:hover {
    color: rgba(255, 255, 255, 0.65);
  }
`;

export const Separator = styled.div`
  border-top: 1px dashed rgba(255, 255, 255, 0.15);
  margin: 12px 0;
`;

export const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(255, 255, 255, 0.4);
  padding: 8px 12px 4px;
`;

export const SidebarItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  color: rgba(255, 255, 255, 0.75);
  position: relative;

  ${({ $active }) =>
    $active
      ? css`
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-weight: 600;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 6px;
            bottom: 6px;
            width: 3px;
            border-radius: 0 2px 2px 0;
            background: #1677ff;
          }
        `
      : css`
          &:hover {
            background: rgba(255, 255, 255, 0.06);
            color: #ffffff;
          }
        `}
`;

export const ItemIcon = styled.span`
  display: flex;
  align-items: center;
  font-size: 14px;
  width: 16px;
  justify-content: center;
  opacity: 0.7;
`;

export const ItemCount = styled.span`
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
`;
