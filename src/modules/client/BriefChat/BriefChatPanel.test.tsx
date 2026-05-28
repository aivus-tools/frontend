import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

vi.mock('./LLMTraceDrawer', () => ({
  LLMTraceDrawer: () => null,
}));

vi.mock('./VoiceRecorderButton', () => ({
  VoiceRecorderButton: () => null,
}));

vi.mock('@/modules/client/BriefEditor/components/FileUploadZone', () => ({
  FileUploadZone: () => null,
}));

import { BriefChatPanel } from './BriefChatPanel';

const defaultProps = {
  isPublic: true,
  publicToken: 'tok',
  messages: [],
  conversationStatus: 'ready_to_finalize' as const,
  isLoading: false,
  messageLimit: 50,
  messageCount: 5,
  pendingAttachments: [],
  uploading: false,
  maxAttachments: 3,
  onUploadAttachment: vi.fn(),
  onDeleteAttachment: vi.fn(),
  onSendMessage: vi.fn(),
  onFeedback: null,
  onFeedbackComment: null,
};

describe('BriefChatPanel registration buttons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders two buttons when registrationEmail provided and showRegistrationButton is true', () => {
    const onRegisterClick = vi.fn();
    render(
      <BriefChatPanel
        {...defaultProps}
        showRegistrationButton={true}
        registrationEmail='user@example.com'
        onRegisterClick={onRegisterClick}
      />
    );

    expect(screen.getByText('Register with user@example.com')).toBeInTheDocument();
    expect(screen.getByText('Register with another email')).toBeInTheDocument();
  });

  it('clicking primary button calls onRegisterClick with email', async () => {
    const onRegisterClick = vi.fn();
    render(
      <BriefChatPanel
        {...defaultProps}
        showRegistrationButton={true}
        registrationEmail='user@example.com'
        onRegisterClick={onRegisterClick}
      />
    );

    await userEvent.click(screen.getByText('Register with user@example.com'));
    expect(onRegisterClick).toHaveBeenCalledWith('user@example.com');
  });

  it('clicking secondary button calls onRegisterClick with null', async () => {
    const onRegisterClick = vi.fn();
    render(
      <BriefChatPanel
        {...defaultProps}
        showRegistrationButton={true}
        registrationEmail='user@example.com'
        onRegisterClick={onRegisterClick}
      />
    );

    await userEvent.click(screen.getByText('Register with another email'));
    expect(onRegisterClick).toHaveBeenCalledWith(null);
  });

  it('renders one button when registrationEmail is null and showRegistrationButton is true', () => {
    const onRegisterClick = vi.fn();
    render(
      <BriefChatPanel
        {...defaultProps}
        showRegistrationButton={true}
        registrationEmail={null}
        onRegisterClick={onRegisterClick}
      />
    );

    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.queryByText('Register with another email')).not.toBeInTheDocument();
  });

  it('clicking single button calls onRegisterClick with null when no email', async () => {
    const onRegisterClick = vi.fn();
    render(
      <BriefChatPanel
        {...defaultProps}
        showRegistrationButton={true}
        registrationEmail={null}
        onRegisterClick={onRegisterClick}
      />
    );

    await userEvent.click(screen.getByText('Sign up'));
    expect(onRegisterClick).toHaveBeenCalledWith(null);
  });

  it('does not render registration block when showRegistrationButton is false', () => {
    render(
      <BriefChatPanel
        {...defaultProps}
        showRegistrationButton={false}
        registrationEmail='user@example.com'
        onRegisterClick={vi.fn()}
      />
    );

    expect(screen.queryByText('Register with user@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  });
});
