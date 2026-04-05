'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { ToolbarButton, ToolbarDivider, EditorToolbar } from './styled';

interface BriefToolbarProps {
  editor: Editor | null;
}

export const BriefToolbar: React.FC<BriefToolbarProps> = (props) => {
  if (!props.editor) {
    return null;
  }

  return (
    <EditorToolbar>
      <ToolbarButton
        $active={props.editor.isActive('bold')}
        onClick={() => props.editor!.chain().focus().toggleBold().run()}
        title='Bold'
      >
        B
      </ToolbarButton>
      <ToolbarButton
        $active={props.editor.isActive('italic')}
        onClick={() => props.editor!.chain().focus().toggleItalic().run()}
        title='Italic'
        style={{ fontStyle: 'italic' }}
      >
        I
      </ToolbarButton>
      <ToolbarButton
        $active={props.editor.isActive('underline')}
        onClick={() => props.editor!.chain().focus().toggleUnderline().run()}
        title='Underline'
        style={{ textDecoration: 'underline' }}
      >
        U
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        $active={props.editor.isActive('bulletList')}
        onClick={() => props.editor!.chain().focus().toggleBulletList().run()}
        title='Bullet list'
      >
        -
      </ToolbarButton>
      <ToolbarButton
        $active={props.editor.isActive('orderedList')}
        onClick={() => props.editor!.chain().focus().toggleOrderedList().run()}
        title='Ordered list'
      >
        1.
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        $active={props.editor.isActive('heading', { level: 2 })}
        onClick={() => props.editor!.chain().focus().toggleHeading({ level: 2 }).run()}
        title='Heading 2'
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        $active={props.editor.isActive('heading', { level: 3 })}
        onClick={() => props.editor!.chain().focus().toggleHeading({ level: 3 }).run()}
        title='Heading 3'
      >
        H3
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        $active={props.editor.isActive('blockquote')}
        onClick={() => props.editor!.chain().focus().toggleBlockquote().run()}
        title='Quote'
      >
        &ldquo;
      </ToolbarButton>
      <ToolbarButton onClick={() => props.editor!.chain().focus().setHorizontalRule().run()} title='Horizontal rule'>
        ---
      </ToolbarButton>
    </EditorToolbar>
  );
};
