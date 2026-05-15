import { t } from '@/lib/i18n';

export const HEADER_HEIGHT_DESKTOP = 70;
export const HEADER_HEIGHT_MOBILE = 56;

export const AUTH_TYPES = {
  google: 'GOOGLE',
  credentials: 'CREDENTIALS',
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
} as const;

export const GROUPS = {
  client: 'CLIENT',
  vendor: 'VENDOR',
  unconfirmed: 'UNCONFIRMED',
  confirmed: 'CONFIRMED',
} as const;

export const THEME = {
  dark: 'dark',
  light: 'light',
} as const;

export const VENDOR_TABS = [
  {
    key: 'dashboard',
    label: t('DASHBOARD'),
  },
  {
    key: 'templates',
    label: t('TEMPLATES'),
  },
  {
    key: 'rates',
    label: t('RATES'),
  },
];

export const VENDOR_PROJECT_TAB_KEYS = {
  DETAILS: 'details',
  ESTIMATION: 'estimation',
  OFFER: 'offer',
  TIMING: 'timing',
  PRESENTATION: 'presentation',
  ANALYSIS: 'analysis',
} as const;

export type VendorProjectTabKey = (typeof VENDOR_PROJECT_TAB_KEYS)[keyof typeof VENDOR_PROJECT_TAB_KEYS];

export const VENDOR_PROJECT_TABS = [
  {
    key: VENDOR_PROJECT_TAB_KEYS.DETAILS,
    label: t('PROJECT_DETAILS'),
  },
  {
    key: VENDOR_PROJECT_TAB_KEYS.ESTIMATION,
    label: t('ESTIMATION'),
  },
  {
    key: VENDOR_PROJECT_TAB_KEYS.OFFER,
    label: t('CLIENTS_OFFER'),
  },
  // {
  //   key: VENDOR_PROJECT_TAB_KEYS.TIMING,
  //   label: t('TIMING'),
  // },
  // {
  //   key: VENDOR_PROJECT_TAB_KEYS.PRESENTATION,
  //   label: t('PRESENTATION'),
  // },
  // {
  //   key: VENDOR_PROJECT_TAB_KEYS.ANALYSIS,
  //   label: t('ANALYSIS'),
  // },
];

export const NEW_BRIEF_SLUG = 'new-brief';

export const PROJECT_STATUS = {
  DRAFT: 'DRAFT',
  RFP: 'RFP',
  REVIEWING: 'REVIEWING',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const PROJECT_STATUS_LABEL: Record<string, () => string> = {
  [PROJECT_STATUS.DRAFT]: () => t('STATUS_DRAFT'),
  [PROJECT_STATUS.RFP]: () => t('STATUS_RFP'),
  [PROJECT_STATUS.REVIEWING]: () => t('STATUS_REVIEWING'),
  [PROJECT_STATUS.ONGOING]: () => t('STATUS_ONGOING'),
  [PROJECT_STATUS.COMPLETED]: () => t('STATUS_COMPLETED'),
  [PROJECT_STATUS.CANCELLED]: () => t('STATUS_CANCELLED'),
};

export const getProjectStatusLabel = (status: string): string => PROJECT_STATUS_LABEL[status]?.() ?? status;
