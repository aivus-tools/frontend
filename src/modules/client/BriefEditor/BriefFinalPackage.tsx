'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { App, Button, Popover, Switch } from 'antd';
import { CopyOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { ApiRoute } from '@/constants/apiRoute';
import { AppRoute } from '@/constants/appRoute';
import { downloadPdf } from '@/helpers/downloadPdf';
import { getLocale, t } from '@/lib/i18n';
import {
  useCreateBriefAiShareMutation,
  useGetBriefAiDetailQuery,
  useGetBriefAiShareQuery,
  useUpdateBriefAiFinalDocumentMutation,
  useUpdateBriefAiShareMutation,
} from '@/services/client/briefAiApi';
import { useGetPreVendorsQuery } from '@/services/client/preVendorsApi';
import { BriefFinalDocument, BriefFinalPackage as BriefFinalPackageType } from '@/types/briefAi.interface';
import { PreVendorLanguage } from '@/types/preVendor.interface';
import { PickVendorButton, PreVendorsBlock } from '@/modules/client/PreVendors';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import styles from './BriefFinalPackage.module.css';

const AUTOSAVE_DEBOUNCE_MS = 1200;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface DocumentEditorHandle {
  copy: (mode: 'html' | 'text') => Promise<void>;
  download: () => Promise<void>;
  flush: () => Promise<void>;
}

const DOCUMENT_TITLES: Record<string, string> = {
  production_brief: 'Production Brief',
  vendor_email: 'Vendor Outreach Email',
  deliverables_checklist: 'Deliverables Checklist',
};

export interface BriefFinalPackageHandle {
  flush: () => Promise<void>;
}

interface BriefFinalPackageProps {
  briefId: string;
  package: BriefFinalPackageType;
  onRegenerate?: (() => void) | null;
  isRegenerating?: boolean;
  mobileActionsSlot?: HTMLElement | null;
  whiteLabel?: boolean;
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

const is409Error = (error: unknown): boolean => {
  if (typeof error !== 'object' || error == null) {
    return false;
  }
  const status = (error as { status?: unknown }).status;
  return status === 409;
};

const DocumentEditor = forwardRef<DocumentEditorHandle, DocumentEditorProps>((props, ref) => {
  const { briefId, document: doc, onSaveStateChange } = props;
  const { message: messageApi } = App.useApp();
  const [updateDoc] = useUpdateBriefAiFinalDocumentMutation();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestHtmlRef = useRef<string>(doc.html);
  const saveBlockedRef = useRef<boolean>(false);
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
      if (saveBlockedRef.current) {
        return;
      }
      const html = current.getHTML();
      latestHtmlRef.current = html;
      setSaveState('saving');
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(async () => {
        if (saveBlockedRef.current) {
          return;
        }
        try {
          await updateDoc({
            briefId,
            documentId: doc.id,
            html,
            plainText: htmlToPlainText(html),
          }).unwrap();
          setSaveState('saved');
        } catch (error) {
          if (is409Error(error)) {
            saveBlockedRef.current = true;
            setSaveState('error');
            messageApi.warning(t('BRIEF_ALREADY_SENT_EDIT_BLOCKED'));
          } else {
            setSaveState('error');
          }
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
      flush: async () => {
        if (!saveTimerRef.current) {
          return;
        }
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        if (saveBlockedRef.current) {
          return;
        }
        try {
          await updateDoc({
            briefId,
            documentId: doc.id,
            html: latestHtmlRef.current,
            plainText: htmlToPlainText(latestHtmlRef.current),
          }).unwrap();
        } catch {
          /* flush before send — ignore save errors */
        }
      },
    }),
    [briefId, doc.id, doc.kind, messageApi, updateDoc]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className={styles.documentPane}>
      <div className={styles.stickyBar}>
        <EditorToolbar editor={editor} />
      </div>
      <div className={styles.scrollArea}>
        <div className={styles.editorCard}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
});

DocumentEditor.displayName = 'DocumentEditor';

interface EditorToolbarProps {
  editor: Editor;
}

const toolButtonClass = (active: boolean): string => {
  return active ? `${styles.toolButton} ${styles.toolButtonActive}` : styles.toolButton;
};

const EditorToolbar = (props: EditorToolbarProps) => {
  const { editor } = props;
  return (
    <div className={styles.toolbar}>
      <button
        type='button'
        className={toolButtonClass(editor.isActive('bold'))}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </button>
      <button
        type='button'
        className={toolButtonClass(editor.isActive('italic'))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Italic
      </button>
      <button
        type='button'
        className={toolButtonClass(editor.isActive('heading', { level: 1 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </button>
      <button
        type='button'
        className={toolButtonClass(editor.isActive('heading', { level: 2 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        type='button'
        className={toolButtonClass(editor.isActive('heading', { level: 3 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </button>
      <button
        type='button'
        className={toolButtonClass(editor.isActive('bulletList'))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        type='button'
        className={toolButtonClass(editor.isActive('orderedList'))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </button>
      <button
        type='button'
        className={toolButtonClass(editor.isActive('blockquote'))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        Quote
      </button>
      <button
        type='button'
        className={styles.toolButton}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        —
      </button>
      <button
        type='button'
        className={styles.toolButton}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        Undo
      </button>
      <button
        type='button'
        className={styles.toolButton}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        Redo
      </button>
    </div>
  );
};

interface ShareControlPanelProps {
  briefId: string;
  header?: React.ReactNode;
}

const ShareControlPanel = (props: ShareControlPanelProps) => {
  const { briefId, header } = props;
  const { message: messageApi } = App.useApp();
  const { data: share } = useGetBriefAiShareQuery(briefId);
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
    if (!share) {
      return;
    }
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

  return (
    <div className={styles.sharePanel}>
      {header}
      <div className={styles.shareHint}>{t('BRIEF_V3_SHARE_HINT')}</div>

      {!share ? (
        <Button type='primary' loading={isCreating} onClick={handleCreate} block>
          {t('BRIEF_V3_SHARE')}
        </Button>
      ) : (
        <>
          <div className={styles.shareUrlRow}>
            <span className={styles.shareUrlText}>{shareUrl}</span>
            <Button size='small' icon={<CopyOutlined />} onClick={handleCopy}>
              {t('BRIEF_V3_SHARE_COPY')}
            </Button>
          </div>
          <div className={styles.shareToggleRow}>
            <Switch size='small' checked={share.isActive} loading={isUpdating} onChange={handleToggle} />
            <span>{t('BRIEF_V3_SHARE_ACTIVE')}</span>
          </div>
        </>
      )}
    </div>
  );
};

interface ShareControlProps {
  briefId: string;
  compact?: boolean;
}

const ShareControl = (props: ShareControlProps) => {
  const { isFetching } = useGetBriefAiShareQuery(props.briefId, {
    refetchOnMountOrArgChange: true,
  });

  const shareLabel = t('BRIEF_V3_SHARE');

  return (
    <Popover
      content={<ShareControlPanel briefId={props.briefId} />}
      title={t('BRIEF_V3_SHARE_TITLE')}
      trigger='click'
      placement='bottomRight'
    >
      <Button
        icon={<ShareAltOutlined />}
        loading={isFetching}
        aria-label={shareLabel}
        className={props.compact ? styles.iconOnlyButton : undefined}
      >
        {props.compact ? null : shareLabel}
      </Button>
    </Popover>
  );
};

const tabButtonClass = (active: boolean): string => {
  return active ? `${styles.tabButton} ${styles.tabButtonActive}` : styles.tabButton;
};

const saveStatusClass = (state: SaveState): string => {
  if (state === 'saved') {
    return `${styles.saveStatus} ${styles.saveStatusSaved}`;
  }
  if (state === 'error') {
    return `${styles.saveStatus} ${styles.saveStatusError}`;
  }
  return styles.saveStatus;
};

export const BriefFinalPackage = forwardRef<BriefFinalPackageHandle, BriefFinalPackageProps>((props, ref) => {
  const { briefId, package: pkg, onRegenerate, isRegenerating, mobileActionsSlot } = props;
  const isWhiteLabel = props.whiteLabel ?? false;
  const { isMobile } = useBreakpoint();
  const byKind = new Map(pkg.documents.map((x) => [x.kind, x]));

  const allTabs: { key: 'production_brief' | 'vendor_email'; label: string; document?: BriefFinalDocument }[] = [
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
  const tabs = isWhiteLabel ? allTabs.filter((x) => x.key !== 'vendor_email') : allTabs;

  const [activeKey, setActiveKey] = useState<'production_brief' | 'vendor_email'>('production_brief');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const editorRef = useRef<DocumentEditorHandle | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      flush: () => editorRef.current?.flush() ?? Promise.resolve(),
    }),
    []
  );
  const preVendorsRef = useRef<HTMLElement | null>(null);

  const { data: briefDetail } = useGetBriefAiDetailQuery(briefId);
  const { data: shareInfo } = useGetBriefAiShareQuery(briefId);

  const preVendorsLanguage: PreVendorLanguage = getLocale() === 'ru' ? 'ru' : 'en';

  const { data: preVendorsResponse } = useGetPreVendorsQuery({ language: preVendorsLanguage }, { skip: isWhiteLabel });
  const preVendors = preVendorsResponse?.preVendors ?? [];
  const hasPreVendors = preVendors.length > 0;

  const shareUrl =
    shareInfo && typeof window !== 'undefined'
      ? `${window.location.origin}${AppRoute.SHARED_BRIEF(shareInfo.token)}`
      : '';
  const sendDisabled = !shareInfo?.isActive;
  const briefTitle = briefDetail?.title ?? '';
  const vendorEmailHtml = byKind.get('vendor_email')?.html ?? null;

  const handlePickVendor = () => {
    preVendorsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeTab = tabs.find((x) => x.key === activeKey) ?? tabs[0];
  const activeDoc = activeTab.document;

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

  const actionsNode = (
    <>
      <span className={saveStatusClass(saveState)}>{saveLabel}</span>
      {!isWhiteLabel && hasPreVendors ? (
        <div className={isMobile ? styles.pickVendorMobileWrap : styles.pickVendorWrap}>
          <PickVendorButton onClick={handlePickVendor} />
        </div>
      ) : null}
      {!isWhiteLabel ? <ShareControl briefId={briefId} compact={isMobile} /> : null}
      {!isWhiteLabel ? (
        <Button
          type='primary'
          icon={<DownloadOutlined />}
          onClick={() => editorRef.current?.download()}
          disabled={!activeDoc}
          aria-label={t('BRIEF_V3_DOWNLOAD_PDF')}
          className={isMobile ? styles.iconOnlyButton : undefined}
        >
          {isMobile ? null : t('BRIEF_V3_DOWNLOAD_PDF')}
        </Button>
      ) : null}
    </>
  );

  const showActionsInline = !isMobile || !mobileActionsSlot;

  return (
    <div className={styles.outerScroll}>
      {isMobile && mobileActionsSlot ? createPortal(actionsNode, mobileActionsSlot) : null}
      <div className={styles.wrapper}>
        <div className={styles.tabsHeader}>
          <div className={styles.tabsList}>
            {tabs.map((tab) => (
              <button
                type='button'
                key={tab.key}
                className={tabButtonClass(tab.key === activeKey)}
                onClick={() => handleSelectTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {showActionsInline ? <div className={styles.headerActions}>{actionsNode}</div> : null}
        </div>

        {activeDoc ? (
          <DocumentEditor
            key={activeDoc.id}
            ref={editorRef}
            briefId={briefId}
            document={activeDoc}
            onSaveStateChange={setSaveState}
          />
        ) : (
          <div className={styles.missingDoc}>{t('BRIEF_V3_DOCUMENT_MISSING')}</div>
        )}
      </div>

      {!isWhiteLabel && hasPreVendors ? (
        <PreVendorsBlock
          ref={preVendorsRef}
          preVendors={preVendors}
          briefTitle={briefTitle}
          shareUrl={shareUrl}
          vendorEmailHtml={vendorEmailHtml}
          sendDisabled={sendDisabled}
          disabledPopoverTitle={t('BRIEF_V3_SHARE_TITLE')}
          disabledPopoverContent={
            <ShareControlPanel
              briefId={briefId}
              header={<div className={styles.shareRequiredNotice}>{t('PRE_VENDORS_SHARE_REQUIRED_NOTICE')}</div>}
            />
          }
        />
      ) : null}
    </div>
  );
});

BriefFinalPackage.displayName = 'BriefFinalPackage';
