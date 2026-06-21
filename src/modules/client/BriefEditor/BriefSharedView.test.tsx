import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import { BriefShareView } from '@/types/briefAi.interface';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

vi.mock('@/helpers/downloadPdf', () => ({
  downloadPdf: vi.fn(),
}));

vi.mock('@/lib/sanitizeHtml', () => ({
  sanitizeHtml: (html: string) => html,
}));

import { BriefSharedView } from './BriefSharedView';

const makeShareView = (kinds: string[]): BriefShareView => ({
  token: 'tok-1',
  briefId: 'brief-1',
  title: 'Test Brief',
  documentLanguage: 'en',
  conversationStatus: 'finalized',
  createdAt: null,
  documents: kinds.map((kind, i) => ({
    id: `doc-${i}`,
    kind: kind as BriefShareView['documents'][number]['kind'],
    html: `<p>${kind} content</p>`,
    plainText: `${kind} content`,
    createdAt: null,
    updatedAt: null,
  })),
});

const renderView = (data: BriefShareView) =>
  render(
    <App>
      <BriefSharedView data={data} />
    </App>
  );

describe('BriefSharedView', () => {
  it('renders production_brief tab when present', () => {
    renderView(makeShareView(['production_brief']));
    expect(screen.getByText('Production Brief')).toBeTruthy();
  });

  it('does not render vendor_email tab even when document is present', () => {
    renderView(makeShareView(['production_brief', 'vendor_email']));
    expect(screen.queryByText('Vendor Email')).toBeNull();
  });

  it('does not render vendor_email tab when only vendor_email is in documents', () => {
    renderView(makeShareView(['vendor_email']));
    expect(screen.queryByText('Vendor Email')).toBeNull();
  });

  it('renders deliverables_checklist tab when present', () => {
    renderView(makeShareView(['production_brief', 'deliverables_checklist']));
    expect(screen.getByText('Deliverables')).toBeTruthy();
  });

  it('renders brief title in header', () => {
    renderView(makeShareView(['production_brief']));
    expect(screen.getAllByText('Test Brief').length).toBeGreaterThan(0);
  });
});
