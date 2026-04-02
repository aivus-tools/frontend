import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BudgetSection } from './BudgetSection';
import { ExportCategorySection, ExportEntryItem } from '@/types/exportData.interface';

vi.mock('@/helpers/excelExport/exportUtils', () => ({
  computeDisplayValues: vi.fn((entry: ExportEntryItem) => ({
    rate: entry.rate,
    overtime: entry.overtime,
  })),
}));

const createMockEntry = (overrides: Partial<ExportEntryItem> = {}): ExportEntryItem => ({
  id: 'entry-1',
  entryId: 'e-1',
  code: 'A01',
  name: 'Camera Operator',
  rate: 500,
  units: [
    { label: 'Person', symbol: 'Persons', count: 2 },
    { label: 'Day', symbol: 'Days', count: 3 },
  ],
  overtime: 0,
  estimate: 3000,
  ...overrides,
});

const createMockSection = (overrides: Partial<ExportCategorySection> = {}): ExportCategorySection => ({
  id: 'cat-1',
  code: 'A',
  name: 'Production',
  level: 1,
  parentCategoryId: 'parent-1',
  parentCategoryName: 'Production Group',
  parentCategoryCode: 'PG',
  tags: ['production'],
  parentTags: ['production'],
  entries: [createMockEntry()],
  subTotal: 3000,
  fringes: null,
  sectionTotal: 3000,
  ...overrides,
});

describe('BudgetSection', () => {
  it('renders section header with code and name', () => {
    const section = createMockSection({ code: 'B', name: 'Post-Production' });
    render(<BudgetSection section={section} />);
    expect(screen.getByText('B \u2013 Post-Production')).toBeInTheDocument();
  });

  it('renders section header with only name when code is empty', () => {
    const section = createMockSection({ code: '', name: 'Miscellaneous' });
    render(<BudgetSection section={section} />);
    expect(screen.getByText('Miscellaneous')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<BudgetSection section={createMockSection()} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Rate')).toBeInTheDocument();
    expect(screen.getByText('Overtime')).toBeInTheDocument();
    expect(screen.getByText('ESTIMATE')).toBeInTheDocument();
  });

  it('renders entry row with code and name', () => {
    const entry = createMockEntry({ code: 'A01', name: 'Camera Operator' });
    render(<BudgetSection section={createMockSection({ entries: [entry] })} />);
    expect(screen.getByText('A01')).toBeInTheDocument();
    expect(screen.getByText('Camera Operator')).toBeInTheDocument();
  });

  it('renders all entry rows', () => {
    const entries = [
      createMockEntry({ id: '1', code: 'A01', name: 'Director' }),
      createMockEntry({ id: '2', code: 'A02', name: 'Producer' }),
      createMockEntry({ id: '3', code: 'A03', name: 'Cinematographer' }),
    ];
    render(<BudgetSection section={createMockSection({ entries })} />);
    expect(screen.getByText('Director')).toBeInTheDocument();
    expect(screen.getByText('Producer')).toBeInTheDocument();
    expect(screen.getByText('Cinematographer')).toBeInTheDocument();
  });

  it('displays formatted currency for estimate', () => {
    const entry = createMockEntry({ estimate: 12500.5 });
    render(<BudgetSection section={createMockSection({ entries: [entry] })} />);
    expect(screen.getByText('12,500.50')).toBeInTheDocument();
  });

  it('displays formatted currency for rate', () => {
    const entry = createMockEntry({ rate: 1234.56 });
    render(<BudgetSection section={createMockSection({ entries: [entry] })} />);
    expect(screen.getByText('1,234.56')).toBeInTheDocument();
  });

  it('displays unit count and symbol for first unit', () => {
    const entry = createMockEntry({
      units: [{ label: 'Person', symbol: 'Persons', count: 5 }],
    });
    render(<BudgetSection section={createMockSection({ entries: [entry] })} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Persons')).toBeInTheDocument();
  });

  it('displays unit count and symbol for both units', () => {
    const entry = createMockEntry({
      units: [
        { label: 'Person', symbol: 'Persons', count: 2 },
        { label: 'Day', symbol: 'Days', count: 4 },
      ],
    });
    render(<BudgetSection section={createMockSection({ entries: [entry] })} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Persons')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();
  });

  it('shows dash when overtime is zero', () => {
    const entry = createMockEntry({ overtime: 0 });
    const section = createMockSection({ entries: [entry] });
    const { container } = render(<BudgetSection section={section} />);
    const tbodyCells = container.querySelectorAll('tbody td');
    const overtimeCell = tbodyCells[7];
    expect(overtimeCell.textContent).toBe('\u2013');
  });

  it('shows formatted overtime when overtime is positive', () => {
    const entry = createMockEntry({ overtime: 250.75 });
    render(<BudgetSection section={createMockSection({ entries: [entry] })} />);
    expect(screen.getByText('250.75')).toBeInTheDocument();
  });

  it('shows Sub Total row with formatted value', () => {
    const section = createMockSection({ subTotal: 15000 });
    render(<BudgetSection section={section} />);
    expect(screen.getByText('Sub Total')).toBeInTheDocument();
    expect(screen.getByText('15,000.00')).toBeInTheDocument();
  });

  it('shows fringes row when fringes is not null', () => {
    const section = createMockSection({ fringes: 1200.5 });
    render(<BudgetSection section={section} />);
    expect(screen.getByText('Fringes')).toBeInTheDocument();
    expect(screen.getByText('1,200.50')).toBeInTheDocument();
  });

  it('hides fringes row when fringes is null', () => {
    const section = createMockSection({ fringes: null });
    render(<BudgetSection section={section} />);
    expect(screen.queryByText('Fringes')).not.toBeInTheDocument();
  });

  it('shows TOTAL row with section code', () => {
    const section = createMockSection({ code: 'B', sectionTotal: 25000 });
    render(<BudgetSection section={section} />);
    expect(screen.getByText('TOTAL B')).toBeInTheDocument();
    expect(screen.getByText('25,000.00')).toBeInTheDocument();
  });

  it('shows TOTAL row without code when code is empty', () => {
    const section = createMockSection({ code: '', sectionTotal: 10000 });
    render(<BudgetSection section={section} />);
    const totalCell = screen.getByText((content, element) => {
      return !!element && element.textContent === 'TOTAL ';
    });
    expect(totalCell).toBeInTheDocument();
  });

  it('renders empty table body when no entries', () => {
    const section = createMockSection({ entries: [], subTotal: 0, sectionTotal: 0 });
    const { container } = render(<BudgetSection section={section} />);
    expect(screen.getByText('Sub Total')).toBeInTheDocument();
    const totalCells = container.querySelectorAll('tbody tr:last-child td');
    expect(totalCells[0].textContent).toMatch(/^TOTAL/);
  });
});
