'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent as TipTapEditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { BriefToolbar } from './BriefToolbar';
import { EditorWrapper, EditorContent, CostBadge } from './styled';
import { t } from '@/lib/i18n';
import { SectionStatus } from '@/types/briefV2.interface';

interface BriefEditorProps {
  documentHtml: string;
  sectionsStatus: Record<string, SectionStatus>;
  sectionsChanged: string[];
  readOnly: boolean;
  totalCostUsd: string;
  onSectionEdit: ((sectionKey: string, html: string) => void) | null;
}

const DEBOUNCE_MS = 600;

const extractSectionHtml = (fullHtml: string, sectionKey: string): string | null => {
  const regex = new RegExp(
    `<div[^>]*data-section="${sectionKey}"[^>]*>([\\s\\S]*?)</div>(?=\\s*<hr|\\s*<div[^>]*data-section|\\s*$)`,
    'i'
  );
  const match = fullHtml.match(regex);
  return match ? match[0] : null;
};

export const BriefEditor: React.FC<BriefEditorProps> = (props) => {
  const prevHtmlRef = useRef(props.documentHtml);
  const isUpdatingRef = useRef(false);
  const onSectionEditRef = useRef(props.onSectionEdit);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  onSectionEditRef.current = props.onSectionEdit;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content: props.documentHtml,
    editable: !props.readOnly,
    onUpdate: (x) => {
      if (isUpdatingRef.current || !onSectionEditRef.current) {
        return;
      }
      const html = x.editor.getHTML();
      const activeElement = document.activeElement;
      if (activeElement) {
        const sectionDiv = activeElement.closest('[data-section]');
        if (sectionDiv) {
          const sectionKey = sectionDiv.getAttribute('data-section');
          if (sectionKey) {
            const sectionHtml = extractSectionHtml(html, sectionKey);
            if (sectionHtml) {
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }
              debounceRef.current = setTimeout(() => {
                onSectionEditRef.current?.(sectionKey, sectionHtml);
              }, DEBOUNCE_MS);
            }
          }
        }
      }
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!props.readOnly);
  }, [editor, props.readOnly]);

  useEffect(() => {
    if (!editor || props.documentHtml === prevHtmlRef.current) {
      return;
    }
    isUpdatingRef.current = true;
    editor.commands.setContent(props.documentHtml, { emitUpdate: false });
    isUpdatingRef.current = false;
    prevHtmlRef.current = props.documentHtml;
  }, [editor, props.documentHtml]);

  const highlightSections = useCallback((sections: string[]) => {
    if (sections.length === 0) {
      return;
    }
    sections.forEach((key) => {
      const element = document.querySelector(`[data-section="${key}"]`);
      if (element) {
        element.classList.add('section-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    highlightTimerRef.current = setTimeout(() => {
      sections.forEach((key) => {
        const element = document.querySelector(`[data-section="${key}"]`);
        if (element) {
          element.classList.remove('section-highlight');
        }
      });
    }, 2000);
  }, []);

  useEffect(() => {
    highlightSections(props.sectionsChanged);
  }, [props.sectionsChanged, highlightSections]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  return (
    <EditorWrapper>
      {!props.readOnly && <BriefToolbar editor={editor} />}
      <EditorContent>
        <style>{`
          .section-highlight {
            animation: sectionPulse 2s ease-out forwards;
          }
          @keyframes sectionPulse {
            0% { background-color: rgba(34, 136, 255, 0.12); border-radius: 8px; }
            100% { background-color: transparent; }
          }
        `}</style>
        <TipTapEditorContent editor={editor} />
      </EditorContent>
      {props.totalCostUsd !== '0' && (
        <CostBadge>
          {t('BRIEF_V2_COST_LABEL')}: ${props.totalCostUsd}
        </CostBadge>
      )}
    </EditorWrapper>
  );
};
