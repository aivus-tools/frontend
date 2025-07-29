import { catalog, LocaleKey } from '@/locales';

export const locale: LocaleKey = (process.env.NEXT_PUBLIC_LOCALE as LocaleKey) || 'en';

const messages = catalog[locale];

type MsgKey = keyof typeof messages;

export function t(key: MsgKey): string {
  return messages[key] ?? key;
}
