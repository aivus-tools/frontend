import React from 'react';
import { OfferExportData } from '@/types/exportData.interface';

const TEXT_COLOR = '#4B5675';
const FONT_FAMILY = "'Montserrat', sans-serif";

interface AssumptionsPageProps {
  data: OfferExportData;
}

export const AssumptionsPage: React.FC<AssumptionsPageProps> = props => {
  if (!props.data.offer.assumptionsExclusions) {
    return null;
  }

  return (
    <div style={{ pageBreakBefore: 'always', maxWidth: 1210, margin: '0 auto', padding: '20px 32px 0' }}>
      <div style={{
        fontWeight: 700,
        fontSize: 20,
        color: TEXT_COLOR,
        fontFamily: FONT_FAMILY,
        marginBottom: 12,
        lineHeight: '30px',
      }}>
        Assumptions & Exclusions
      </div>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 14,
          lineHeight: 1.6,
          color: TEXT_COLOR,
          padding: '0 10px',
        }}
        dangerouslySetInnerHTML={{ __html: props.data.offer.assumptionsExclusions }}
      />
    </div>
  );
};
