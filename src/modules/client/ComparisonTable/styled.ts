import { styled } from 'styled-components';

/* ───── Page layout ───── */

export const ComparisonPageWrapper = styled.div`
  display: flex;
  height: calc(100vh - 70px);
  background: #f8f9fb;
`;

export const TableArea = styled.div`
  flex: 1;
  overflow: auto;
  padding: 24px;
  min-width: 0;
`;

export const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const TableTitle = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: #4b5675;
  margin: 0;
`;

export const ModeToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #4b5675;
`;

export const ColorLegend = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: #99a1b7;
`;

export const LegendDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${({ $color }) => $color};
`;

/* ───── Table ───── */

export const ComparisonTableWrapper = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

export const StickyHeaderRow = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  z-index: 5;
  background: #ffffff;
  border-bottom: 2px solid #eef0f4;
`;

export const HeaderItemCell = styled.div`
  width: 200px;
  min-width: 200px;
  padding: 16px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: #99a1b7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-right: 1px solid #eef0f4;
  position: sticky;
  left: 0;
  background: #ffffff;
  z-index: 6;
`;

export const HeaderVendorCell = styled.div`
  flex: 1;
  min-width: 160px;
  padding: 12px 16px;
  border-right: 1px solid #eef0f4;
  text-align: center;

  &:last-child {
    border-right: none;
  }
`;

export const VendorName = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: #4b5675;
  margin-bottom: 4px;
`;

export const VendorTotal = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #4b5675;
`;

/* ───── Category / rows ───── */

export const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: #f4f5f8;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;

  &:hover {
    background: #eef0f4;
  }
`;

export const CategoryName = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #2288ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
`;

export const CategoryChevron = styled.span<{ $expanded: boolean }>`
  transition: transform 0.2s ease;
  transform: ${({ $expanded }) => ($expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  font-size: 12px;
  color: #99a1b7;
`;

export const ItemRow = styled.div`
  display: flex;
  border-bottom: 1px solid #f4f5f8;
  transition: background 0.1s ease;

  &:hover {
    background: #fafbfc;
  }
`;

export const ItemNameCell = styled.div`
  width: 200px;
  min-width: 200px;
  padding: 10px 16px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 13px;
  color: #4b5675;
  border-right: 1px solid #eef0f4;
  position: sticky;
  left: 0;
  background: #ffffff;
  z-index: 1;
`;

export const PriceCell = styled.div<{ $bgColor: string }>`
  flex: 1;
  min-width: 160px;
  padding: 10px 16px;
  text-align: right;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #4b5675;
  background-color: ${({ $bgColor }) => $bgColor};
  border-right: 1px solid rgba(255, 255, 255, 0.5);
  transition: background-color 0.2s ease;

  &:last-child {
    border-right: none;
  }
`;

export const SubtotalRow = styled.div`
  display: flex;
  background: #f8f9fb;
  border-bottom: 1px solid #eef0f4;
`;

export const SubtotalLabel = styled.div`
  width: 200px;
  min-width: 200px;
  padding: 10px 16px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #4b5675;
  border-right: 1px solid #eef0f4;
  position: sticky;
  left: 0;
  background: #f8f9fb;
  z-index: 1;
`;

export const SubtotalValue = styled.div`
  flex: 1;
  min-width: 160px;
  padding: 10px 16px;
  text-align: right;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: #4b5675;
  border-right: 1px solid #eef0f4;

  &:last-child {
    border-right: none;
  }
`;

export const GrandTotalRow = styled.div`
  display: flex;
  background: #4b5675;
`;

export const GrandTotalLabel = styled.div`
  width: 200px;
  min-width: 200px;
  padding: 14px 16px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #ffffff;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  position: sticky;
  left: 0;
  background: #4b5675;
  z-index: 1;
`;

export const GrandTotalValue = styled.div`
  flex: 1;
  min-width: 160px;
  padding: 14px 16px;
  text-align: right;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #ffffff;
  border-right: 1px solid rgba(255, 255, 255, 0.15);

  &:last-child {
    border-right: none;
  }
`;

/* ───── Sidebar / Analysis panel ───── */

export const AnalysisPanel = styled.div`
  width: 320px;
  min-width: 320px;
  background: #ffffff;
  border-left: 1px solid #eef0f4;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 70px);
`;

export const AnalysisTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #eef0f4;
`;

export const AnalysisTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 14px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ $active }) => ($active ? '#2288FF' : '#99a1b7')};
  border-bottom: 2px solid ${({ $active }) => ($active ? '#2288FF' : 'transparent')};
  transition: all 0.15s ease;
`;

export const AnalysisContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

export const AnalysisTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #2288ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px 0;
`;

export const AnalysisText = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: #4b5675;
  line-height: 1.6;
  margin: 0 0 12px 0;
`;

export const HighlightItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: #f4fbff;
  border-radius: 6px;
  margin-bottom: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #4b5675;
  line-height: 1.5;
`;

export const AnalysisChatInput = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #eef0f4;
  display: flex;
  gap: 8px;
`;

/* ───── Empty / loading states ───── */

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
`;

export const EmptyTitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 16px;
  color: #4b5675;
  margin-bottom: 8px;
`;

export const EmptyDescription = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: #99a1b7;
`;
