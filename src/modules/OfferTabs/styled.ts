'use client';

import { styled, css } from 'styled-components';

export const TabsContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0;
  padding: 0 24px;
  margin-top: 10px;
  border-bottom: 2px solid #e5e5e5;
`;

const tabBase = css`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  position: relative;
  bottom: -2px;
  border: none;
  background: none;
  font-family: 'Montserrat', sans-serif;
  white-space: nowrap;
  user-select: none;
  transition: all 0.15s ease;
`;

export const ActiveTab = styled.button`
  ${tabBase}
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-bottom: 2px solid #ffffff;
  font-weight: 600;
  font-size: 13px;
  color: #2288ff;
`;

export const InactiveTab = styled.button`
  ${tabBase}
  background: #f9f9f9;
  border: 1px solid transparent;
  border-bottom: none;
  font-weight: 500;
  font-size: 13px;
  color: #4b5675;

  &:hover {
    background: #f4fbff;
  }
`;

export const StatusBadge = styled.span<{ $status: 'DRAFT' | 'PUBLISHED' }>`
  height: 18px;
  padding: 0 6px;
  border-radius: 3px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 8px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;

  ${({ $status }) =>
    $status === 'PUBLISHED'
      ? css`
          background: #f4fbdb;
          border: 0.6px solid #a5c500;
          color: #a5c500;
        `
      : css`
          background: #f9f9f9;
          border: 0.6px solid #99a1b7;
          color: #99a1b7;
        `}
`;

export const CloseButton = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  color: #99a1b7;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: #d63c22;
    opacity: 1;
  }
`;

export const TabWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;

  &:hover ${CloseButton} {
    opacity: 0.4;
  }
`;

export const NewOfferTab = styled.button`
  ${tabBase}
  color: #2288ff;
  font-weight: 600;
  font-size: 13px;
  border: 1.5px dashed rgba(34, 136, 255, 0.4);
  border-bottom: none;
  background: transparent;
  height: 100%;

  &:hover {
    background: #f4fbff;
    border-color: rgba(34, 136, 255, 0.7);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background: transparent;
      border-color: rgba(34, 136, 255, 0.4);
    }
  }
`;

export const RenameInput = styled.input`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #2288ff;
  border: 1px solid #2288ff;
  border-radius: 3px;
  outline: none;
  padding: 2px 4px;
  width: 120px;
  background: #ffffff;
`;

export const DropdownContainer = styled.div`
  min-width: 240px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
  padding: 8px 0;
`;

export const DropdownOption = styled.div`
  padding: 10px 16px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #4b5675;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background: #f4fbff;
  }
`;

export const DropdownDivider = styled.div`
  border-top: 1px solid #e5e5e5;
  margin: 4px 16px;
`;

export const DropdownLabel = styled.div`
  padding: 6px 16px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 10px;
  color: #99a1b7;
  text-transform: uppercase;
`;
