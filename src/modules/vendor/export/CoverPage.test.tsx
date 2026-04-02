import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CoverPage } from './CoverPage';
import { OfferExportData } from '@/types/exportData.interface';

vi.mock('qrcode.react', () => ({
  QRCodeSVG: (props: { value: string; size: number }) => <svg data-testid='qr-code' data-value={props.value} />,
}));

const createMockData = (overrides: Partial<OfferExportData> = {}): OfferExportData => ({
  offer: {
    id: 'offer-1',
    uuid: 'offer-uuid-123',
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
    name: 'Test Commercial',
    agencyName: null,
    clientName: null,
    brandName: null,
    clientManagers: [],
    ...((overrides.project as Record<string, unknown>) ?? {}),
  },
  vendor: {
    name: 'John Smith',
    companyName: null,
    logoUrl: null,
    ...((overrides.vendor as Record<string, unknown>) ?? {}),
  },
  collaborators: overrides.collaborators ?? [],
  categories: overrides.categories ?? [],
  shareToken: overrides.shareToken ?? null,
});

describe('CoverPage', () => {
  it('renders project name', () => {
    const data = createMockData({
      project: {
        id: 'p1',
        name: 'Super Bowl Ad 2026',
        agencyName: null,
        clientName: null,
        brandName: null,
        clientManagers: [],
      },
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Super Bowl Ad 2026')).toBeInTheDocument();
  });

  it('renders vendor company name when available', () => {
    const data = createMockData({
      vendor: { name: 'John Smith', companyName: 'Smith Productions', logoUrl: null },
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Smith Productions')).toBeInTheDocument();
  });

  it('renders vendor personal name when companyName is null', () => {
    const data = createMockData({
      vendor: { name: 'John Smith', companyName: null, logoUrl: null },
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  it('renders client name and brand name', () => {
    const data = createMockData({
      project: {
        id: 'p1',
        name: 'Project',
        agencyName: null,
        clientName: 'Coca-Cola',
        brandName: 'Coke Zero',
        clientManagers: [],
      },
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Coca-Cola / Coke Zero')).toBeInTheDocument();
  });

  it('renders only client name when brand is null', () => {
    const data = createMockData({
      project: { id: 'p1', name: 'Project', agencyName: null, clientName: 'Nike', brandName: null, clientManagers: [] },
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Nike')).toBeInTheDocument();
  });

  it('renders client manager name with position', () => {
    const data = createMockData({
      project: {
        id: 'p1',
        name: 'Project',
        agencyName: null,
        clientName: null,
        brandName: null,
        clientManagers: [{ id: 'cm-1', name: 'Jane Doe', position: 'VP Marketing' }],
      },
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Jane Doe, VP Marketing')).toBeInTheDocument();
  });

  it('renders client manager name without position', () => {
    const data = createMockData({
      project: {
        id: 'p1',
        name: 'Project',
        agencyName: null,
        clientName: null,
        brandName: null,
        clientManagers: [{ id: 'cm-1', name: 'Jane Doe', position: '' }],
      },
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows QR code when share token exists', () => {
    const data = createMockData({ shareToken: 'abc-123-token' });
    render(<CoverPage data={data} />);
    const qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode.getAttribute('data-value')).toContain('/public/abc-123-token');
  });

  it('hides QR code when share token is null', () => {
    const data = createMockData({ shareToken: null });
    render(<CoverPage data={data} />);
    expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument();
  });

  it('renders deliverables', () => {
    const data = createMockData({
      offer: {
        deliverables: [
          { quantity: 2, duration: '30', durationUnit: 'sec', notes: 'with VFX', sortOrder: 0 },
          { quantity: 1, duration: '60', durationUnit: 'sec', notes: '', sortOrder: 1 },
        ],
      } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Deliverables:')).toBeInTheDocument();
    expect(screen.getByText(/2 x :30 sec\./)).toBeInTheDocument();
    expect(screen.getByText(/1 x :60 sec\./)).toBeInTheDocument();
  });

  it('hides deliverables section when no deliverables', () => {
    const data = createMockData({
      offer: { deliverables: [] } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.queryByText('Deliverables:')).not.toBeInTheDocument();
  });

  it('shows notes when coverPageNotes is present', () => {
    const data = createMockData({
      offer: { coverPageNotes: '<p>Important note about this bid.</p>' } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Notes:')).toBeInTheDocument();
  });

  it('hides notes section when coverPageNotes is null', () => {
    const data = createMockData({
      offer: { coverPageNotes: null } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
  });

  it('hides notes section when coverPageNotes is empty string', () => {
    const data = createMockData({
      offer: { coverPageNotes: '' } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
  });

  it('renders AIVUS ID', () => {
    const data = createMockData({
      offer: { uuid: 'UUID-ABC-123' } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('AIVUS ID:')).toBeInTheDocument();
    expect(screen.getByText('UUID-ABC-123')).toBeInTheDocument();
  });

  it('renders bid date when available', () => {
    const data = createMockData({
      offer: { bidDate: '2026-03-15' } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Bid Date:')).toBeInTheDocument();
    expect(screen.getByText('3/15/2026')).toBeInTheDocument();
  });

  it('renders revision when available', () => {
    const data = createMockData({
      offer: { revision: 'Rev 2' } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Bid Version:')).toBeInTheDocument();
    expect(screen.getByText('Rev 2')).toBeInTheDocument();
  });

  it('shows Initial Bidding when revision is null', () => {
    const data = createMockData({
      offer: { revision: null } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Initial Bidding')).toBeInTheDocument();
  });

  it('renders producer name from collaborators', () => {
    const data = createMockData({
      collaborators: [{ id: 'c1', name: 'Mike Producer', email: 'mike@test.com', role: 'producer' }],
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Producer:')).toBeInTheDocument();
    expect(screen.getByText('Mike Producer')).toBeInTheDocument();
  });

  it('renders agency producer from collaborators', () => {
    const data = createMockData({
      collaborators: [{ id: 'c2', name: 'Sarah Agency', email: 'sarah@agency.com', role: 'agency_producer' }],
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Agency Producer:')).toBeInTheDocument();
    expect(screen.getByText('Sarah Agency')).toBeInTheDocument();
  });

  it('renders agency name', () => {
    const data = createMockData({
      project: {
        id: 'p1',
        name: 'Project',
        agencyName: 'Big Agency Inc',
        clientName: null,
        brandName: null,
        clientManagers: [],
      },
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Agency:')).toBeInTheDocument();
    expect(screen.getByText('Big Agency Inc')).toBeInTheDocument();
  });

  it('renders territory', () => {
    const data = createMockData({
      offer: { territory: ['US', 'Canada', 'UK'] } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Territory:')).toBeInTheDocument();
    expect(screen.getByText('US, Canada, UK')).toBeInTheDocument();
  });

  it('renders media placements', () => {
    const data = createMockData({
      offer: { mediaPlacements: ['TV', 'Digital', 'Social'] } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Media / Placements:')).toBeInTheDocument();
    expect(screen.getByText('TV, Digital, Social')).toBeInTheDocument();
  });

  it('renders term', () => {
    const data = createMockData({
      offer: { term: '12 months' } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText('Term:')).toBeInTheDocument();
    expect(screen.getByText('12 months')).toBeInTheDocument();
  });

  it('renders vendor logo when logoUrl is provided', () => {
    const data = createMockData({
      vendor: { name: 'Vendor', companyName: 'Vendor Co', logoUrl: 'https://example.com/logo.png' },
    });
    render(<CoverPage data={data} />);
    const logo = screen.getByAltText('Vendor Co');
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('src')).toBe('https://example.com/logo.png');
  });

  it('hides logo when logoUrl is null', () => {
    const data = createMockData({
      vendor: { name: 'Vendor', companyName: 'Vendor Co', logoUrl: null },
    });
    render(<CoverPage data={data} />);
    expect(screen.queryByAltText('Vendor Co')).not.toBeInTheDocument();
  });

  it('renders deliverable notes when present', () => {
    const data = createMockData({
      offer: {
        deliverables: [{ quantity: 1, duration: '15', durationUnit: 'sec', notes: 'Behind the scenes', sortOrder: 0 }],
      } as never,
    });
    render(<CoverPage data={data} />);
    expect(screen.getByText(/Behind the scenes/)).toBeInTheDocument();
  });
});
