import type { LocaleKey } from '@/locales';

interface GlobalWithLocale {
  __aivusServerLocale?: LocaleKey;
}

export const setServerLocale = (value: LocaleKey): void => {
  const previous = (globalThis as GlobalWithLocale).__aivusServerLocale;
  if (previous && previous !== value) {
    console.warn(`[serverLocale] concurrent flip ${previous} -> ${value}`);
  }
  (globalThis as GlobalWithLocale).__aivusServerLocale = value;
};

(globalThis as GlobalWithLocale & { __aivusGetServerLocale?: () => LocaleKey | null }).__aivusGetServerLocale =
  (): LocaleKey | null => {
    return (globalThis as GlobalWithLocale).__aivusServerLocale ?? null;
  };
