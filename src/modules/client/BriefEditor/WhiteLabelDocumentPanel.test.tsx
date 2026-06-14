import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';

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

const mocks = vi.hoisted(() => ({
  getDocuments: vi.fn(),
  updateDocument: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock('@/services/client/publicBriefApi', () => ({
  useGetPublicBriefFinalDocumentsQuery: mocks.getDocuments,
  useUpdatePublicBriefFinalDocumentMutation: () => [mocks.updateDocument, {}],
}));

import { WhiteLabelDocumentPanel } from './WhiteLabelDocumentPanel';

const mockPackage = {
  briefId: 'brief-1',
  conversationStatus: 'finalized' as const,
  documents: [
    {
      id: 'doc-1',
      kind: 'production_brief' as const,
      html: '<p>Brief content</p>',
      plainText: 'Brief content',
      createdAt: null,
      updatedAt: null,
    },
  ],
  generating: false,
};

const renderPanel = () =>
  render(
    <App>
      <WhiteLabelDocumentPanel briefId='brief-1' token='tok-1' />
    </App>
  );

describe('WhiteLabelDocumentPanel', () => {
  beforeEach(() => {
    mocks.getDocuments.mockReturnValue({
      data: mockPackage,
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });
  });

  it('renders production brief tab', () => {
    renderPanel();
    expect(screen.getByText('Production Brief')).toBeTruthy();
  });

  it('shows loading state', () => {
    mocks.getDocuments.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mocks.refetch,
    });
    renderPanel();
    expect(document.querySelector('.ant-spin')).toBeTruthy();
  });

  it('shows generating spinner when generating is true', () => {
    mocks.getDocuments.mockReturnValue({
      data: { ...mockPackage, generating: true, documents: [] },
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });
    renderPanel();
    expect(document.querySelector('.ant-spin')).toBeTruthy();
    expect(screen.getByText('Preparing your brief...')).toBeTruthy();
  });

  it('shows missing doc message when no production_brief document', () => {
    mocks.getDocuments.mockReturnValue({
      data: { ...mockPackage, documents: [] },
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });
    renderPanel();
    expect(screen.getByText('This document is not available.')).toBeTruthy();
  });

  it('passes pollingInterval > 0 to query hook when generating is true', () => {
    mocks.getDocuments.mockReturnValue({
      data: { ...mockPackage, generating: true, documents: [] },
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });
    renderPanel();
    const allCalls: unknown[][] = mocks.getDocuments.mock.calls;
    const lastCall = allCalls[allCalls.length - 1];
    const options = lastCall?.[1] as { pollingInterval?: number; skip?: boolean } | undefined;
    expect(options?.pollingInterval).toBeGreaterThan(0);
  });

  it('passes pollingInterval 0 to query hook when not generating', () => {
    renderPanel();
    const allCalls: unknown[][] = mocks.getDocuments.mock.calls;
    const lastCall = allCalls[allCalls.length - 1];
    const options = lastCall?.[1] as { pollingInterval?: number; skip?: boolean } | undefined;
    expect(!options?.pollingInterval || options.pollingInterval === 0).toBe(true);
  });

  it('shows deliverables tab when deliverables_checklist document is present', () => {
    mocks.getDocuments.mockReturnValue({
      data: {
        ...mockPackage,
        documents: [
          ...mockPackage.documents,
          {
            id: 'doc-2',
            kind: 'deliverables_checklist' as const,
            html: '<p>Deliverables</p>',
            plainText: 'Deliverables',
            createdAt: null,
            updatedAt: null,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });
    renderPanel();
    expect(screen.getByText('Production Brief')).toBeTruthy();
    expect(screen.getByText('Deliverables')).toBeTruthy();
  });

  it('does not show deliverables tab when only production_brief exists', () => {
    renderPanel();
    expect(screen.queryByText('Deliverables')).toBeNull();
  });
});
