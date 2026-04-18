'use client';

import React, { useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';
import { App, Button, Tabs } from 'antd';
import { ArrowLeftOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { ApiRoute } from '@/constants/apiRoute';
import { downloadPdf } from '@/helpers/downloadPdf';
import { t } from '@/lib/i18n';
import { useUpdateBriefAiFinalDocumentMutation } from '@/services/client/briefAiApi';
import { BriefFinalDocument, BriefFinalPackage as BriefFinalPackageType } from '@/types/briefAi.interface';

const AUTOSAVE_DEBOUNCE_MS = 1200;

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8f9fb;
`;

const Header = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #eef0f4;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
`;

const Body = styled.div`
  flex: 1;
  padding: 16px 24px 32px;
  overflow-y: auto;
`;

const EditorCard = styled.div`
  background: #ffffff;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  padding: 24px 28px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: #1f2937;
  line-height: 1.7;

  .ProseMirror {
    outline: none;
    min-height: 300px;
  }
  .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
  }

  h1 {
    font-size: 22px;
    margin: 0 0 12px 0;
    color: #111827;
    font-weight: 700;
  }
  h2 {
    font-size: 16px;
    margin: 20px 0 8px 0;
    color: #1f2937;
    border-bottom: 1px solid #eef0f4;
    padding-bottom: 4px;
    font-weight: 700;
  }
  h3 {
    font-size: 14px;
    margin: 12px 0 4px 0;
    font-weight: 600;
  }
  ul,
  ol {
    padding-left: 22px;
    margin: 0 0 8px 0;
  }
  li {
    margin: 2px 0;
  }
  p {
    margin: 0 0 8px 0;
  }
  strong {
    font-weight: 700;
  }
  em {
    font-style: italic;
  }
  a {
    color: #2288ff;
    text-decoration: underline;
  }
  blockquote {
    border-left: 3px solid #d0d5dd;
    padding-left: 10px;
    color: #6b7280;
    margin: 8px 0;
  }
  hr {
    border: none;
    border-top: 1px solid #eef0f4;
    margin: 16px 0;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  margin-bottom: 8px;
  background: #fafbfc;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  flex-wrap: wrap;
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${(x) => (x.$active ? '#2288ff' : 'transparent')};
  background: ${(x) => (x.$active ? '#e8f0fe' : 'transparent')};
  color: ${(x) => (x.$active ? '#2288ff' : '#4b5675')};
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    background: #eef0f4;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 12px;
`;

const SaveStatus = styled.span<{ $state: 'idle' | 'saving' | 'saved' | 'error' }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  margin-right: auto;
  color: ${(x) => {
    if (x.$state === 'saving') return '#99a1b7';
    if (x.$state === 'saved') return '#16a34a';
    if (x.$state === 'error') return '#dc2626';
    return '#99a1b7';
  }};
`;

const DOCUMENT_TITLES: Record<string, string> = {
  production_brief: 'Production Brief',
  vendor_email: 'Vendor Outreach Email',
  deliverables_checklist: 'Deliverables Checklist',
};

interface BriefFinalPackageProps {
  briefId: string;
  package: BriefFinalPackageType;
  onBack: () => void;
}

const htmlToPlainText = (html: string): string => {
  if (typeof document === 'undefined') {
    return html;
  }
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerText;
};

const DocumentEditor: React.FC<{
  briefId: string;
  document: BriefFinalDocument;
}> = ({ briefId, document: doc }) => {
  const { message: messageApi } = App.useApp();
  const [updateDoc] = useUpdateBriefAiFinalDocumentMutation();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestHtmlRef = useRef<string>(doc.html);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({
        placeholder: t('BRIEF_V3_EDITOR_PLACEHOLDER'),
      }),
    ],
    content: doc.html,
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      latestHtmlRef.current = html;
      setSaveState('saving');
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(async () => {
        try {
          await updateDoc({
            briefId,
            documentId: doc.id,
            html,
            plainText: htmlToPlainText(html),
          }).unwrap();
          setSaveState('saved');
        } catch {
          setSaveState('error');
        }
      }, AUTOSAVE_DEBOUNCE_MS);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async (mode: 'html' | 'text') => {
    try {
      const html = latestHtmlRef.current;
      const value = mode === 'html' ? html : htmlToPlainText(html);
      await navigator.clipboard.writeText(value);
      messageApi.success(t('BRIEF_V3_COPIED'));
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleDownload = async () => {
    try {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        await updateDoc({
          briefId,
          documentId: doc.id,
          html: latestHtmlRef.current,
          plainText: htmlToPlainText(latestHtmlRef.current),
        }).unwrap();
      }
      const url = ApiRoute.BRIEF_AI_FINAL_DOCUMENT_PDF(briefId, doc.id);
      await downloadPdf(url, `${DOCUMENT_TITLES[doc.kind] ?? 'Brief'}.pdf`);
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  if (!editor) {
    return null;
  }

  const saveLabel =
    saveState === 'saving'
      ? t('BRIEF_V3_SAVING')
      : saveState === 'saved'
        ? t('BRIEF_V3_SAVED')
        : saveState === 'error'
          ? t('BRIEF_V3_SAVE_FAILED')
          : '';

  return (
    <div>
      <ActionBar>
        <SaveStatus $state={saveState}>{saveLabel}</SaveStatus>
        <Button icon={<CopyOutlined />} onClick={() => handleCopy('text')}>
          {t('BRIEF_V3_COPY_TEXT')}
        </Button>
        <Button icon={<CopyOutlined />} onClick={() => handleCopy('html')}>
          {t('BRIEF_V3_COPY_HTML')}
        </Button>
        <Button type='primary' icon={<DownloadOutlined />} onClick={handleDownload}>
          {t('BRIEF_V3_DOWNLOAD_PDF')}
        </Button>
      </ActionBar>
      <Toolbar>
        <ToolButton $active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </ToolButton>
        <ToolButton $active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </ToolButton>
        <ToolButton
          $active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </ToolButton>
        <ToolButton
          $active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </ToolButton>
        <ToolButton
          $active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolButton>
        <ToolButton
          $active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolButton>
        <ToolButton
          $active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolButton>
        <ToolButton
          $active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolButton>
        <ToolButton
          $active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolButton>
        <ToolButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          Undo
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          Redo
        </ToolButton>
      </Toolbar>
      <EditorCard>
        <EditorContent editor={editor} />
      </EditorCard>
    </div>
  );
};

export const BriefFinalPackage: React.FC<BriefFinalPackageProps> = ({ briefId, package: pkg, onBack }) => {
  const byKind = new Map(pkg.documents.map((x) => [x.kind, x]));

  const items = [
    {
      key: 'production_brief',
      label: t('BRIEF_V3_TAB_PRODUCTION_BRIEF'),
      document: byKind.get('production_brief'),
    },
    {
      key: 'vendor_email',
      label: t('BRIEF_V3_TAB_VENDOR_EMAIL'),
      document: byKind.get('vendor_email'),
    },
    {
      key: 'deliverables_checklist',
      label: t('BRIEF_V3_TAB_DELIVERABLES'),
      document: byKind.get('deliverables_checklist'),
    },
  ];

  return (
    <Wrapper>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack} type='text'>
            {t('BRIEF_V3_BACK_TO_CHAT')}
          </Button>
          <Title>{t('BRIEF_V3_FINAL_PACKAGE_TITLE')}</Title>
        </div>
      </Header>
      <Body>
        <Tabs
          defaultActiveKey='production_brief'
          items={items.map((item) => ({
            key: item.key,
            label: item.label,
            children: item.document ? (
              <DocumentEditor key={item.document.id} briefId={briefId} document={item.document} />
            ) : (
              <div style={{ color: '#99a1b7', padding: 24 }}>{t('BRIEF_V3_DOCUMENT_MISSING')}</div>
            ),
          }))}
        />
      </Body>
    </Wrapper>
  );
};
