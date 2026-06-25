import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/modules/client/BriefChat/VoiceRecorderButton', () => ({
  VoiceRecorderButton: () => <div data-testid='voice-btn' />,
}));

vi.mock('./FileUploadZone', () => ({
  FileUploadZone: () => <div data-testid='file-upload' />,
}));

import { BriefStartScreen } from './BriefStartScreen';

const baseProps = {
  startText: '',
  onStartTextChange: vi.fn(),
  pendingAttachments: [],
  uploading: false,
  maxAttachments: 5,
  onUploadAttachment: vi.fn(),
  onDeleteAttachment: vi.fn(),
  briefId: null,
  isPublic: true,
  token: null,
  isStarting: false,
  isStartVoiceBusy: false,
  onStartVoiceBusyChange: vi.fn(),
  onEnsureBrief: vi.fn(),
  onStart: vi.fn(),
};

describe('BriefStartScreen', () => {
  it('shows the voice recorder by default', () => {
    render(<BriefStartScreen {...baseProps} />);
    expect(screen.getByTestId('voice-btn')).toBeTruthy();
    expect(screen.getByText('Or describe with your voice')).toBeTruthy();
  });

  it('hides the voice recorder when embedded', () => {
    render(<BriefStartScreen {...baseProps} embedded />);
    expect(screen.queryByTestId('voice-btn')).toBeNull();
    expect(screen.queryByText('Or describe with your voice')).toBeNull();
  });
});
