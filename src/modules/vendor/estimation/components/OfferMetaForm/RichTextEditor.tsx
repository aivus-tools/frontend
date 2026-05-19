'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';

import styles from './OfferMetaForm.module.css';

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
  {
    ssr: false,
    loading: () => <div style={{ height: 200, border: '1px solid var(--bg-gray-light)', borderRadius: 6 }} />,
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RichTextEditor = (props: RichTextEditorProps) => {
  const editorRef = useRef<unknown>(null);

  return (
    <div className={styles.editorWrapper}>
      <Editor
        onInit={(_event: unknown, editor: unknown) => {
          editorRef.current = editor;
        }}
        value={props.value}
        onEditorChange={props.onChange}
        licenseKey='gpl'
        init={{
          min_height: 200,
          resize: true,
          menubar: false,
          plugins: ['lists', 'link'],
          toolbar: 'blocks | bold italic underline | bullist numlist | link',
          block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4',
          placeholder: 'e.g. Budget assumes 1 interior location and 1 shoot day.',
          content_style: `
            body {
              font-family: 'Montserrat', sans-serif;
              font-size: 14px;
              color: #4b5675;
            }
            h1 { font-size: 22px; margin: 0 0 12px; }
            h2 { font-size: 18px; margin: 0 0 10px; }
            h3 { font-size: 16px; margin: 0 0 8px; }
            h4 { font-size: 14px; margin: 0 0 6px; }
          `,
          branding: false,
          statusbar: true,
          promotion: false,
          skin: false,
          content_css: false,
        }}
      />
    </div>
  );
};
