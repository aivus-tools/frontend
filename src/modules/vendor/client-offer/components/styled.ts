'use client';

import { styled } from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  gap: 30px;
  padding: 10px 30px 30px 30px;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  color: var(--main);
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
  padding: 0px 6px 4px 6px;
`;

export const Content = styled.div`
  display: flex;
  padding: 30px;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 6px;
  background-color: #fff;
  width: 100%;
  box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
`;

export const Table = styled.div`
  display: grid;
  grid-template-columns: 38px 1fr 90px 90px 90px 120px;
  grid-auto-flow: row;
  width: 100%;
`;

export const TableHeader = styled.div`
  display: contents;

  & > div {
    font-weight: 500;
    color: #99A1B7;
    font-size: 11px;
    line-height: 13px;
    padding: 16px 0 12px 0;
    background: transparent;
  }
`;

export const HeaderCell = styled.div<{ $align?: 'left' | 'center' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) =>
    $align === 'left' ? 'flex-start' :
      $align === 'right' ? 'flex-end' : 'center'};
  padding-right: ${({ $align }) => $align === 'right' ? '10px' : '0'};
`;

// Category block wrapper with white bg, rounded corners, and shadow
export const CategoryBlock = styled.div`
  display: contents;

  & > * {
    background-color: #fff;
  }
`;

export const CategoryBlockWrapper = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
  margin-bottom: 15px;
  overflow: hidden;
`;

export const RowWrapper = styled.div<{ $hovered?: boolean; $isEven?: boolean; $bg?: string }>`
  display: contents;

  & > div, & > * {
    background-color: ${({ $hovered, $isEven, $bg }) =>
    $bg || ($hovered ? 'var(--bg-blue-subsection)' : ($isEven ? '#fdfdfd' : '#fff'))};
  }
`;

export const Spacer = styled.div`
  grid-column: span 6;
  height: 15px;
  background-color: transparent !important;
`;

export const EstimationItem = styled.div<{ $hovered?: boolean; $focused?: boolean; $depth?: number }>`
  text-align: center;
  background-color: ${({ $hovered }) => ($hovered ? 'var(--bg-blue-subsection)' : '#fff')};

  font-weight: 500;
  font-size: 13px;
  line-height: 15.85px;
  padding: 8px 2px;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 42px;

  ${({ $depth }) => $depth && `padding-left: ${$depth * 24}px;`}
`;

export const ItemDescription = styled.div`
  font-weight: 400;
  font-size: 11px;
  line-height: 14px;
  color: #99A1B7;
  margin-top: 2px;
`;

// Row line that starts at the text position (not full width)
export const RowLine = styled.div<{ $dark?: boolean }>`
  grid-column: span 5;
  border-bottom: 1px dashed ${({ $dark }) => $dark ? 'var(--gray)' : 'var(--gray-light)'};
  height: 1px;
  margin-left: 0;
`;

export const RowLineStart = styled.div`
  grid-column: span 1;
  background: #fff;
`;

export const Label = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 17.07px;
  letter-spacing: 0;
  text-align: right;
  padding: 16px 0;
  text-transform: uppercase;
`;

export const TotalSum = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 19.5px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: var(--blue);
  padding: 16px 0;
`;

export const IconPlaceholder = styled.div`
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SectionTitle = styled.div<{ $isOpen?: boolean }>`
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 18px 2px;
`;

export const SectionTitleText = styled.div`
  font-weight: 700;
  font-size: 14px;
  line-height: 17.07px;
  color: var(--blue);
  user-select: none;
  text-transform: uppercase;
`;

export const SectionTitleSumHeader = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 19.5px;
  text-align: right;
  display: flex;
  align-items: center;
  color: var(--blue);
`;

export const SectionSubTitle = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0px;
  background: #fff;
`;

export const SectionSubTitleText = styled.div`
  font-weight: 500;
  font-size: 13px;
  line-height: 15.85px;
  color: var(--blue);
  user-select: none;
`;

export const SectionSubTitleSumHeader = styled.div`
  font-weight: 700;
  font-size: 14px;
  line-height: 17.07px;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

// Subtotal for subcategory
export const SubTotalRow = styled.div`
  display: contents;

  & > div {
    background: var(--bg-blue-subtotal, #F4FBFF);
  }

  & > div:first-child {
    border-radius: 0 0 0 6px;
  }

  & > div:last-child {
    border-radius: 0 0 6px 0;
  }
`;

// Category Total row
export const CategoryTotalRow = styled.div`
  grid-column: span 6;
  display: flex;
  padding: 20px 8px 14px 8px;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  border-radius: 0 0 6px 6px;
  background: var(--bg-blue-important, #E1F5FF);
  box-shadow: 0px 5px 16.5px -11px rgba(0, 0, 0, 0.25);
`;

// Summary rows - Subtotal for All Sections
export const SummaryRow = styled.div`
  grid-column: span 6;
  display: flex;
  padding: 16px 40px 16px 16px;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-blue-important, #E1F5FF);
  border-radius: 6px;
  box-shadow: 0 5px 16.5px -11px rgba(0, 0, 0, 0.25);
  margin-top: 15px;
`;

export const GrandTotalRow = styled.div`
  grid-column: span 6;
  display: flex;
  padding: 16px 40px 16px 8px;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-green, #F4FBDB);
  border-radius: 6px;
  margin-top: 0;
`;

export const CostPerVideoRow = styled.div`
  grid-column: span 6;
  display: flex;
  padding: 8px 40px 8px 8px;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

export const AgencyServiceRow = styled.div`
  grid-column: span 6;
  display: flex;
  padding: 8px 40px 8px 8px;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  background: #fff;
  margin-top: 8px;
`;
