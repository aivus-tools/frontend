import { THEME } from '@/lib/constants';

export type Theme = (typeof THEME)[keyof typeof THEME];
