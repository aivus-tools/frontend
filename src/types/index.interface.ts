import { THEME } from '@/constants/constants';

export type Theme = (typeof THEME)[keyof typeof THEME];
