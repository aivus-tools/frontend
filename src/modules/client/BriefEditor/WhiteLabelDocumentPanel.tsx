'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Alert, App } from 'antd';
import { t } from '@/lib/i18n';
import {
  useGetPublicBriefFinalDocumentsQuery,
  useUpdatePublicBriefFinalDocumentMutation,
} from '@/services/client/publicBriefApi';
import { BriefFinalDocument } from '@/types/briefAi.interface';
import { FinalizingView } from './components/FinalizingView';

import styles from './BriefFinalPackage.module.css';

const AUTOSAVE_DEBOUNCE_MS = 1200;

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface WhiteLabelDocumentHandle {
  getProductionBriefHtml: () => string;
  getLatestHtml: () => string;
  flush: () => Promise<void>;
}

interface WhiteLabelDocumentEditorProps {
  briefId: string;
  document: BriefFinalDocument;
  token: string;
  onSaveStateChange: (state: SaveState) => void;
  onHtmlChange?: (html: string) => void;
}

const htmlToPlainText = (html: string): string => {
  if (typeof document === 'undefined') {
    return html;
  }
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerText;
};

const is409Error = (error: unknown): boolean => {
  if (typeof error !== 'object' || error == null) {
    return false;
  }
  const status = (error as { status?: unknown }).status;
  return status === 409;
};

