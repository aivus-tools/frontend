import { Node, mergeAttributes } from '@tiptap/core';

export interface SectionOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    section: {
      setSection: (attributes: { sectionKey: string }) => ReturnType;
    };
  }
}

export const Section = Node.create<SectionOptions>({
  name: 'section',

  group: 'block',

  content: 'block*',

  defining: false,

  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      sectionKey: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-section'),
        renderHTML: (attributes) => {
          if (!attributes.sectionKey) {
            return {};
          }
          return {
            'data-section': attributes.sectionKey,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-section]',
        getAttrs: (node) => {
          if (typeof node === 'string') {
            return null;
          }
          const sectionKey = node.getAttribute('data-section');
          return sectionKey ? { sectionKey } : null;
        },
      },
    ];
  },

  renderHTML(params) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, params.HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSection: (attributes) => (params) => {
        return params.commands.wrapIn(this.name, attributes);
      },
    };
  },
});
