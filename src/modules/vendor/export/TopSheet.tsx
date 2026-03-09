import React from 'react';

import { ExportCategorySection, OfferExportData } from '@/types/exportData.interface';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const FONT_FAMILY = "'Montserrat', sans-serif";
const HEADER_BACKGROUND = '#1a3a5c';
const SUBTOTAL_BACKGROUND = '#f5f5f5';
const GRAND_TOTAL_BACKGROUND = '#e8f0fe';

const cellStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontFamily: FONT_FAMILY,
  fontSize: '12px',
  borderBottom: '1px solid #e0e0e0',
};

const estimateCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: 'right',
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  backgroundColor: HEADER_BACKGROUND,
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '13px',
};

const subtotalRowStyle: React.CSSProperties = {
  backgroundColor: SUBTOTAL_BACKGROUND,
};

const totalCellStyle: React.CSSProperties = {
  ...cellStyle,
  fontWeight: 700,
};

const totalEstimateCellStyle: React.CSSProperties = {
  ...totalCellStyle,
  textAlign: 'right',
};

const grandTotalCellStyle: React.CSSProperties = {
  ...cellStyle,
  fontWeight: 700,
  fontSize: '14px',
  backgroundColor: GRAND_TOTAL_BACKGROUND,
};

const grandTotalEstimateCellStyle: React.CSSProperties = {
  ...grandTotalCellStyle,
  textAlign: 'right',
};

const PRODUCTION_CODES: Array<{ code: string; label: string }> = [
  { code: 'A', label: 'Prep Crew' },
  { code: 'B', label: 'Shoot Crew' },
  { code: 'C', label: 'Prep & Wrap Expenses' },
  { code: 'D', label: 'Location/Travel Expenses' },
  { code: 'E', label: 'Props/Wardrobe/Animals' },
  { code: 'F', label: 'Studio Costs' },
  { code: 'G', label: 'Art Dept Labor' },
  { code: 'H', label: 'Art Dept Expenses' },
  { code: 'I', label: 'Equipment Rental' },
  { code: 'J', label: 'Media' },
  { code: 'K', label: 'Misc Production Costs' },
];

const SECONDARY_PRODUCTION_CODES: Array<{ code: string; label: string }> = [
  { code: 'L', label: "Director's Fees" },
  { code: 'M', label: 'Talent' },
  { code: 'N', label: 'Talent Expenses' },
  { code: 'O', label: 'Other' },
];

const POST_PRODUCTION_CODES: Array<{ code: string; label: string }> = [
  { code: 'Q', label: 'Editorial' },
  { code: 'R', label: 'Social Versions' },
  { code: 'S', label: 'Audio' },
  { code: 'T', label: 'Finishing' },
  { code: 'U', label: 'Misc Editorial' },
  { code: 'V', label: 'Editorial Labor & Creative Fees' },
  { code: 'W', label: 'Other' },
];

const ALL_AICP_CODES = new Set([
  ...PRODUCTION_CODES,
  ...SECONDARY_PRODUCTION_CODES,
  ...POST_PRODUCTION_CODES,
].map(x => x.code));

interface TopSheetProps {
  data: OfferExportData;
}

