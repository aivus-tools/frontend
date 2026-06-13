import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import type { BriefFinalPackage as BriefFinalPackageType } from '@/types/briefAi.interface';

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
  getBriefDetail: vi.fn(),
  getBriefShare: vi.fn(),
  createShare: vi.fn(),
  updateShare: vi.fn(),
  updateDocument: vi.fn(),
  getPreVendors: vi.fn(),
  getPreVendorsRaw: vi.fn(),
}));

vi.mock('@/services/client/briefAiApi', () => ({
  useGetBriefAiDetailQuery: mocks.getBriefDetail,
  useGetBriefAiShareQuery: mocks.getBriefShare,
  useCreateBriefAiShareMutation: () => [mocks.createShare, { isLoading: false }],
  useUpdateBriefAiShareMutation: () => [mocks.updateShare, { isLoading: false }],
  useUpdateBriefAiFinalDocumentMutation: () => [mocks.updateDocument, {}],
}));

vi.mock('@/services/client/preVendorsApi', () => ({
  useGetPreVendorsQuery: (_args: unknown, options?: { skip?: boolean }) => {
    mocks.getPreVendorsRaw(options);
    return mocks.getPreVendors(_args, options);
  },
}));

vi.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ isMobile: false, ready: true }),
}));

vi.mock('@tiptap/react', () => ({
  useEditor: () => null,
  EditorContent: () => null,
}));

vi.mock('@tiptap/starter-kit', () => ({ default: {} }));
vi.mock('@tiptap/extension-link', () => ({ default: { configure: () => ({}) } }));
vi.mock('@tiptap/extension-underline', () => ({ default: {} }));
vi.mock('@tiptap/extension-placeholder', () => ({ default: { configure: () => ({}) } }));

import { BriefFinalPackage } from './BriefFinalPackage';

const mockPackage: BriefFinalPackageType = {
  briefId: 'brief-1',
  conversationStatus: 'finalized',
  documents: [
    {
      id: 'doc-1',
      kind: 'production_brief',
      html: '<p>Production brief content</p>',
      plainText: 'Production brief content',
      createdAt: null,
      updatedAt: null,
    },
    {
      id: 'doc-2',
      kind: 'vendor_email',
      html: '<p>Vendor email content</p>',
      plainText: 'Vendor email content',
      createdAt: null,
      updatedAt: null,
    },
  ],
};

const renderPackage = (whiteLabel = false) =>
  render(
    <App>
      <BriefFinalPackage briefId='brief-1' package={mockPackage} whiteLabel={whiteLabel} />
    </App>
  );

describe('BriefFinalPackage', () => {
  beforeEach(() => {
    mocks.getBriefDetail.mockReturnValue({ data: { title: 'Test Brief' } });
    mocks.getBriefShare.mockReturnValue({ data: null, isFetching: false });
    mocks.getPreVendors.mockReturnValue({ data: { preVendors: [] } });
    mocks.getPreVendorsRaw.mockClear();
  });

  describe('without whiteLabel', () => {
    it('shows vendor_email tab', () => {
      renderPackage(false);
      expect(screen.getByText('Vendor Email')).toBeTruthy();
    });

    it('shows Download PDF button', () => {
      renderPackage(false);
      expect(screen.getByText('Download PDF')).toBeTruthy();
    });

    it('shows Share button', () => {
      renderPackage(false);
      expect(screen.getByText('Share')).toBeTruthy();
    });
  });

  describe('with whiteLabel=true', () => {
    it('hides vendor_email tab', () => {
      renderPackage(true);
      expect(screen.queryByText('Vendor Email')).toBeNull();
    });

    it('hides Download PDF button', () => {
      renderPackage(true);
      expect(screen.queryByText('Download PDF')).toBeNull();
    });

    it('hides Share button', () => {
      renderPackage(true);
      expect(screen.queryByText('Share')).toBeNull();
    });

    it('still shows production_brief editor tab', () => {
      renderPackage(true);
      expect(screen.getByText('Production Brief')).toBeTruthy();
    });

    it('does not show PreVendorsBlock even when preVendors exist', () => {
      mocks.getPreVendors.mockReturnValue({
        data: {
          preVendors: [
            {
              id: 'pv-1',
              name: 'Vendor A',
              email: 'a@vendor.com',
              logoUrl: null,
              description: '',
              language: 'en',
            },
          ],
        },
      });
      renderPackage(true);
      expect(screen.queryByText('Vendor A')).toBeNull();
    });

    it('SF-8: pre-vendors query is skipped when isWhiteLabel=true', () => {
      renderPackage(true);
      expect(mocks.getPreVendorsRaw).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    });
  });

  describe('without whiteLabel (SF-8)', () => {
    it('pre-vendors query is not skipped when isWhiteLabel=false', () => {
      renderPackage(false);
      expect(mocks.getPreVendorsRaw).toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
    });
  });

  describe('SF-15: deliverables_checklist in package', () => {
    it('renders without errors when package contains deliverables_checklist', () => {
      const packageWithChecklist: BriefFinalPackageType = {
        ...mockPackage,
        documents: [
          ...mockPackage.documents,
          {
            id: 'doc-3',
            kind: 'deliverables_checklist',
            html: '<p>Checklist</p>',
            plainText: 'Checklist',
            createdAt: null,
            updatedAt: null,
          },
        ],
      };
      const { unmount } = render(
        <App>
          <BriefFinalPackage briefId='brief-1' package={packageWithChecklist} />
        </App>
      );
      expect(screen.getByText('Production Brief')).toBeTruthy();
      unmount();
    });
  });
});
