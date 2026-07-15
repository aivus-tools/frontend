import { describe, it, expect, vi, beforeAll } from 'vitest';
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
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  getMailboxes: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('@/services/client/emailAgentApi', () => ({
  useGetAgentProfileQuery: mocks.getProfile,
  useUpdateAgentProfileMutation: () => [mocks.updateProfile, { isLoading: false }],
  useGetMailboxesQuery: mocks.getMailboxes,
  useConnectMailboxMutation: () => [mocks.connect, { isLoading: false }],
  useDisconnectMailboxMutation: () => [mocks.disconnect, { isLoading: false }],
}));

import { AgentSettingsForm } from './AgentSettingsForm';

const profile = {
  instruction: '',
  businessContext: '',
  tone: '',
  specialRules: [],
  producerEmail: '',
  workingHours: {},
  notificationRules: { mode: 'every' },
  autonomyMode: 'draft',
};

describe('AgentSettingsForm', () => {
  it('renders the instruction placeholder so vendors know what to write', () => {
    mocks.getProfile.mockReturnValue({ data: profile, isLoading: false });
    mocks.getMailboxes.mockReturnValue({ data: { mailboxes: [] }, isLoading: false });

    render(
      <App>
        <AgentSettingsForm />
      </App>
    );

    expect(screen.getByPlaceholderText(/Describe your business so the agent can speak for you/)).toBeTruthy();
    expect(screen.getByText('Save settings')).toBeTruthy();
    expect(screen.getByText('Connected mailboxes')).toBeTruthy();
  });
});
