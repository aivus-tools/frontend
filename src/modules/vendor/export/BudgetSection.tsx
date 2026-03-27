import React from 'react';
import { ExportCategorySection } from '@/types/exportData.interface';
import { computeDisplayValues } from '@/helpers/excelExport/exportUtils';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const FONT_FAMILY = "'Montserrat', sans-serif";
const TEXT_COLOR = '#4B5675';
const ACCENT_COLOR = '#7CDFF1';
const SUBTOTAL_BG = '#E8F5FD';
const TOTAL_BG = '#7CDFF1';

const cellStyle: React.CSSProperties = {
  padding: '4px 6px',
  fontSize: 12,
  fontFamily: FONT_FAMILY,
  color: TEXT_COLOR,
  borderBottom: '1px solid #D0D5DD',
};

const numericCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: 'right',
};

const columnHeaders = ['ID', 'Description', 'Rate', 'Qty', 'Units', 'Qty', 'Units', 'Overtime', 'ESTIMATE'];

interface BudgetSectionProps {
  section: ExportCategorySection;
}

export const BudgetSection: React.FC<BudgetSectionProps> = props => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontFamily: FONT_FAMILY }}>
      <thead>
        <tr>
          <td
            colSpan={9}
            style={{
              background: ACCENT_COLOR,
              color: '#fff',
              padding: '8px 6px',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: FONT_FAMILY,
            }}
          >
            {props.section.code ? props.section.code + ' \u2013 ' + props.section.name : props.section.name}
          </td>
        </tr>
        <tr>
          {columnHeaders.map((x, i) => (
            <td
              key={i}
              style={{
                background: SUBTOTAL_BG,
                padding: '4px 6px',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
                color: TEXT_COLOR,
                textAlign: i >= 2 ? 'right' : 'left',
                borderBottom: '1px solid #D0E8F0',
              }}
            >
              {x}
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.section.entries.map(x => {
          const display = computeDisplayValues(x);
          return (
            <tr key={x.id}>
              <td style={{ ...cellStyle, textAlign: 'center' }}>{x.code}</td>
              <td style={cellStyle}>{x.name}</td>
              <td style={numericCellStyle}>{formatCurrency(display.rate)}</td>
              <td style={numericCellStyle}>{x.units[0] != null ? x.units[0].count : ''}</td>
              <td style={numericCellStyle}>{x.units[0] != null ? x.units[0].symbol : ''}</td>
              <td style={numericCellStyle}>{x.units[1] != null ? x.units[1].count : ''}</td>
              <td style={numericCellStyle}>{x.units[1] != null ? x.units[1].symbol : ''}</td>
              <td style={numericCellStyle}>{display.overtime > 0 ? formatCurrency(display.overtime) : '\u2013'}</td>
              <td style={{ ...numericCellStyle, fontWeight: 600 }}>{formatCurrency(x.estimate)}</td>
            </tr>
          );
        })}
        <tr>
          <td colSpan={8} style={{ ...cellStyle, fontWeight: 700, background: SUBTOTAL_BG, textAlign: 'right' }}>
            Sub Total
          </td>
          <td style={{ ...numericCellStyle, fontWeight: 700, background: SUBTOTAL_BG }}>
            {formatCurrency(props.section.subTotal)}
          </td>
        </tr>
        {props.section.fringes != null && (
          <tr>
            <td colSpan={8} style={{ ...cellStyle, background: SUBTOTAL_BG, textAlign: 'right' }}>
              Fringes
            </td>
            <td style={{ ...numericCellStyle, background: SUBTOTAL_BG }}>
              {formatCurrency(props.section.fringes)}
            </td>
          </tr>
        )}
        <tr>
          <td colSpan={8} style={{ ...cellStyle, fontWeight: 700, background: TOTAL_BG, color: '#fff', textAlign: 'right', borderBottom: 'none' }}>
            TOTAL {props.section.code ?? ''}
          </td>
          <td style={{ ...numericCellStyle, fontWeight: 700, background: TOTAL_BG, color: '#fff', borderBottom: 'none' }}>
            {formatCurrency(props.section.sectionTotal)}
          </td>
        </tr>
      </tbody>
    </table>
  );
};
