import { catalog, LocaleKey } from '@/locales';
import type { Element } from 'domhandler';
import parse, { domToReact, DOMNode } from 'html-react-parser';
import React from 'react';

export const locale: LocaleKey = (process.env.NEXT_PUBLIC_LOCALE as LocaleKey) || 'en';

const messages = catalog[locale];

type MsgKey = keyof typeof messages;

export function t(key: MsgKey, parameter?: string): string {
  const value = messages[key];

  if (typeof value === 'string') {
    return value ?? key;
  }

  return value(parameter ?? '');
}

function isElement(node: DOMNode): node is Element {
  return (node as Element).type === 'tag';
}

export function tRich(key: MsgKey, components: Record<string, React.ReactElement>): React.ReactNode {
  const html = t(key);

  return parse(html, {
    replace: (domNode: DOMNode) => {
      if (isElement(domNode) && components[domNode.tagName]) {
        const validChildren = domNode.children.filter(
          (child): child is DOMNode => typeof child === 'object' && child !== null
        );

        return React.cloneElement(components[domNode.tagName], {}, domToReact(validChildren));
      }
    },
  });
}
