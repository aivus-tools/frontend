import { catalog, LocaleKey } from '@/locales';
import type { Element } from 'domhandler';
import parse, { domToReact, DOMNode } from 'html-react-parser';
import React from 'react';

const DEFAULT_LOCALE: LocaleKey = 'en';

let cachedLocale: LocaleKey | null = null;

function getLocaleFromCookie(): LocaleKey {
  const envLocale = process.env.NEXT_PUBLIC_LOCALE;
  if (envLocale === 'en' || envLocale === 'ru') {
    return envLocale as LocaleKey;
  }

  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const match = document.cookie.match(/(?:^|;\s*)locale=(\w+)/);
  if (match && (match[1] === 'en' || match[1] === 'ru')) {
    return match[1] as LocaleKey;
  }

  return DEFAULT_LOCALE;
}

function getLocale(): LocaleKey {
  if (cachedLocale) {
    return cachedLocale;
  }

  cachedLocale = getLocaleFromCookie();
  return cachedLocale;
}

function getInitialLocale(): LocaleKey {
  const envLocale = process.env.NEXT_PUBLIC_LOCALE;
  if (envLocale === 'en' || envLocale === 'ru') {
    return envLocale as LocaleKey;
  }

  if (typeof window !== 'undefined') {
    return getLocale();
  }

  return DEFAULT_LOCALE;
}

export let locale: LocaleKey = getInitialLocale();

export function resetLocaleCache(): void {
  cachedLocale = null;
  locale = getInitialLocale();
}

type MsgKey = keyof typeof catalog.en;

export function t(key: MsgKey, parameter?: string): string {
  const currentLocale = getLocale();
  const messages = catalog[currentLocale];
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
      return undefined;
    },
  });
}
