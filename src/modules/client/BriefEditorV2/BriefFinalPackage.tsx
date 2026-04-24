'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { styled } from 'styled-components';
import { App, Button, Popover, Switch } from 'antd';
import { CopyOutlined, DownloadOutlined, ShareAltOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { ApiRoute } from '@/constants/apiRoute';
import { AppRoute } from '@/constants/appRoute';
import { downloadPdf } from '@/helpers/downloadPdf';
import { t } from '@/lib/i18n';
import {
  useCreateBriefAiShareMutation,
  useGetBriefAiShareQuery,
  useUpdateBriefAiFinalDocumentMutation,
  useUpdateBriefAiShareMutation,
} from '@/services/client/briefAiApi';
import { BriefFinalDocument, BriefFinalPackage as BriefFinalPackageType } from '@/types/briefAi.interface';

const AUTOSAVE_DEBOUNCE_MS = 1200;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface DocumentEditorHandle {
  copy: (mode: 'html' | 'text') => Promise<void>;
  download: () => Promise<void>;
}

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: #f8f9fb;
`;

const TabsHeader = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 24px;
  background: #f8f9fb;
  border-bottom: 1px solid #eef0f4;
`;

const TabsList = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

const TabButton = styled.button<{ $active: boolean }>`
  border: none;
  background: transparent;
  padding: 10px 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: ${(x) => (x.$active ? '#2288ff' : '#4b5675')};
  border-bottom: 2px solid ${(x) => (x.$active ? '#2288ff' : 'transparent')};
  cursor: pointer;

  &:hover {
    color: #2288ff;
  }
`;

const HeaderActions = styled.div`
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const DocumentPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const StickyBar = styled.div`
  flex-shrink: 0;
  padding: 8px 24px;
  background: #f8f9fb;
  border-bottom: 1px solid #eef0f4;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 24px 32px;
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
  flex-wrap: wrap;
  flex: 1;
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

const SaveStatus = styled.span<{ $state: SaveState }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
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
  onRegenerate?: (() => void) | null;
  isRegenerating?: boolean;
}

const htmlToPlainText = (html: string): string => {
  if (typeof document === 'undefined') {
    return html;
  }
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerText;
};

interface DocumentEditorProps {
  briefId: string;
  document: BriefFinalDocument;
  onSaveStateChange: (state: SaveState) => void;
}

const DocumentEditor = forwardRef<DocumentEditorHandle, DocumentEditorProps>((props, ref) => {
  const { briefId, document: doc, onSaveStateChange } = props;
  const { message: messageApi } = App.useApp();
  const [updateDoc] = useUpdateBriefAiFinalDocumentMutation();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestHtmlRef = useRef<string>(doc.html);
  const onSaveStateChangeRef = useRef(onSaveStateChange);
  onSaveStateChangeRef.current = onSaveStateChange;

  const setSaveState = (state: SaveState) => {
    onSaveStateChangeRef.current(state);
  };

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

  useEffect(() => {
    if (!editor) {
      return;
    }
    if (editor.getHTML() === doc.html) {
      return;
    }
    editor.commands.setContent(doc.html, { emitUpdate: false });
    latestHtmlRef.current = doc.html;
  }, [doc.html, doc.id, editor]);

  useImperativeHandle(
    ref,
    () => ({
      copy: async (mode: 'html' | 'text') => {
        try {
          const html = latestHtmlRef.current;
          const value = mode === 'html' ? html : htmlToPlainText(html);
          await navigator.clipboard.writeText(value);
          messageApi.success(t('BRIEF_V3_COPIED'));
        } catch {
          messageApi.error(t('UNEXPECTED_ERROR'));
        }
      },
      download: async () => {
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
      },
    }),
    [briefId, doc.id, doc.kind, messageApi, updateDoc]
  );

  if (!editor) {
    return null;
  }

  return (
    <DocumentPane>
      <StickyBar>
        <EditorToolbar editor={editor} />
      </StickyBar>
      <ScrollArea>
        <EditorCard>
          <EditorContent editor={editor} />
        </EditorCard>
      </ScrollArea>
    </DocumentPane>
  );
});

DocumentEditor.displayName = 'DocumentEditor';

const EditorToolbar: React.FC<{ editor: Editor }> = ({ editor }) => (
  <Toolbar>
    <ToolButton $active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
      Bold
    </ToolButton>
    <ToolButton $active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
      Italic
    </ToolButton>
    <ToolButton $active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
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
    <ToolButton $active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
      • List
    </ToolButton>
    <ToolButton
      $active={editor.isActive('orderedList')}
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
    >
      1. List
    </ToolButton>
    <ToolButton $active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
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
);

