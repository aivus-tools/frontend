import { catalog, LocaleKey } from '@/locales';
import type { Element } from 'domhandler';
import parse, { domToReact, DOMNode } from 'html-react-parser';
import React from 'react';

function getLocale(): LocaleKey {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)locale=(\w+)/);
    if (match && (match[1] === 'en' || match[1] === 'ru')) {
      return match[1] as LocaleKey;
    }
  }
  return (process.env.NEXT_PUBLIC_LOCALE as LocaleKey) || 'en';
}

export const locale: LocaleKey = getLocale();

const messages = catalog[locale];

type MsgKey = keyof typeof messages;

export function t(key: MsgKey, parameter?: string): string {
  const value = messages[key];

  if (typeof value === 'string') {
    return value ?? key;
  }

  if (typeof value === 'function') {
    return value(parameter ?? '');
  }

  return (key as string) ?? '';
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
