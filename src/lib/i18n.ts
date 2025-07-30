import { catalog, LocaleKey } from '@/locales';

export const locale: LocaleKey = (process.env.NEXT_PUBLIC_LOCALE as LocaleKey) || 'ru';

const messages = catalog[locale];

type MsgKey = keyof typeof messages;

export function t(key: MsgKey, parameter?: string): string {
  const value = messages[key];

  if (typeof value === 'string') {
    return value ?? key;
  }

  return value(parameter ?? '');
}
