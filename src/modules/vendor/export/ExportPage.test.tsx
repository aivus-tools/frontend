import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ExportPage } from './ExportPage';

vi.mock('@/services/client/offersApi', () => ({
  useGetOfferExportDataQuery: vi.fn(),
}));

vi.mock('./CoverPage', () => ({
  CoverPage: (props: { data: unknown }) => <div data-testid='cover-page'>CoverPage</div>,
}));

vi.mock('./TopSheet', () => ({
  TopSheet: (props: { data: unknown }) => <div data-testid='top-sheet'>TopSheet</div>,
}));

vi.mock('./AssumptionsPage', () => ({
  AssumptionsPage: (props: { data: unknown }) => <div data-testid='assumptions-page'>AssumptionsPage</div>,
}));

vi.mock('./BudgetDetail', () => ({
  BudgetDetail: (props: { data: unknown }) => <div data-testid='budget-detail'>BudgetDetail</div>,
}));

import { useGetOfferExportDataQuery } from '@/services/client/offersApi';

const mockedUseGetOfferExportDataQuery = vi.mocked(useGetOfferExportDataQuery);

const createMockExportData = (overrides: Record<string, unknown> = {}) => ({
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
  collaborators: [],
  categories: [],
  shareToken: null,
  ...overrides,
});

describe('ExportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading text when loading', () => {
    mockedUseGetOfferExportDataQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    render(<ExportPage offerId='offer-1' />);
    expect(screen.getByText('Loading export data...')).toBeInTheDocument();
  });

  it('shows error message when error occurs', () => {
    mockedUseGetOfferExportDataQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: 'Server error' },
      refetch: vi.fn(),
    } as never);

    render(<ExportPage offerId='offer-1' />);
    expect(screen.getByText('Failed to load export data. Please try again.')).toBeInTheDocument();
  });

  it('shows error message when data is undefined and not loading', () => {
    mockedUseGetOfferExportDataQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    render(<ExportPage offerId='offer-1' />);
    expect(screen.getByText('Failed to load export data. Please try again.')).toBeInTheDocument();
  });

  it('renders all sections when data is loaded', async () => {
    mockedUseGetOfferExportDataQuery.mockReturnValue({
      data: createMockExportData(),
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    render(<ExportPage offerId='offer-1' />);
    expect(await screen.findByTestId('cover-page')).toBeInTheDocument();
    expect(screen.getByTestId('top-sheet')).toBeInTheDocument();
    expect(screen.getByTestId('budget-detail')).toBeInTheDocument();
  });

  it('shows project name in toolbar', () => {
    mockedUseGetOfferExportDataQuery.mockReturnValue({
      data: createMockExportData({
        project: {
          id: 'p1',
          name: 'My Video Project',
          agencyName: null,
          clientName: null,
          brandName: null,
          clientManagers: [],
        },
      }),
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    render(<ExportPage offerId='offer-1' />);
    expect(screen.getByText(/My Video Project/)).toBeInTheDocument();
  });

  it('hides AssumptionsPage when assumptionsExclusions is null', () => {
    mockedUseGetOfferExportDataQuery.mockReturnValue({
      data: createMockExportData(),
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    render(<ExportPage offerId='offer-1' />);
    expect(screen.queryByTestId('assumptions-page')).not.toBeInTheDocument();
  });

  it('hides AssumptionsPage when assumptionsExclusions is empty string', () => {
    mockedUseGetOfferExportDataQuery.mockReturnValue({
      data: createMockExportData({ offer: { assumptionsExclusions: '' } }),
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    render(<ExportPage offerId='offer-1' />);
    expect(screen.queryByTestId('assumptions-page')).not.toBeInTheDocument();
  });

  it('shows AssumptionsPage when assumptionsExclusions is present', async () => {
    mockedUseGetOfferExportDataQuery.mockReturnValue({
      data: createMockExportData({ offer: { assumptionsExclusions: '<p>Some assumptions</p>' } }),
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    render(<ExportPage offerId='offer-1' />);
    expect(await screen.findByTestId('assumptions-page')).toBeInTheDocument();
  });

  it('calls window.print when Save as PDF button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    mockedUseGetOfferExportDataQuery.mockReturnValue({
      data: createMockExportData(),
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    render(<ExportPage offerId='offer-1' />);
    fireEvent.click(screen.getByText('Save as PDF'));
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });

  it('passes offerId to the query hook', () => {
    mockedUseGetOfferExportDataQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      refetch: vi.fn(),
    } as never);

    render(<ExportPage offerId='my-offer-id' />);
    expect(mockedUseGetOfferExportDataQuery).toHaveBeenCalledWith('my-offer-id');
  });
});
