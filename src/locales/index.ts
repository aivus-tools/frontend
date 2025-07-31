import { EN_LOCALES as en } from './en';
import { RU_LOCALES as ru } from './ru';

export const catalog = { en, ru } as const;
export type LocaleKey = keyof typeof catalog;
