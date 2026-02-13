'use client';

import { styled, css } from 'styled-components';

export const CardContainer = styled.div`
  border-radius: 6px;
  box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  margin: 10px 0;
  cursor: pointer;

  &:hover {
    box-shadow: rgb(149 157 165 / 20%) 0 8px 24px;
  }
`;

export const ProjectRow = styled.div<{ $status?: string }>`
  display: grid;
  grid-template-columns: 1fr 1fr 80px repeat(4, 90px);
  column-gap: 40px;
  align-items: center;
  width: 100%;
  padding: 20px 22px;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'RFP':
        return 'var(--bg-blue-subtotal)';
      case 'Reviewing':
        return '#fff';
      case 'Ongoing':
      case 'Completed':
        return 'var(--bg-light-green)';
      default:
        return 'var(--bg-gray-page)';
    }
  }};
`;

export const OffersSection = styled.div`
  background: #ffffff;
  border-top: 1px dashed #e5e5e5;
  padding: 8px 22px 8px 42px;
`;

export const OffersLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 10px;
  color: #99a1b7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  padding-top: 4px;
`;

export const OfferRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;

  &:not(:last-child) {
    border-bottom: 1px dashed #f0f0f0;
  }
`;

export const OfferName = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #4b5675;
  flex: 1;
`;

export const OfferStatusBadge = styled.span<{ $status: 'DRAFT' | 'PUBLISHED' }>`
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

export const OfferCost = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: #4b5675;
  min-width: 80px;
  text-align: right;
`;
