import React, { createRef } from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import type { WhiteLabelDocumentHandle } from './WhiteLabelDocumentPanel';

const flushMicrotasks = () =>
  new Promise<void>((resolve) => {
    Promise.resolve().then(() => {
      Promise.resolve().then(resolve);
    });
  });

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

let registeredOnUpdate: ((args: { editor: { getHTML: () => string } }) => void) | null = null;
const mockSetContent = vi.fn();
const mockEditorCurrentHtml = { value: '<p>Brief content</p>' };
const mockGetHTML = vi.fn(() => mockEditorCurrentHtml.value);
const mockEditorInstance = {
  getHTML: mockGetHTML,
  commands: {
    setContent: (html: string, opts?: unknown) => {
      mockSetContent(html, opts);
      mockEditorCurrentHtml.value = html;
    },
  },
  isActive: () => false,
  can: () => ({ undo: () => false, redo: () => false }),
  chain: () => ({
    focus: () => ({
      toggleBold: () => ({ run: vi.fn() }),
      toggleItalic: () => ({ run: vi.fn() }),
      toggleUnderline: () => ({ run: vi.fn() }),
      toggleHeading: () => ({ run: vi.fn() }),
      toggleBulletList: () => ({ run: vi.fn() }),
      undo: () => ({ run: vi.fn() }),
      redo: () => ({ run: vi.fn() }),
    }),
  }),
};

let editorMounted = false;
vi.mock('@tiptap/react', () => ({
  useEditor: (config: { content?: string; onUpdate?: (args: { editor: { getHTML: () => string } }) => void }) => {
    if (!editorMounted && config.content != null) {
      mockEditorCurrentHtml.value = config.content;
      editorMounted = true;
    }
    if (config.onUpdate) {
      registeredOnUpdate = config.onUpdate;
    }
    return mockEditorInstance;
  },
  EditorContent: () => React.createElement('div', { 'data-testid': 'editor-content' }),
}));
vi.mock('@tiptap/starter-kit', () => ({ default: {} }));
vi.mock('@tiptap/extension-link', () => ({ default: { configure: () => ({}) } }));
vi.mock('@tiptap/extension-underline', () => ({ default: {} }));
vi.mock('@tiptap/extension-placeholder', () => ({ default: { configure: () => ({}) } }));

