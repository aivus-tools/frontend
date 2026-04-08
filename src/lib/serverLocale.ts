import type { LocaleKey } from '@/locales';

interface GlobalWithLocale {
  __aivusServerLocale?: LocaleKey;
}

export const setServerLocale = (value: LocaleKey): void => {
  (globalThis as GlobalWithLocale).__aivusServerLocale = value;
};

(globalThis as GlobalWithLocale & { __aivusGetServerLocale?: () => LocaleKey | null }).__aivusGetServerLocale =
  (): LocaleKey | null => {
    return (globalThis as GlobalWithLocale).__aivusServerLocale ?? null;
  };
