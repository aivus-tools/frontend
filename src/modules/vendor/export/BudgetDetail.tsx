import React from 'react';
import { OfferExportData } from '@/types/exportData.interface';
import { BudgetSection } from './BudgetSection';

interface BudgetDetailProps {
  data: OfferExportData;
}

export const BudgetDetail: React.FC<BudgetDetailProps> = props => {
  return (
    <div style={{ padding: '20px 0', fontFamily: "'Montserrat', sans-serif" }}>
      <div style={{
        background: '#1a3a5c',
        color: 'white',
        padding: '10px 16px',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "'Montserrat', sans-serif",
        marginBottom: 16,
      }}>
        BUDGET DETAIL
      </div>
      {props.data.categories
        .filter(x => x.entries.length > 0)
        .map(x => (
          <BudgetSection
            key={x.id}
            section={x}
            fringesPercent={props.data.offer.fringesPercent}
          />
        ))}
    </div>
  );
};
