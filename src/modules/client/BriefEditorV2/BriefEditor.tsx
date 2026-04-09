'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent as TipTapEditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Section } from './SectionExtension';
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

interface PendingSave {
  sectionKey: string;
  html: string;
}

const extractSectionHtml = (fullHtml: string, sectionKey: string): string | null => {
  const escapedKey = sectionKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, 'text/html');
  const sectionDiv = doc.querySelector(`[data-section="${escapedKey}"]`);

  if (!sectionDiv) {
    return null;
  }

  return sectionDiv.innerHTML;
};

const stripEmptyOrPlaceholderSections = (fullHtml: string): string => {
  if (!fullHtml || typeof window === 'undefined') {
    return fullHtml;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, 'text/html');
  const sectionDivs = doc.querySelectorAll('[data-section]');
  sectionDivs.forEach((node) => {
    const text = (node.textContent || '').trim().toLowerCase();
    const meaningful = text.replace(/[\d.\s]/g, '');
    if (!meaningful || meaningful === 'na' || meaningful === 'n/a' || /^[1-9]\.?[a-z\s]*na?$/i.test(text)) {
      const next = node.nextElementSibling;
      if (next && next.tagName === 'HR') {
        next.remove();
      }
      node.remove();
    }
  });
  return doc.body.innerHTML;
};

export const BriefEditor: React.FC<BriefEditorProps> = (props) => {
  const prevHtmlRef = useRef(props.documentHtml);
  const isUpdatingRef = useRef(false);
  const onSectionEditRef = useRef(props.onSectionEdit);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<PendingSave | null>(null);
  const currentSectionRef = useRef<string | null>(null);

  onSectionEditRef.current = props.onSectionEdit;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Section,
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
    content: stripEmptyOrPlaceholderSections(props.documentHtml),
    editable: !props.readOnly,
    onUpdate: (x) => {
      if (isUpdatingRef.current || !onSectionEditRef.current) {
        return;
      }
      const html = x.editor.getHTML();

      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) {
        return;
      }

      let node: Node | null = selection.anchorNode;
      let sectionDiv: Element | null = null;

      while (node) {
        if (node instanceof Element && node.hasAttribute('data-section')) {
          sectionDiv = node;
          break;
        }
        node = node.parentNode;
      }

      if (!sectionDiv) {
        return;
      }

      const sectionKey = sectionDiv.getAttribute('data-section');
      if (!sectionKey) {
        return;
      }

      const sectionHtml = extractSectionHtml(html, sectionKey);
      if (!sectionHtml) {
        return;
      }

      if (currentSectionRef.current !== sectionKey && pendingSaveRef.current) {
        const pending = pendingSaveRef.current;
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        onSectionEditRef.current(pending.sectionKey, pending.html);
        pendingSaveRef.current = null;
      }

      currentSectionRef.current = sectionKey;
      pendingSaveRef.current = { sectionKey, html: sectionHtml };

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (pendingSaveRef.current) {
          const save = pendingSaveRef.current;
          pendingSaveRef.current = null;
          onSectionEditRef.current?.(save.sectionKey, save.html);
        }
      }, DEBOUNCE_MS);
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
    editor.commands.setContent(stripEmptyOrPlaceholderSections(props.documentHtml), { emitUpdate: false });
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
      if (pendingSaveRef.current && onSectionEditRef.current) {
        const save = pendingSaveRef.current;
        onSectionEditRef.current(save.sectionKey, save.html);
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
