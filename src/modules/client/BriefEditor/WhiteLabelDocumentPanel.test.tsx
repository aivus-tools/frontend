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
    });
    renderPanel();
    expect(document.querySelector('.ant-spin')).toBeTruthy();
  });

  it('shows missing doc message when no production_brief document', () => {
    mocks.getDocuments.mockReturnValue({
      data: { ...mockPackage, documents: [] },
      isLoading: false,
      isError: false,
    });
    renderPanel();
    expect(screen.getByText('This document is not available.')).toBeTruthy();
  });
});
