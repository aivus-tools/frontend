import React from 'react';

import { OfferExportData } from '@/types/exportData.interface';
import { buildSectionFees } from '@/helpers/excelExport/exportUtils';

const formatCurrency = (value: number): string => {
  if (value === 0) {
    return '\u2013';
  }
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const FONT_FAMILY = "'Montserrat', sans-serif";
const TEXT_COLOR = '#4B5675';
const ACCENT_COLOR = '#7CDFF1';
const SUBTOTAL_BG = '#E8F5FD';
const TOTAL_BG = '#7CDFF1';
const GRAND_TOTAL_BG = '#7CDFF1';
const GRAND_TOTAL_PRICE_BG = '#60D394';

interface SectionGroup {
  id: string;
  code: string;
  name: string;
  tags: string[];
  children: Array<{ code: string; name: string; total: number }>;
  subtotal: number;
}

interface TopSheetProps {
  data: OfferExportData;
}

export const TopSheet: React.FC<TopSheetProps> = (props) => {
  const groupsMap = new Map<string, SectionGroup>();

  for (const cat of props.data.categories) {
    const parentKey = cat.parentCategoryId || cat.id;
    const existing = groupsMap.get(parentKey);
    if (existing) {
      existing.children.push({ code: cat.code, name: cat.name, total: cat.sectionTotal });
      existing.subtotal += cat.sectionTotal;
    } else {
      groupsMap.set(parentKey, {
        id: cat.parentCategoryId || cat.id,
        code: cat.parentCategoryCode || cat.code,
        name: cat.parentCategoryName || cat.name,
        tags: cat.parentTags.length > 0 ? cat.parentTags : cat.tags,
        children: [{ code: cat.code, name: cat.name, total: cat.sectionTotal }],
        subtotal: cat.sectionTotal,
      });
    }
  }

  const groups = Array.from(groupsMap.values());

  let grandTotal = 0;
  const sections = groups.map((group) => {
    const fees = buildSectionFees(group.id, group.tags, group.subtotal, props.data.offer);
    const feesTotal = fees.reduce((sum, x) => sum + x.value, 0);
    const sectionTotal = group.subtotal + feesTotal;
    grandTotal += sectionTotal;
    return { ...group, fees, sectionTotal };
  });

  return (
    <div style={{ fontFamily: FONT_FAMILY, maxWidth: 1210, margin: '0 auto', padding: '0 32px' }}>
      {sections.map((section, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div style={{ height: 16 }} />}
          <SectionTable
            title={section.name}
            items={section.children.map((x) => ({ code: x.code, label: x.name, value: x.total }))}
            subTotals={[
              { label: `Sub-Total ${section.name}`, value: section.subtotal },
            ]}
            fees={section.fees}
            total={{ label: `${section.name.toUpperCase()} TOTAL`, value: section.sectionTotal }}
          />
        </React.Fragment>
      ))}

      <div style={{ height: 0 }} />
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ ...grandTotalCellStyle, width: 70, background: GRAND_TOTAL_BG }} />
            <td style={{ ...grandTotalCellStyle, width: 320, background: GRAND_TOTAL_BG }} />
            <td style={{ ...grandTotalCellStyle, background: GRAND_TOTAL_BG, textAlign: 'right' }}>GRAND TOTAL</td>
            <td style={{ ...grandTotalCellStyle, width: 220, textAlign: 'right', background: GRAND_TOTAL_PRICE_BG }}>
              {formatCurrency(grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

interface SectionTableProps {
  title: string;
  items: Array<{ code: string; label: string; value: number }>;
  subTotals: Array<{ label: string; value: number }>;
  fees: Array<{ label: string; percent: number; value: number }>;
  total: { label: string; value: number };
}

const SectionTable: React.FC<SectionTableProps> = (props) => {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={{ ...headerCellStyle, width: 70 }} />
          <th style={{ ...headerCellStyle, width: 320, textAlign: 'left' }}>{props.title}</th>
          <th style={{ ...headerCellStyle, textAlign: 'left' }}>NOTE</th>
          <th style={{ ...headerCellStyle, width: 220, textAlign: 'right' }} />
        </tr>
      </thead>
      <tbody>
        {props.items.map((x, i) => (
          <tr key={`${x.code}-${i}`}>
            <td style={{ ...cellStyle, textAlign: 'center' }}>{x.code}</td>
            <td style={cellStyle}>{x.label}</td>
            <td style={cellStyle} />
            <td style={priceCellStyle}>{formatCurrency(x.value)}</td>
          </tr>
        ))}
        {props.subTotals.map((x) => (
          <tr key={x.label} style={{ background: SUBTOTAL_BG }}>
            <td style={subtotalCellStyle} />
            <td style={subtotalCellStyle} />
            <td style={{ ...subtotalCellStyle, fontWeight: 700, textAlign: 'right' }}>{x.label}</td>
            <td style={{ ...subtotalCellStyle, textAlign: 'right', fontWeight: 700 }}>{formatCurrency(x.value)}</td>
          </tr>
        ))}
        {props.fees.map((x) => (
          <tr key={x.label}>
            <td style={cellStyle} />
            <td style={cellStyle} />
            <td style={{ ...cellStyle, color: '#99A1B7', textAlign: 'right' }}>{x.label}</td>
            <td style={priceCellStyle}>
              <span style={{ marginRight: 16, color: '#99A1B7', fontSize: 12 }}>{x.percent}%</span>
              {formatCurrency(x.value)}
            </td>
          </tr>
        ))}
        <tr style={{ background: TOTAL_BG }}>
          <td style={totalCellStyle} />
          <td style={totalCellStyle} />
          <td style={{ ...totalCellStyle, fontWeight: 700, textAlign: 'right' }}>{props.total.label}</td>
          <td style={{ ...totalCellStyle, textAlign: 'right', fontWeight: 700 }}>{formatCurrency(props.total.value)}</td>
        </tr>
      </tbody>
    </table>
  );
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: FONT_FAMILY,
  fontSize: 14,
};

const BORDER = '1px solid #D0D5DD';

const headerCellStyle: React.CSSProperties = {
  padding: '6px 6px',
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  fontWeight: 700,
  color: '#fff',
  background: ACCENT_COLOR,
  border: BORDER,
};

const cellStyle: React.CSSProperties = {
  padding: '6px 6px',
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  color: TEXT_COLOR,
  border: BORDER,
};

const priceCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: 'right',
};

const subtotalCellStyle: React.CSSProperties = {
  padding: '6px 6px',
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  color: TEXT_COLOR,
  border: BORDER,
};

const totalCellStyle: React.CSSProperties = {
  padding: '6px 6px',
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  color: '#fff',
  border: BORDER,
};

const grandTotalCellStyle: React.CSSProperties = {
  padding: '12px 6px',
  fontFamily: FONT_FAMILY,
  fontSize: 18,
  fontWeight: 700,
  color: '#0F4C5C',
  border: BORDER,
};
