import React from 'react';
import { ExportCategorySection } from '@/types/exportData.interface';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const FONT_FAMILY = "'Montserrat', sans-serif";

const cellStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 11,
  fontFamily: FONT_FAMILY,
  borderBottom: '1px solid #e0e0e0',
};

const numericCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: 'right',
};

const columnHeaders = ['ID', 'Description', 'Rate', 'Qty', 'Units', 'Qty', 'Units', 'Overtime', 'ESTIMATE'];

interface BudgetSectionProps {
  section: ExportCategorySection;
  fringesPercent: string;
}

export const BudgetSection: React.FC<BudgetSectionProps> = props => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontFamily: FONT_FAMILY }}>
      <thead>
        <tr>
          <td
            colSpan={9}
            style={{
              background: '#1a3a5c',
              color: 'white',
              padding: '6px 8px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: FONT_FAMILY,
            }}
          >
            {props.section.code ? props.section.code + ' - ' + props.section.name : props.section.name}
          </td>
        </tr>
        <tr>
          {columnHeaders.map((x, i) => (
            <td
              key={i}
              style={{
                background: '#e8f0fe',
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
                textAlign: i >= 2 ? 'right' : 'left',
                borderBottom: '1px solid #c0c0c0',
              }}
            >
              {x}
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.section.entries.map(x => (
          <tr key={x.id}>
            <td style={cellStyle}>{x.code}</td>
            <td style={cellStyle}>{x.name}</td>
            <td style={numericCellStyle}>{formatCurrency(x.rate)}</td>
            <td style={numericCellStyle}>{x.units[0] != null ? x.units[0].count : ''}</td>
            <td style={numericCellStyle}>{x.units[0] != null ? x.units[0].symbol : ''}</td>
            <td style={numericCellStyle}>{x.units[1] != null ? x.units[1].count : ''}</td>
            <td style={numericCellStyle}>{x.units[1] != null ? x.units[1].symbol : ''}</td>
            <td style={numericCellStyle}>{x.overtime > 0 ? formatCurrency(x.overtime) : '-'}</td>
            <td style={{ ...numericCellStyle, fontWeight: 600 }}>{formatCurrency(x.estimate)}</td>
          </tr>
        ))}
        <tr>
          <td colSpan={8} style={{ ...cellStyle, fontWeight: 700, background: '#f0f0f0', textAlign: 'right' }}>
            Sub Total
          </td>
          <td style={{ ...numericCellStyle, fontWeight: 700, background: '#f0f0f0' }}>
            {formatCurrency(props.section.subTotal)}
          </td>
        </tr>
        {props.section.fringes != null && (
          <tr>
            <td colSpan={8} style={{ ...cellStyle, background: '#f0f0f0', textAlign: 'right' }}>
              {props.fringesPercent + '% Fringes'}
            </td>
            <td style={{ ...numericCellStyle, background: '#f0f0f0' }}>
              {formatCurrency(props.section.fringes)}
            </td>
          </tr>
        )}
        <tr>
          <td colSpan={8} style={{ ...cellStyle, fontWeight: 700, background: '#e0e0e0', textAlign: 'right' }}>
            Section Total
          </td>
          <td style={{ ...numericCellStyle, fontWeight: 700, background: '#e0e0e0' }}>
            {formatCurrency(props.section.sectionTotal)}
          </td>
        </tr>
      </tbody>
    </table>
  );
};
