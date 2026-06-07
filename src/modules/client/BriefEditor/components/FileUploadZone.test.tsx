import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const messageErrorMock = vi.hoisted(() => vi.fn());

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ message: { error: messageErrorMock, success: vi.fn() } }),
    },
  };
});

import { FileUploadZone } from './FileUploadZone';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const renderZone = () => {
  const onUpload = vi.fn();
  const result = render(
    <FileUploadZone attachments={[]} uploading={false} maxFiles={3} onUpload={onUpload} onDelete={vi.fn()} />
  );
  const input = result.container.querySelector('input[type="file"]') as HTMLInputElement;
  return { input, onUpload };
};

describe('FileUploadZone docx support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts a docx file with the official mime type', async () => {
    const { input, onUpload } = renderZone();
    const file = new File([new Uint8Array([1, 2, 3])], 'brief.docx', { type: DOCX_MIME });
    await userEvent.upload(input, file, { applyAccept: false });
    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(messageErrorMock).not.toHaveBeenCalled();
  });

  it('accepts a docx file by extension when the browser reports no mime type', async () => {
    const { input, onUpload } = renderZone();
    const file = new File([new Uint8Array([1, 2, 3])], 'brief.docx', { type: '' });
    await userEvent.upload(input, file, { applyAccept: false });
    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(messageErrorMock).not.toHaveBeenCalled();
  });

  it('rejects an unsupported file type', async () => {
    const { input, onUpload } = renderZone();
    const file = new File([new Uint8Array([1, 2, 3])], 'malware.exe', { type: 'application/x-msdownload' });
    await userEvent.upload(input, file, { applyAccept: false });
    expect(onUpload).not.toHaveBeenCalled();
    expect(messageErrorMock).toHaveBeenCalled();
  });
});
