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

  it('renders download CTA plus secondary button when registrationEmail provided', () => {
    const onRegisterClick = vi.fn();
    render(
      <BriefChatPanel
        {...defaultProps}
        showRegistrationButton={true}
        registrationEmail='user@example.com'
        onRegisterClick={onRegisterClick}
      />
    );

    expect(screen.getByText('Sign up for free to download')).toBeInTheDocument();
    expect(screen.getByText('Register with another email')).toBeInTheDocument();
    expect(screen.queryByText('Register with user@example.com')).not.toBeInTheDocument();
  });

  it('clicking primary CTA calls onRegisterClick with the email when present', async () => {
    const onRegisterClick = vi.fn();
    render(
      <BriefChatPanel
        {...defaultProps}
        showRegistrationButton={true}
        registrationEmail='user@example.com'
        onRegisterClick={onRegisterClick}
      />
    );

    await userEvent.click(screen.getByText('Sign up for free to download'));
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

  it('renders only the download CTA when registrationEmail is null', () => {
    const onRegisterClick = vi.fn();
    render(
      <BriefChatPanel
        {...defaultProps}
        showRegistrationButton={true}
        registrationEmail={null}
        onRegisterClick={onRegisterClick}
      />
    );

    expect(screen.getByText('Sign up for free to download')).toBeInTheDocument();
    expect(screen.queryByText('Register with another email')).not.toBeInTheDocument();
  });

  it('clicking the CTA calls onRegisterClick with null when no email', async () => {
    const onRegisterClick = vi.fn();
    render(
      <BriefChatPanel
        {...defaultProps}
        showRegistrationButton={true}
        registrationEmail={null}
        onRegisterClick={onRegisterClick}
      />
    );

    await userEvent.click(screen.getByText('Sign up for free to download'));
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

    expect(screen.queryByText('Sign up for free to download')).not.toBeInTheDocument();
    expect(screen.queryByText('Register with another email')).not.toBeInTheDocument();
  });
});

describe('BriefChatPanel embed composer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides the composer in embed when the brief is ready to finalize', () => {
    render(<BriefChatPanel {...defaultProps} embedded conversationStatus='ready_to_finalize' />);

    expect(screen.queryByPlaceholderText('Write a message...')).not.toBeInTheDocument();
    expect(screen.queryByText('Attach files')).not.toBeInTheDocument();
  });

  it('hides the composer in embed when the brief is finalized', () => {
    render(<BriefChatPanel {...defaultProps} embedded conversationStatus='finalized' />);

    expect(screen.queryByPlaceholderText('Write a message...')).not.toBeInTheDocument();
  });

  it('keeps the composer in embed while the conversation is still in progress', () => {
    render(<BriefChatPanel {...defaultProps} embedded conversationStatus='in_progress' />);

    expect(screen.getByPlaceholderText('Write a message...')).toBeInTheDocument();
  });

  it('keeps the composer when not embedded even if the brief is ready', () => {
    render(<BriefChatPanel {...defaultProps} conversationStatus='ready_to_finalize' />);

    expect(screen.getByPlaceholderText('Write a message...')).toBeInTheDocument();
  });
});

describe('BriefChatPanel message-limit badge', () => {
  it('hides the count badge early so it does not read like a quota to fill', () => {
    render(<BriefChatPanel {...defaultProps} conversationStatus='in_progress' messageCount={5} messageLimit={50} />);

    expect(screen.queryByText(/messages left/)).not.toBeInTheDocument();
    expect(screen.queryByText('5/50 messages')).not.toBeInTheDocument();
  });

  it('shows remaining count only near the limit', () => {
    render(<BriefChatPanel {...defaultProps} conversationStatus='in_progress' messageCount={45} messageLimit={50} />);

    expect(screen.getByText('5 messages left')).toBeInTheDocument();
  });

  it('shows a clear reached message at the limit', () => {
    render(<BriefChatPanel {...defaultProps} conversationStatus='in_progress' messageCount={50} messageLimit={50} />);

    expect(screen.getByText('Message limit reached')).toBeInTheDocument();
  });

  it('shows the badge at exactly the threshold (10 messages left)', () => {
    render(<BriefChatPanel {...defaultProps} conversationStatus='in_progress' messageCount={40} messageLimit={50} />);

    expect(screen.getByText('10 messages left')).toBeInTheDocument();
  });

  it('hides the badge one step above the threshold (11 messages left)', () => {
    render(<BriefChatPanel {...defaultProps} conversationStatus='in_progress' messageCount={39} messageLimit={50} />);

    expect(screen.queryByText(/messages left/)).not.toBeInTheDocument();
  });

  it('uses singular copy for a single remaining message', () => {
    render(<BriefChatPanel {...defaultProps} conversationStatus='in_progress' messageCount={49} messageLimit={50} />);

    expect(screen.getByText('1 message left')).toBeInTheDocument();
    expect(screen.queryByText('1 messages left')).not.toBeInTheDocument();
  });

  it('hides the badge when the message limit is infinite', () => {
    render(
      <BriefChatPanel {...defaultProps} conversationStatus='in_progress' messageCount={0} messageLimit={Infinity} />
    );

    expect(screen.queryByText(/messages left/)).not.toBeInTheDocument();
    expect(screen.queryByText('Message limit reached')).not.toBeInTheDocument();
  });

  it('shows reached copy (never a negative count) when count overshoots the limit', () => {
    render(<BriefChatPanel {...defaultProps} conversationStatus='in_progress' messageCount={55} messageLimit={50} />);

    expect(screen.getByText('Message limit reached')).toBeInTheDocument();
    expect(screen.queryByText(/messages left/)).not.toBeInTheDocument();
    expect(screen.queryByText(/-5/)).not.toBeInTheDocument();
  });

  it('does not render the badge in embed + ready even when near the limit', () => {
    render(
      <BriefChatPanel
        {...defaultProps}
        embedded
        conversationStatus='ready_to_finalize'
        messageCount={45}
        messageLimit={50}
      />
    );

    expect(screen.queryByText('5 messages left')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Write a message...')).not.toBeInTheDocument();
  });

  it('at exactly the limit shows only reached copy, not a zero-count remaining message', () => {
    render(<BriefChatPanel {...defaultProps} conversationStatus='in_progress' messageCount={50} messageLimit={50} />);

    expect(screen.getByText('Message limit reached')).toBeInTheDocument();
    expect(screen.queryByText('0 messages left')).not.toBeInTheDocument();
  });
});
