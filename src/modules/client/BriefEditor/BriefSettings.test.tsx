import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BriefV3Detail } from '@/types/briefAi.interface';

const mocks = vi.hoisted(() => ({
  updateSettingsFn: vi.fn(),
  deleteBriefFn: vi.fn(),
  pushFn: vi.fn(),
}));

vi.mock('@/services/client/briefAiApi', () => ({
  useUpdateBriefAiSettingsMutation: () => [mocks.updateSettingsFn, { isLoading: false }],
  useDeleteBriefAiMutation: () => [mocks.deleteBriefFn, { isLoading: false }],
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.pushFn }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null }),
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({
        modal: { confirm: vi.fn() },
        message: { error: vi.fn(), success: vi.fn() },
      }),
    },
  };
});

vi.mock('@/lib/i18n', () => ({
  t: (key: string) => key,
  getLocale: () => 'en',
}));

import { BriefSettings } from './BriefSettings';

const makeBrief = (overrides: Partial<BriefV3Detail> = {}): BriefV3Detail =>
  ({
    id: 'b1',
    title: 'Test Brief',
    documentLanguage: 'ru',
    conversationStatus: 'in_progress',
    messageCount: 2,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCostUsd: '0',
    ...overrides,
  }) as unknown as BriefV3Detail;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.updateSettingsFn.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});

describe('BriefSettings language', () => {
  it('does not render a document-language dropdown anymore', () => {
    render(<BriefSettings brief={makeBrief()} />);
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('shows the detected document language and the translate hint', () => {
    render(<BriefSettings brief={makeBrief({ documentLanguage: 'ru' })} />);
    // Intl.DisplayNames(['en']).of('ru') === 'Russian'
    expect(screen.getByText('Russian')).toBeInTheDocument();
    expect(screen.getByText('BRIEF_V3_SETTINGS_LANGUAGE_INFO')).toBeInTheDocument();
  });

  it('shows an auto-detect placeholder when language is not frozen yet', () => {
    render(<BriefSettings brief={makeBrief({ documentLanguage: '' })} />);
    expect(screen.getByText('BRIEF_V3_SETTINGS_LANGUAGE_AUTO')).toBeInTheDocument();
  });

  it('saves the title without sending any document language', async () => {
    render(<BriefSettings brief={makeBrief({ title: 'Old' })} />);
    fireEvent.change(screen.getByDisplayValue('Old'), { target: { value: 'New title' } });
    fireEvent.click(screen.getByText('BRIEF_V3_SETTINGS_SAVE'));
    await waitFor(() => {
      expect(mocks.updateSettingsFn).toHaveBeenCalledWith({ briefId: 'b1', title: 'New title' });
    });
    const callArg = mocks.updateSettingsFn.mock.calls[0][0];
    expect(callArg).not.toHaveProperty('documentLanguage');
  });
});
