'use client';

import { styled, css } from 'styled-components';

const statusAccent = (status?: string) => {
  switch (status) {
    case 'RFP':
      return '#2288FF';
    case 'REVIEWING':
      return '#F0A020';
    case 'ONGOING':
      return '#52C41A';
    case 'COMPLETED':
      return '#52C41A';
    default:
      return '#B5B5C3';
  }
};

export const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f1f4;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

export const CardHeader = styled.div<{ $status?: string }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-left: 4px solid ${({ $status }) => statusAccent($status)};
`;

export const ProjectInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProjectTitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #1b254b;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #99a1b7;
  font-weight: 500;
`;

export const MetaDot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #d0d5dd;
  flex-shrink: 0;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const OffersTable = styled.div`
  border-top: 1px solid #f1f1f4;
`;

export const OfferTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 90px 90px 90px;
  gap: 12px;
  padding: 8px 20px 6px 40px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 10px;
  color: #b5b5c3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const OfferRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 90px 90px 90px;
  gap: 12px;
  padding: 10px 20px 10px 40px;
  align-items: center;
  transition: background 0.12s ease;
  cursor: pointer;

  &:hover {
    background: #f8f9fb;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f5f5f8;
  }
`;

export const OfferName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

export const OfferNameText = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #4b5675;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const OfferStatusBadge = styled.span<{ $status: 'DRAFT' | 'PUBLISHED' }>`
  height: 20px;
  padding: 0 8px;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 9px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;

  ${({ $status }) =>
    $status === 'PUBLISHED'
      ? css`
          background: #f0fcd4;
          color: #7ead00;
        `
      : css`
          background: #f4f4f7;
          color: #99a1b7;
        `}
`;

export const OfferValue = styled.div<{ $highlight?: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: ${({ $highlight }) => ($highlight ? '#2288FF' : '#4b5675')};
  text-align: right;
`;

export const StatusDropdown = styled.div`
  min-width: 120px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
  padding: 4px 0;
`;

export const StatusDropdownOption = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background: #f4fbff;
  }
`;

export const KebabButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  color: #b5b5c3;
  font-size: 18px;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background: #f1f1f4;
    color: #4b5675;
  }
`;

export const EmptyOffers = styled.div`
  padding: 14px 20px 14px 40px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #b5b5c3;
  font-weight: 500;
  border-top: 1px solid #f1f1f4;
`;