const ShareControl: React.FC<{ briefId: string }> = ({ briefId }) => {
  const { message: messageApi } = App.useApp();
  const { data: share, isFetching } = useGetBriefAiShareQuery(briefId, {
    refetchOnMountOrArgChange: true,
  });
  const [createShare, { isLoading: isCreating }] = useCreateBriefAiShareMutation();
  const [updateShare, { isLoading: isUpdating }] = useUpdateBriefAiShareMutation();

  const handleCreate = async () => {
    try {
      await createShare(briefId).unwrap();
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleToggle = async (isActive: boolean) => {
    try {
      await updateShare({ briefId, isActive }).unwrap();
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  const handleCopy = async () => {
    if (!share) return;
    const url = `${window.location.origin}${AppRoute.SHARED_BRIEF(share.token)}`;
    try {
      await navigator.clipboard.writeText(url);
      messageApi.success(t('BRIEF_V3_SHARE_COPIED'));
    } catch {
      messageApi.error(t('UNEXPECTED_ERROR'));
    }
  };

  const shareUrl = share
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}${AppRoute.SHARED_BRIEF(share.token)}`
    : '';

  const content = (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{t('BRIEF_V3_SHARE_HINT')}</div>

      {!share ? (
        <Button type='primary' loading={isCreating} onClick={handleCreate} block>
          {t('BRIEF_V3_SHARE')}
        </Button>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              border: '1px solid #eef0f4',
              borderRadius: 8,
              padding: '6px 8px',
              background: '#fafbfc',
              fontSize: 12,
              color: '#4b5675',
              overflow: 'hidden',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {shareUrl}
            </span>
            <Button size='small' icon={<CopyOutlined />} onClick={handleCopy}>
              {t('BRIEF_V3_SHARE_COPY')}
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <Switch size='small' checked={share.isActive} loading={isUpdating} onChange={handleToggle} />
            <span>{t('BRIEF_V3_SHARE_ACTIVE')}</span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Popover content={content} title={t('BRIEF_V3_SHARE_TITLE')} trigger='click' placement='bottomRight'>
      <Button icon={<ShareAltOutlined />} loading={isFetching}>
        {t('BRIEF_V3_SHARE')}
      </Button>
    </Popover>
  );
};

export const BriefFinalPackage: React.FC<BriefFinalPackageProps> = (props) => {
  const { briefId, package: pkg, onRegenerate, isRegenerating } = props;
  const { modal } = App.useApp();
  const byKind = new Map(pkg.documents.map((x) => [x.kind, x]));

  const tabs: { key: 'production_brief' | 'vendor_email'; label: string; document?: BriefFinalDocument }[] = [
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
  ];

  const [activeKey, setActiveKey] = useState<'production_brief' | 'vendor_email'>('production_brief');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const editorRef = useRef<DocumentEditorHandle | null>(null);

  const activeTab = tabs.find((x) => x.key === activeKey) ?? tabs[0];
  const activeDoc = activeTab.document;

  const handleRegenerateClick = () => {
    if (!onRegenerate) {
      return;
    }
    modal.confirm({
      title: t('BRIEF_V3_REGENERATE_CONFIRM_TITLE'),
      content: t('BRIEF_V3_REGENERATE_CONFIRM_BODY'),
      okText: t('BRIEF_V3_REGENERATE_CONFIRM_OK'),
      cancelText: t('BRIEF_V3_FINALIZE_CONFIRM_CANCEL'),
      okButtonProps: { type: 'primary' },
      onOk: onRegenerate,
    });
  };

  const handleSelectTab = (key: 'production_brief' | 'vendor_email') => {
    if (key === activeKey) {
      return;
    }
    setActiveKey(key);
    setSaveState('idle');
  };

  const saveLabel =
    saveState === 'saving'
      ? t('BRIEF_V3_SAVING')
      : saveState === 'saved'
        ? t('BRIEF_V3_SAVED')
        : saveState === 'error'
          ? t('BRIEF_V3_SAVE_FAILED')
          : '';

  return (
    <Wrapper>
      <TabsHeader>
        <TabsList>
          {tabs.map((tab) => (
            <TabButton key={tab.key} $active={tab.key === activeKey} onClick={() => handleSelectTab(tab.key)}>
              {tab.label}
            </TabButton>
          ))}
        </TabsList>
        <HeaderActions>
          <SaveStatus $state={saveState}>{saveLabel}</SaveStatus>
          {onRegenerate ? (
            <Button icon={<ReloadOutlined />} onClick={handleRegenerateClick} loading={Boolean(isRegenerating)}>
              {t('BRIEF_V3_REGENERATE_PACKAGE')}
            </Button>
          ) : null}
          <ShareControl briefId={briefId} />
          <Button icon={<CopyOutlined />} onClick={() => editorRef.current?.copy('text')} disabled={!activeDoc}>
            {t('BRIEF_V3_COPY_TEXT')}
          </Button>
          <Button icon={<CopyOutlined />} onClick={() => editorRef.current?.copy('html')} disabled={!activeDoc}>
            {t('BRIEF_V3_COPY_HTML')}
          </Button>
          <Button
            type='primary'
            icon={<DownloadOutlined />}
            onClick={() => editorRef.current?.download()}
            disabled={!activeDoc}
          >
            {t('BRIEF_V3_DOWNLOAD_PDF')}
          </Button>
        </HeaderActions>
      </TabsHeader>

      {activeDoc ? (
        <DocumentEditor
          key={activeDoc.id}
          ref={editorRef}
          briefId={briefId}
          document={activeDoc}
          onSaveStateChange={setSaveState}
        />
      ) : (
        <div style={{ color: '#99a1b7', padding: 24 }}>{t('BRIEF_V3_DOCUMENT_MISSING')}</div>
      )}
    </Wrapper>
  );
};
