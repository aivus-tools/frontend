import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';

const state = vi.hoisted(() => ({
  embed: false,
  isMobile: true,
  conversationStatus: 'in_progress' as string,
  briefSent: false,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(state.embed ? 'embed=1' : ''),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

vi.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ isMobile: state.isMobile, isDesktop: !state.isMobile, ready: true }),
}));

vi.mock('@/services/client/publicBriefApi', () => ({
  getPublicBriefToken: () => 'tok',
  savePublicBriefToken: vi.fn(),
  useGetPublicBriefBySlugQuery: () => ({
    data: { valid: true, vendorName: 'Acme', vendorLogoUrl: 'https://logo.test/acme.png' },
    isLoading: false,
  }),
  useGetPublicBriefDetailQuery: () => ({ data: { conversationStatus: state.conversationStatus } }),
}));

vi.mock('@/services/client/briefAiApi', () => ({
  useGetBriefAiDetailQuery: () => ({ data: undefined }),
  useGetSentBriefIdsToVendorQuery: () => ({ data: undefined }),
  briefAiApi: { util: { invalidateTags: vi.fn() } },
}));

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
}));

vi.mock('@/helpers/pendingBrief', () => ({
  setPendingBrief: vi.fn(),
  isBriefSent: () => state.briefSent,
  markBriefAsSent: vi.fn(),
  clearDraftForSlug: vi.fn(),
  getDraftForSlug: () => null,
}));

vi.mock('./AnonymousBriefEditor', () => ({
  AnonymousBriefEditor: () => <div data-testid='anon-editor' />,
}));

vi.mock('./AuthenticatedBriefEditor', () => ({
  AuthenticatedBriefEditor: () => <div data-testid='auth-editor' />,
}));

vi.mock('./WhiteLabelDocumentPanel', () => ({
  WhiteLabelDocumentPanel: () => <div data-testid='doc-panel' />,
}));

vi.mock('./SendBriefModal', () => ({
  SendBriefModal: () => <div data-testid='send-modal' />,
}));

vi.mock('@/lib/i18n', () => ({
  t: (key: string, arg?: string) => {
    if (key === 'BRANDED_BRIEF_FOR') {
      return `Brief for ${arg}`;
    }
    const map: Record<string, string> = {
      BRANDED_BRIEF_SEND: 'Send brief',
      BRIEF_TAB_CHAT: 'Chat',
      BRIEF_TAB_BRIEF: 'Brief',
      BRANDED_BRIEF_ALREADY_SENT: 'Brief already sent to this vendor.',
      BRANDED_BRIEF_NOT_FOUND_TITLE: 'Not found',
      BRIEF_V3_DOCUMENT_MISSING: 'Document missing',
    };
    return map[key] ?? key;
  },
  getLocale: () => 'en',
}));

import { BrandedBriefWorkspace } from './BrandedBriefWorkspace';

describe('BrandedBriefWorkspace embed layout', () => {
  beforeEach(() => {
    state.embed = false;
    state.isMobile = true;
    state.conversationStatus = 'in_progress';
    state.briefSent = false;
    vi.clearAllMocks();
  });

  it('embed mobile, brief ready: bottom bar with tabs and Send brief, no top branding', () => {
    state.embed = true;
    state.conversationStatus = 'ready_to_finalize';

    render(<BrandedBriefWorkspace slug='acme' initialBriefId='b1' />);

    const bar = screen.getByTestId('embed-bottom-bar');
    expect(bar).toBeInTheDocument();
    expect(within(bar).getByRole('tab', { name: 'Chat' })).toBeInTheDocument();
    expect(within(bar).getByRole('tab', { name: 'Brief' })).toBeInTheDocument();
    expect(within(bar).getByText('Send brief')).toBeInTheDocument();
    expect(screen.queryByText('Brief for Acme')).not.toBeInTheDocument();
  });

  it('embed mobile, brief not ready: no bottom bar', () => {
    state.embed = true;
    state.conversationStatus = 'in_progress';

    render(<BrandedBriefWorkspace slug='acme' initialBriefId='b1' />);

    expect(screen.queryByTestId('embed-bottom-bar')).not.toBeInTheDocument();
    expect(screen.getByTestId('anon-editor')).toBeInTheDocument();
  });

  it('non-embed mobile, brief in progress: top branding present, no bottom bar', () => {
    state.embed = false;
    state.conversationStatus = 'in_progress';

    render(<BrandedBriefWorkspace slug='acme' initialBriefId='b1' />);

    expect(screen.queryByTestId('embed-bottom-bar')).not.toBeInTheDocument();
    expect(screen.getByText('Brief for Acme')).toBeInTheDocument();
  });

  it('non-embed mobile, brief ready: top tabs present, no bottom bar', () => {
    state.embed = false;
    state.conversationStatus = 'ready_to_finalize';

    render(<BrandedBriefWorkspace slug='acme' initialBriefId='b1' />);

    expect(screen.queryByTestId('embed-bottom-bar')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Chat' })).toBeInTheDocument();
    expect(screen.getByText('Send brief')).toBeInTheDocument();
  });

  it('embed mobile, already sent: bottom bar shows label instead of Send button', () => {
    state.embed = true;
    state.conversationStatus = 'finalized';
    state.briefSent = true;

    render(<BrandedBriefWorkspace slug='acme' initialBriefId='b1' />);

    const bar = screen.getByTestId('embed-bottom-bar');
    expect(within(bar).getByText('Brief already sent to this vendor.')).toBeInTheDocument();
    expect(screen.queryByText('Send brief')).not.toBeInTheDocument();
  });

  it('embed desktop, brief ready: bottom bar with Send brief and no tabs', () => {
    state.embed = true;
    state.isMobile = false;
    state.conversationStatus = 'ready_to_finalize';

    render(<BrandedBriefWorkspace slug='acme' initialBriefId='b1' />);

    const bar = screen.getByTestId('embed-bottom-bar');
    expect(within(bar).getByText('Send brief')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Brief' })).not.toBeInTheDocument();
  });
});
