import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TopSheet } from './TopSheet';
import { OfferExportData, ExportCategorySection } from '@/types/exportData.interface';

vi.mock('@/helpers/excelExport/exportUtils', () => ({
  buildSectionFees: vi.fn(() => []),
}));

import { buildSectionFees } from '@/helpers/excelExport/exportUtils';

const mockedBuildSectionFees = vi.mocked(buildSectionFees);

beforeEach(() => {
  mockedBuildSectionFees.mockClear();
  mockedBuildSectionFees.mockReturnValue([]);
});

const createMockCategory = (overrides: Partial<ExportCategorySection> = {}): ExportCategorySection => ({
  id: 'cat-1',
  code: 'A',
  name: 'Pre-Production',
  level: 1,
  parentCategoryId: null,
  parentCategoryName: null,
  parentCategoryCode: null,
  tags: ['production'],
  parentTags: [],
  entries: [],
  subTotal: 5000,
  fringes: null,
  sectionTotal: 5000,
  ...overrides,
});

const createMockData = (overrides: Partial<OfferExportData> = {}): OfferExportData => ({
  offer: {
    id: 'offer-1',
    uuid: 'uuid-1',
    status: 'PUBLISHED',
    revision: null,
    bidDate: null,
    term: null,
    territory: [],
    mediaPlacements: [],
    coverPageNotes: null,
    assumptionsExclusions: null,
    fringesPercent: '0',
    handlingPercent: '0',
    markupPercent: '0',
    productionInsurancePercent: '0',
    productionFeePercent: '0',
    postMarkupPercent: '0',
    postInsurancePercent: '0',
    postTaxPercent: '0',
    deliverables: [],
    scheduleEntries: [],
    cost: null,
    customFeeNames: {},
    categoryExternalMarkup: {},
    ...((overrides.offer as Record<string, unknown>) ?? {}),
  },
  project: {
    id: 'project-1',
    name: 'Test Project',
    agencyName: null,
    clientName: null,
    brandName: null,
    clientManagers: [],
    ...((overrides.project as Record<string, unknown>) ?? {}),
  },
  vendor: {
    name: 'Test Vendor',
    companyName: null,
    logoUrl: null,
    ...((overrides.vendor as Record<string, unknown>) ?? {}),
  },
  collaborators: overrides.collaborators ?? [],
  categories: overrides.categories ?? [createMockCategory()],
  shareToken: overrides.shareToken ?? null,
});

describe('TopSheet', () => {
  it('renders section table with category name in header', () => {
    const data = createMockData({
      categories: [createMockCategory({ name: 'Production' })],
    });
    render(<TopSheet data={data} />);
    const matches = screen.getAllByText('Production');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders multiple section tables for multiple top-level categories', () => {
    const data = createMockData({
      categories: [
        createMockCategory({ id: 'cat-1', code: 'A', name: 'Production', sectionTotal: 5000 }),
        createMockCategory({ id: 'cat-2', code: 'B', name: 'Post-Production', sectionTotal: 3000 }),
      ],
    });
    render(<TopSheet data={data} />);
    const prodMatches = screen.getAllByText('Production');
    const postMatches = screen.getAllByText('Post-Production');
    expect(prodMatches.length).toBeGreaterThanOrEqual(1);
    expect(postMatches.length).toBeGreaterThanOrEqual(1);
  });

  it('groups subcategories under parent category', () => {
    const data = createMockData({
      categories: [
        createMockCategory({
          id: 'sub-1',
          code: 'A1',
          name: 'Crew',
          parentCategoryId: 'parent-1',
          parentCategoryName: 'Production',
          parentCategoryCode: 'A',
          parentTags: ['production'],
          sectionTotal: 3000,
        }),
        createMockCategory({
          id: 'sub-2',
          code: 'A2',
          name: 'Equipment',
          parentCategoryId: 'parent-1',
          parentCategoryName: 'Production',
          parentCategoryCode: 'A',
          parentTags: ['production'],
          sectionTotal: 2000,
        }),
      ],
    });
    render(<TopSheet data={data} />);
    expect(screen.getByText('Crew')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
  });

  it('shows sub-total row for grouped categories', () => {
    const data = createMockData({
      categories: [
        createMockCategory({
          id: 'sub-1',
          code: 'A1',
          name: 'Crew',
          parentCategoryId: 'parent-1',
          parentCategoryName: 'Production',
          parentCategoryCode: 'A',
          parentTags: ['production'],
          sectionTotal: 3000,
        }),
        createMockCategory({
          id: 'sub-2',
          code: 'A2',
          name: 'Equipment',
          parentCategoryId: 'parent-1',
          parentCategoryName: 'Production',
          parentCategoryCode: 'A',
          parentTags: ['production'],
          sectionTotal: 2000,
        }),
      ],
    });
    render(<TopSheet data={data} />);
    expect(screen.getByText('Sub-Total Production')).toBeInTheDocument();
  });

  it('shows section total row', () => {
    const data = createMockData({
      categories: [createMockCategory({ name: 'Production', sectionTotal: 8000 })],
    });
    render(<TopSheet data={data} />);
    expect(screen.getByText('PRODUCTION TOTAL')).toBeInTheDocument();
  });

  it('shows GRAND TOTAL row', () => {
    const data = createMockData({
      categories: [createMockCategory({ sectionTotal: 5000 })],
    });
    render(<TopSheet data={data} />);
    expect(screen.getByText('GRAND TOTAL')).toBeInTheDocument();
  });

  it('displays formatted currency for category total', () => {
    const data = createMockData({
      categories: [createMockCategory({ sectionTotal: 12500.75 })],
    });
    render(<TopSheet data={data} />);
    const matches = screen.getAllByText('12,500.75');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('displays dash for zero values', () => {
    const data = createMockData({
      categories: [createMockCategory({ sectionTotal: 0 })],
    });
    render(<TopSheet data={data} />);
    const dashes = screen.getAllByText('\u2013');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('calculates grand total as sum of all section totals plus fees', () => {
    const data = createMockData({
      categories: [
        createMockCategory({ id: 'cat-1', code: 'A', name: 'Production', sectionTotal: 5000 }),
        createMockCategory({ id: 'cat-2', code: 'B', name: 'Post-Production', sectionTotal: 3000 }),
      ],
    });
    render(<TopSheet data={data} />);
    const matches = screen.getAllByText('8,000.00');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('includes fees in section total and grand total', () => {
    mockedBuildSectionFees.mockReturnValue([{ label: 'Production Insurance', percent: 5, value: 250 }]);
    const data = createMockData({
      categories: [createMockCategory({ sectionTotal: 5000 })],
    });
    render(<TopSheet data={data} />);
    expect(screen.getByText('Production Insurance')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
    const matches = screen.getAllByText('5,250.00');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders NOTE column header', () => {
    const data = createMockData();
    render(<TopSheet data={data} />);
    expect(screen.getByText('NOTE')).toBeInTheDocument();
  });

  it('calls buildSectionFees for each group', () => {
    const data = createMockData({
      categories: [
        createMockCategory({ id: 'cat-1', code: 'A', name: 'Production', tags: ['production'], sectionTotal: 5000 }),
        createMockCategory({ id: 'cat-2', code: 'B', name: 'Post', tags: ['post_production'], sectionTotal: 3000 }),
      ],
    });
    render(<TopSheet data={data} />);
    expect(mockedBuildSectionFees).toHaveBeenCalledTimes(2);
  });
});
