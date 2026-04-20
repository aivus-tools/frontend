import React from 'react';
import { OfferExportData } from '@/types/exportData.interface';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

const TEXT_COLOR = '#4B5675';
const FONT_FAMILY = "'Montserrat', sans-serif";

interface AssumptionsPageProps {
  data: OfferExportData;
}

export const AssumptionsPage: React.FC<AssumptionsPageProps> = (props) => {
  return (
    <div style={{ maxWidth: 1210, margin: '0 auto', padding: '0 32px' }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 20,
          color: TEXT_COLOR,
          fontFamily: FONT_FAMILY,
          marginBottom: 12,
          lineHeight: '30px',
        }}
      >
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
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.data.offer.assumptionsExclusions) }}
      />
    </div>
  );
};