export const TopSheet: React.FC<TopSheetProps> = props => {
  const findCategory = (code: string): ExportCategorySection | null => {
    return props.data.categories.find(x => x.code === code) ?? null;
  };

  const getCategoryTotal = (code: string): number => {
    const category = findCategory(code);
    if (category == null) {
      return 0;
    }
    return category.sectionTotal;
  };

  const unmappedCategories = props.data.categories.filter(x => !x.code || !ALL_AICP_CODES.has(x.code));
  const unmappedTotal = unmappedCategories.reduce((sum, x) => sum + x.sectionTotal, 0);

  const subTotalAK = PRODUCTION_CODES.reduce((sum, x) => sum + getCategoryTotal(x.code), 0);
  const subTotalLO = SECONDARY_PRODUCTION_CODES.reduce((sum, x) => sum + getCategoryTotal(x.code), 0);
  const productionSubTotal = subTotalAK + subTotalLO;

  const productionInsurancePercent = parseFloat(props.data.offer.productionInsurancePercent) || 0;
  const productionFeePercent = parseFloat(props.data.offer.productionFeePercent) || 0;
  const productionInsurance = productionSubTotal * (productionInsurancePercent / 100);
  const productionFee = productionSubTotal * (productionFeePercent / 100);
  const productionTotal = productionSubTotal + productionInsurance + productionFee;

  const subTotalPost = POST_PRODUCTION_CODES.reduce((sum, x) => sum + getCategoryTotal(x.code), 0);

  const postInsurancePercent = parseFloat(props.data.offer.postInsurancePercent) || 0;
  const postMarkupPercent = parseFloat(props.data.offer.postMarkupPercent) || 0;
  const postTaxPercent = parseFloat(props.data.offer.postTaxPercent) || 0;
  const postInsurance = subTotalPost * (postInsurancePercent / 100);
  const postMarkup = subTotalPost * (postMarkupPercent / 100);
  const postTax = subTotalPost * (postTaxPercent / 100);
  const postProductionTotal = subTotalPost + postInsurance + postMarkup + postTax;

  const hasAicpData = productionSubTotal > 0 || subTotalPost > 0;
  const grandTotal = productionTotal + postProductionTotal + unmappedTotal;

  const renderCategoryRow = (code: string, label: string): React.ReactNode => {
    return (
      <tr key={code}>
        <td style={cellStyle}>
          {code}. {label}
        </td>
        <td style={cellStyle} />
        <td style={estimateCellStyle}>{formatCurrency(getCategoryTotal(code))}</td>
      </tr>
    );
  };

  const renderUnmappedCategoryRow = (category: ExportCategorySection): React.ReactNode => {
    const label = category.code ? `${category.code}. ${category.name}` : category.name;
    return (
      <tr key={category.id}>
        <td style={cellStyle}>{label}</td>
        <td style={cellStyle} />
        <td style={estimateCellStyle}>{formatCurrency(category.sectionTotal)}</td>
      </tr>
    );
  };

  const renderSubTotalRow = (label: string, value: number): React.ReactNode => {
    return (
      <tr style={subtotalRowStyle}>
        <td style={totalCellStyle}>{label}</td>
        <td style={totalCellStyle} />
        <td style={totalEstimateCellStyle}>{formatCurrency(value)}</td>
      </tr>
    );
  };

  const renderPercentRow = (label: string, percent: number, value: number): React.ReactNode => {
    return (
      <tr>
        <td style={cellStyle}>
          {label} ({percent}%)
        </td>
        <td style={cellStyle} />
        <td style={estimateCellStyle}>{formatCurrency(value)}</td>
      </tr>
    );
  };

  const renderSectionTotalRow = (label: string, value: number): React.ReactNode => {
    return (
      <tr>
        <td style={totalCellStyle}>{label}</td>
        <td style={totalCellStyle} />
        <td style={totalEstimateCellStyle}>{formatCurrency(value)}</td>
      </tr>
    );
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: FONT_FAMILY,
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY, width: '100%' }}>
      {hasAicpData && (
        <>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...headerCellStyle, textAlign: 'left', width: '50%' }}>PRODUCTION</th>
                <th style={{ ...headerCellStyle, textAlign: 'left', width: '25%' }}>NOTE</th>
                <th style={{ ...headerCellStyle, textAlign: 'right', width: '25%' }}>ESTIMATE</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTION_CODES.map(x => renderCategoryRow(x.code, x.label))}
              {renderSubTotalRow('Sub-Total A to K', subTotalAK)}
              {SECONDARY_PRODUCTION_CODES.map(x => renderCategoryRow(x.code, x.label))}
              {renderSubTotalRow('Sub-Total L to O', subTotalLO)}
              {renderPercentRow('Production Insurance', productionInsurancePercent, productionInsurance)}
              {renderPercentRow('Production Fee', productionFeePercent, productionFee)}
              {renderSectionTotalRow('PRODUCTION TOTAL', productionTotal)}
            </tbody>
          </table>

          <table style={{ ...tableStyle, marginTop: '16px' }}>
            <thead>
              <tr>
                <th style={{ ...headerCellStyle, textAlign: 'left', width: '50%' }}>POST-PRODUCTION</th>
                <th style={{ ...headerCellStyle, textAlign: 'left', width: '25%' }}>NOTE</th>
                <th style={{ ...headerCellStyle, textAlign: 'right', width: '25%' }}>ESTIMATE</th>
              </tr>
            </thead>
            <tbody>
              {POST_PRODUCTION_CODES.map(x => renderCategoryRow(x.code, x.label))}
              {renderSubTotalRow('Sub-Total Post-Production', subTotalPost)}
              {renderPercentRow('Post Insurance', postInsurancePercent, postInsurance)}
              {renderPercentRow('Post Markup', postMarkupPercent, postMarkup)}
              {renderPercentRow('Post Tax', postTaxPercent, postTax)}
              {renderSectionTotalRow('POST-PRODUCTION TOTAL', postProductionTotal)}
            </tbody>
          </table>
        </>
      )}

      {unmappedCategories.length > 0 && (
        <table style={{ ...tableStyle, marginTop: hasAicpData ? '16px' : undefined }}>
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, textAlign: 'left', width: '50%' }}>
                {hasAicpData ? 'ADDITIONAL CATEGORIES' : 'SUMMARY'}
              </th>
              <th style={{ ...headerCellStyle, textAlign: 'left', width: '25%' }}>NOTE</th>
              <th style={{ ...headerCellStyle, textAlign: 'right', width: '25%' }}>ESTIMATE</th>
            </tr>
          </thead>
          <tbody>
            {unmappedCategories.map(x => renderUnmappedCategoryRow(x))}
            {renderSubTotalRow(hasAicpData ? 'Additional Sub-Total' : 'Sub-Total', unmappedTotal)}
          </tbody>
        </table>
      )}

      <table style={{ ...tableStyle, marginTop: '16px' }}>
        <tbody>
          <tr>
            <td style={{ ...grandTotalCellStyle, width: '50%' }}>GRAND TOTAL</td>
            <td style={{ ...grandTotalCellStyle, width: '25%' }} />
            <td style={{ ...grandTotalEstimateCellStyle, width: '25%' }}>{formatCurrency(grandTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
