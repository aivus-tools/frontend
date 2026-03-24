import React from 'react';
import { OfferExportData } from '@/types/exportData.interface';
import { BudgetSection } from './BudgetSection';

const TEXT_COLOR = '#4B5675';
const FONT_FAMILY = "'Montserrat', sans-serif";

interface BudgetDetailProps {
  data: OfferExportData;
}

export const BudgetDetail: React.FC<BudgetDetailProps> = props => {
  return (
    <div style={{ maxWidth: 1210, margin: '0 auto', padding: '20px 32px 0', fontFamily: FONT_FAMILY }}>
      <div style={{
        fontWeight: 700,
        fontSize: 20,
        color: TEXT_COLOR,
        fontFamily: FONT_FAMILY,
        marginBottom: 16,
        lineHeight: '30px',
      }}>
        Budget Detail
      </div>
      {props.data.categories
        .filter(x => x.entries.length > 0 && x.parentCategoryId != null)
        .map(x => (
          <BudgetSection
            key={x.id}
            section={x}
          />
        ))}
    </div>
  );
};