const WhiteLabelDocumentEditor = forwardRef<WhiteLabelDocumentHandle, WhiteLabelDocumentEditorProps>((props, ref) => {
  const { briefId, document: doc, token, onSaveStateChange, onHtmlChange } = props;
  const { message: messageApi } = App.useApp();
  const [updateDoc] = useUpdatePublicBriefFinalDocumentMutation();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestHtmlRef = useRef<string>(doc.html);
  const saveBlockedRef = useRef<boolean>(false);
  const onSaveStateChangeRef = useRef(onSaveStateChange);
  onSaveStateChangeRef.current = onSaveStateChange;
  const updateDocRef = useRef(updateDoc);
  updateDocRef.current = updateDoc;
  const docRef = useRef(doc);
  docRef.current = doc;
  const briefIdRef = useRef(briefId);
  briefIdRef.current = briefId;
  const tokenRef = useRef(token);
  tokenRef.current = token;

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
      onHtmlChange?.(html);
      setSaveState('saving');
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(async () => {
        if (saveBlockedRef.current) {
          saveTimerRef.current = null;
          return;
        }
        try {
          await updateDoc({
            briefId,
            documentId: doc.id,
            html,
            plainText: htmlToPlainText(html),
            token,
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
        } finally {
          saveTimerRef.current = null;
        }
      }, AUTOSAVE_DEBOUNCE_MS);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        if (!saveBlockedRef.current) {
          const html = latestHtmlRef.current;
          updateDocRef
            .current({
              briefId: briefIdRef.current,
              documentId: docRef.current.id,
              html,
              plainText: htmlToPlainText(html),
              token: tokenRef.current,
            })
            .unwrap()
            .catch(() => {
              /* flush on unmount — ignore errors */
            });
        }
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
    if (saveTimerRef.current) {
      return;
    }
    editor.commands.setContent(doc.html, { emitUpdate: false });
    latestHtmlRef.current = doc.html;
  }, [doc.html, doc.id, editor]);

  useImperativeHandle(
    ref,
    () => ({
      getProductionBriefHtml: () => latestHtmlRef.current,
      getLatestHtml: () => latestHtmlRef.current,
      flush: async () => {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }
        if (saveBlockedRef.current) {
          return;
        }
        const html = latestHtmlRef.current;
        try {
          await updateDocRef
            .current({
              briefId: briefIdRef.current,
              documentId: docRef.current.id,
              html,
              plainText: htmlToPlainText(html),
              token: tokenRef.current,
            })
            .unwrap();
          setSaveState('saved');
        } catch {
          setSaveState('error');
        }
      },
    }),
    []
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

WhiteLabelDocumentEditor.displayName = 'WhiteLabelDocumentEditor';

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
        className={toolButtonClass(editor.isActive('underline'))}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        Underline
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
        className={toolButtonClass(editor.isActive('bulletList'))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        List
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

const saveStatusClass = (state: SaveState): string => {
  if (state === 'saved') {
    return `${styles.saveStatus} ${styles.saveStatusSaved}`;
  }
  if (state === 'error') {
    return `${styles.saveStatus} ${styles.saveStatusError}`;
  }
  return styles.saveStatus;
};

const GENERATING_POLL_INTERVAL_MS = 3000;

interface WhiteLabelDocumentPanelProps {
  briefId: string;
  token: string;
}

export const WhiteLabelDocumentPanel = forwardRef<WhiteLabelDocumentHandle, WhiteLabelDocumentPanelProps>(
  (props, ref) => {
    const { briefId, token } = props;
    const { message: messageApi } = App.useApp();
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [pollingInterval, setPollingInterval] = useState(0);
    const [activeTab, setActiveTab] = useState<'production_brief' | 'deliverables_checklist'>('production_brief');
    const editorRef = useRef<WhiteLabelDocumentHandle | null>(null);
    const productionBriefHtmlRef = useRef<string>('');

    const handleProductionBriefHtmlChange = useCallback((html: string) => {
      productionBriefHtmlRef.current = html;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getProductionBriefHtml: () => {
          if (activeTab === 'production_brief') {
            return editorRef.current?.getLatestHtml() ?? productionBriefHtmlRef.current;
          }
          return productionBriefHtmlRef.current;
        },
        getLatestHtml: () => editorRef.current?.getLatestHtml() ?? '',
        flush: () => editorRef.current?.flush() ?? Promise.resolve(),
      }),
      [activeTab]
    );

    const {
      data: pkg,
      isLoading,
      isError,
    } = useGetPublicBriefFinalDocumentsQuery(
      { briefId, token },
      {
        skip: !briefId || !token,
        pollingInterval,
      }
    );

    useEffect(() => {
      setPollingInterval(pkg?.generating ? GENERATING_POLL_INTERVAL_MS : 0);
    }, [pkg?.generating]);

    useEffect(() => {
      if (isError) {
        messageApi.error(t('UNEXPECTED_ERROR'));
      }
    }, [isError, messageApi]);

    useEffect(() => {
      const productionBriefDoc = pkg?.documents.find((x) => x.kind === 'production_brief');
      if (productionBriefDoc && !productionBriefHtmlRef.current) {
        productionBriefHtmlRef.current = productionBriefDoc.html;
      }
    }, [pkg]);

    if (isLoading || pkg?.generating) {
      return (
        <div className={styles.loadingWrapper}>
          <FinalizingView />
        </div>
      );
    }

    if (pkg?.finalizeFailed) {
      return (
        <div className={styles.loadingWrapper}>
          <Alert
            type='error'
            message={t('BRIEF_V3_FINALIZE_FAILED')}
            description={t('BRIEF_V3_FINALIZE_FAILED_HINT')}
            showIcon
          />
        </div>
      );
    }

    const productionBrief = pkg?.documents.find((x) => x.kind === 'production_brief');
    const deliverablesChecklist = pkg?.documents.find((x) => x.kind === 'deliverables_checklist');

    if (!productionBrief) {
      return <div className={styles.missingDoc}>{t('BRIEF_V3_DOCUMENT_MISSING')}</div>;
    }

    const saveLabel =
      saveState === 'saving'
        ? t('BRIEF_V3_SAVING')
        : saveState === 'saved'
          ? t('BRIEF_V3_SAVED')
          : saveState === 'error'
            ? t('BRIEF_V3_SAVE_FAILED')
            : '';

    const activeDocument =
      activeTab === 'deliverables_checklist' && deliverablesChecklist ? deliverablesChecklist : productionBrief;

    return (
      <div className={styles.outerScroll}>
        <div className={styles.wrapper}>
          <div className={styles.tabsHeader}>
            <div className={styles.tabsList}>
              <button
                type='button'
                className={`${styles.tabButton}${activeTab === 'production_brief' ? ` ${styles.tabButtonActive}` : ''}`}
                onClick={() => setActiveTab('production_brief')}
              >
                {t('BRIEF_V3_TAB_PRODUCTION_BRIEF')}
              </button>
              {!!deliverablesChecklist && (
                <button
                  type='button'
                  className={`${styles.tabButton}${activeTab === 'deliverables_checklist' ? ` ${styles.tabButtonActive}` : ''}`}
                  onClick={() => setActiveTab('deliverables_checklist')}
                >
                  {t('BRIEF_V3_TAB_DELIVERABLES')}
                </button>
              )}
            </div>
            <div className={styles.headerActions}>
              <span className={saveStatusClass(saveState)}>{saveLabel}</span>
            </div>
          </div>
          <WhiteLabelDocumentEditor
            key={activeDocument.id}
            ref={editorRef}
            briefId={briefId}
            document={activeDocument}
            token={token}
            onSaveStateChange={setSaveState}
            onHtmlChange={activeTab === 'production_brief' ? handleProductionBriefHtmlChange : undefined}
          />
        </div>
      </div>
    );
  }
);

WhiteLabelDocumentPanel.displayName = 'WhiteLabelDocumentPanel';
