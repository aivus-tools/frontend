import { t } from '@/lib/i18n';

export const AUTH_TYPES = {
  google: 'GOOGLE',
  credentials: 'CREDENTIALS',
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
};

export const GROUPS = {
  client: 'CLIENT',
  vendor: 'VENDOR',
  unconfirmed: 'UNCONFIRMED',
  confirmed: 'CONFIRMED',
} as const;

export const THEME = {
  dark: 'dark',
  light: 'light',
};

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

export const VENDOR_PROJECT_TABS = [
  {
    key: 'details',
    label: t('PROJECT_DETAILS'),
  },
  {
    key: 'estimation',
    label: t('ESTIMATION'),
  },
  {
    key: 'offer',
    label: t('CLIENTS_OFFER'),
  },
  {
    key: 'timing',
    label: t('TIMING'),
  },
  {
    key: 'presentation',
    label: t('PRESENTATION'),
  },
  {
    key: 'analysis',
    label: t('ANALYSIS'),
  },
];

export const NEW_BRIEF_SLUG = 'new-brief';

export const PROJECT_STATUS = {
  DRAFT: t('STATUS_DRAFT'),
  RFP: t('STATUS_RFP'),
  REVIEWING: t('STATUS_REVIEWING'),
  ONGOING: t('STATUS_ONGOING'),
  COMPLETED: t('STATUS_COMPLETED'),
} as const;
