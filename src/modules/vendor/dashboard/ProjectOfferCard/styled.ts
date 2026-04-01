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

const statusBg = (status?: string) => {
  switch (status) {
    case 'RFP':
      return 'linear-gradient(135deg, #f0f7ff 0%, #f8fbff 100%)';
    case 'REVIEWING':
      return 'linear-gradient(135deg, #fffbf5 0%, #fefcf9 100%)';
    case 'ONGOING':
      return 'linear-gradient(135deg, #f6fcf0 0%, #fafdf7 100%)';
    case 'COMPLETED':
      return 'linear-gradient(135deg, #f6fcf0 0%, #fafdf7 100%)';
    default:
      return '#f9fafb';
  }
};

export const CardContainer = styled.div<{ $status?: string }>`
  background: ${({ $status }) => statusBg($status)};
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.03);
  border-left: 5px solid ${({ $status }) => statusAccent($status)};

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04);
    transform: translateY(-2px);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px 16px 24px;
`;

export const ProjectInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProjectTitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #1b254b;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
`;

export const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
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
  margin: 0 24px;
  border-top: 1px solid #e8eaf0;
  padding-bottom: 8px;
`;

export const OfferTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 90px 90px 90px;
  gap: 12px;
  padding: 10px 20px 8px 20px;
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
  padding: 10px 20px 10px 20px;
  align-items: center;
  border-radius: 8px;
  transition: background 0.12s ease;
  cursor: pointer;

  &:hover {
    background: rgba(34, 136, 255, 0.04);
  }

  &:not(:last-child) {
    border-bottom: 1px dashed #ecedf1;
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

export const OfferStatusBadge = styled.span<{ $status: string }>`
  height: 22px;
  padding: 0 10px;
  border-radius: 6px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 9px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
  letter-spacing: 0.3px;
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(0.95);
  }

  ${({ $status }) =>
    $status === 'PUBLISHED'
      ? css`
          background: #f0fcd4;
          color: #7ead00;
        `
      : $status === 'ARCHIVED'
        ? css`
            background: #fff2e8;
            color: #d46b08;
          `
        : css`
            background: #f4f4f7;
            color: #99a1b7;
          `}
`;

export const OfferValue = styled.div<{ $highlight?: boolean; $negative?: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: ${({ $negative, $highlight }) => ($negative ? '#F5222D' : $highlight ? '#2288FF' : '#4b5675')};
  text-align: right;
`;

export const StatusDropdown = styled.div`
  min-width: 120px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
  width: 32px;
  height: 32px;
  border-radius: 8px;
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
  margin: 0 24px;
  padding: 16px 0 16px 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #b5b5c3;
  font-weight: 500;
  font-style: italic;
  border-top: 1px solid #e8eaf0;
`;
