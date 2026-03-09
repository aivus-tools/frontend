import React from 'react';
import { OfferExportData } from '@/types/exportData.interface';

interface AssumptionsPageProps {
  data: OfferExportData;
}

export const AssumptionsPage: React.FC<AssumptionsPageProps> = props => {
  if (!props.data.offer.assumptionsExclusions) {
    return null;
  }

  return (
    <div style={{ pageBreakBefore: 'always', padding: '20px 0' }}>
      <div style={{
        background: '#1a3a5c',
        color: 'white',
        padding: '10px 16px',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "'Montserrat', sans-serif",
        marginBottom: 16,
      }}>
        ASSUMPTIONS & EXCLUSIONS
      </div>
      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 12,
          lineHeight: 1.6,
          color: '#333',
        }}
        dangerouslySetInnerHTML={{ __html: props.data.offer.assumptionsExclusions }}
      />
    </div>
  );
};