const mocks = vi.hoisted(() => ({
  getDocuments: vi.fn(),
  updateDocument: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
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
    editorMounted = false;
    mockEditorCurrentHtml.value = '<p>Brief content</p>';
    mockSetContent.mockClear();
    registeredOnUpdate = null;
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

  it('shows finalize failed error when finalizeFailed is true', () => {
    mocks.getDocuments.mockReturnValue({
      data: { ...mockPackage, finalizeFailed: true, documents: [] },
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });
    renderPanel();
    expect(screen.getByText('Could not finalize the brief. Please try again.')).toBeTruthy();
    expect(screen.getByText('Send a message in the chat to retry generation.')).toBeTruthy();
  });

  it('exposes flush() method via ref that resolves without throwing', async () => {
    const ref = createRef<WhiteLabelDocumentHandle>();
    render(
      <App>
        <WhiteLabelDocumentPanel ref={ref} briefId='brief-1' token='tok-1' />
      </App>
    );
    expect(ref.current).not.toBeNull();
    await act(async () => {
      await ref.current?.flush();
    });
  });

  it('exposes getLatestHtml() method via ref', () => {
    const ref = createRef<WhiteLabelDocumentHandle>();
    render(
      <App>
        <WhiteLabelDocumentPanel ref={ref} briefId='brief-1' token='tok-1' />
      </App>
    );
    expect(typeof ref.current?.getLatestHtml()).toBe('string');
  });

  it('switches tab without error when both documents present', async () => {
    const twoDocPackage = {
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
    };

    mocks.getDocuments.mockReturnValue({
      data: twoDocPackage,
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });

    render(
      <App>
        <WhiteLabelDocumentPanel briefId='brief-1' token='tok-1' />
      </App>
    );

    const deliverablesTab = screen.getAllByText('Deliverables')[0];
    await userEvent.click(deliverablesTab);
    expect(screen.getAllByText('Deliverables').length).toBeGreaterThan(0);
  });

  it('MF: getProductionBriefHtml returns production_brief html when deliverables tab is active', async () => {
    const twoDocPackage = {
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
    };

    mocks.getDocuments.mockReturnValue({
      data: twoDocPackage,
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });

    const ref = createRef<WhiteLabelDocumentHandle>();
    render(
      <App>
        <WhiteLabelDocumentPanel ref={ref} briefId='brief-1' token='tok-1' />
      </App>
    );

    const deliverablesTab = screen.getAllByText('Deliverables')[0];
    await userEvent.click(deliverablesTab);

    const html = ref.current?.getProductionBriefHtml();
    expect(typeof html).toBe('string');
    expect(html).not.toContain('Deliverables');
  });

  describe('resync after autosave (R14-1-RESYNC-TEST-GAP)', () => {
    it('applies AI edit via setContent after autosave timer completes (saveTimerRef=null)', async () => {
      vi.useFakeTimers();

      const docA = {
        id: 'doc-1',
        kind: 'production_brief' as const,
        html: '<p>Brief content</p>',
        plainText: 'A',
        createdAt: null,
        updatedAt: null,
      };
      const docB = {
        id: 'doc-1',
        kind: 'production_brief' as const,
        html: '<p>B</p>',
        plainText: 'B',
        createdAt: null,
        updatedAt: null,
      };

      mocks.getDocuments.mockReturnValue({
        data: { ...mockPackage, documents: [docA] },
        isLoading: false,
        isError: false,
        refetch: mocks.refetch,
      });
      mocks.updateDocument.mockReturnValue({ unwrap: () => Promise.resolve() });

      const { rerender } = render(
        <App>
          <WhiteLabelDocumentPanel briefId='brief-1' token='tok-1' />
        </App>
      );

      act(() => {
        if (registeredOnUpdate) {
          registeredOnUpdate({ editor: { getHTML: () => '<p>Brief content</p>' } });
        }
      });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      mockEditorCurrentHtml.value = '<p>Brief content</p>';

      mocks.getDocuments.mockReturnValue({
        data: { ...mockPackage, documents: [docB] },
        isLoading: false,
        isError: false,
        refetch: mocks.refetch,
      });

      await act(async () => {
        rerender(
          <App>
            <WhiteLabelDocumentPanel briefId='brief-1' token='tok-1' />
          </App>
        );
        await Promise.resolve();
      });

      expect(mockSetContent).toHaveBeenCalledWith('<p>B</p>', { emitUpdate: false });

      vi.useRealTimers();
    });

    it('does not apply AI edit via setContent while autosave timer is in flight (saveTimerRef active)', async () => {
      vi.useFakeTimers();

      const docA = {
        id: 'doc-1',
        kind: 'production_brief' as const,
        html: '<p>Brief content</p>',
        plainText: 'A',
        createdAt: null,
        updatedAt: null,
      };
      const docB = {
        id: 'doc-1',
        kind: 'production_brief' as const,
        html: '<p>B</p>',
        plainText: 'B',
        createdAt: null,
        updatedAt: null,
      };

      mocks.getDocuments.mockReturnValue({
        data: { ...mockPackage, documents: [docA] },
        isLoading: false,
        isError: false,
        refetch: mocks.refetch,
      });

      const { rerender } = render(
        <App>
          <WhiteLabelDocumentPanel briefId='brief-1' token='tok-1' />
        </App>
      );

      act(() => {
        if (registeredOnUpdate) {
          registeredOnUpdate({ editor: { getHTML: () => '<p>Brief content</p>' } });
        }
      });

      mocks.getDocuments.mockReturnValue({
        data: { ...mockPackage, documents: [docB] },
        isLoading: false,
        isError: false,
        refetch: mocks.refetch,
      });

      await act(async () => {
        rerender(
          <App>
            <WhiteLabelDocumentPanel briefId='brief-1' token='tok-1' />
          </App>
        );
        await Promise.resolve();
      });

      expect(mockSetContent).not.toHaveBeenCalled();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      vi.useRealTimers();
    });
  });
});
