export const AppRoute = {
  APP: '/app',
  AUTH_CONTEXT: '/auth/context',
  CONFIRM: '/app/confirm',
  DASHBOARD: '/app/dashboard',
  DASHBOARD_PROJECT: '/app/dashboard/[projectId]',
  DASHBOARD_PROJECT_ANALYSIS: '/app/dashboard/[projectId]/analysis',
  DASHBOARD_PROJECT_DETAILS: '/app/dashboard/[projectId]/details',
  DASHBOARD_PROJECT_ESTIMATION: '/app/dashboard/[projectId]/estimation',
  DASHBOARD_PROJECT_OFFER: '/app/dashboard/[projectId]/offer',
  DASHBOARD_PROJECT_PRESENTATION: '/app/dashboard/[projectId]/presentation',
  DASHBOARD_PROJECT_TIMING: '/app/dashboard/[projectId]/timing',
  EXTERNAL: '/external',
  GROUP: '/app/group',
  HOME: '/',
  RATES: '/app/rates',
  TEMPLATES: '/app/templates',
} as const;

export type AppRouteValue = (typeof AppRoute)[keyof typeof AppRoute];
