'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { EditorWrapper } from './styled';

const Editor = dynamic(
  async () => {
    await import('tinymce/tinymce');
    await import('tinymce/models/dom');
    await import('tinymce/themes/silver');
    await import('tinymce/icons/default');
    await import('tinymce/skins/ui/oxide/skin.min.css');
    await import('tinymce/plugins/lists');
    await import('tinymce/plugins/link');
    const tinymceReact = await import('@tinymce/tinymce-react');
    return tinymceReact.Editor;
  },
  { ssr: false, loading: () => <div style={{ height: 150, border: '1px solid #d9d9d9', borderRadius: 6 }} /> }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = props => {
  const editorRef = useRef<unknown>(null);

  return (
    <EditorWrapper>
      <Editor
        onInit={(_event: unknown, editor: unknown) => {
          editorRef.current = editor;
        }}
        value={props.value}
        onEditorChange={props.onChange}
        licenseKey="gpl"
        init={{
          height: 150,
          menubar: false,
          plugins: ['lists', 'link'],
          toolbar: 'bold italic underline | bullist numlist | link',
          content_style: `
            body {
              font-family: 'Montserrat', sans-serif;
              font-size: 14px;
              color: #4b5675;
            }
          `,
          branding: false,
          statusbar: false,
          promotion: false,
          skin: false,
          content_css: false,
        }}
      />
    </EditorWrapper>
  );
};
