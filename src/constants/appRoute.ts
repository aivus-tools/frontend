export const AppRoute = {
  APP: '/app',
  AUTH: '/auth',
  CONFIRM: '/app/confirm',
  DASHBOARD: '/app/dashboard',
  DASHBOARD_PROJECT: (projectId: string) => `/app/dashboard/${projectId}`,
  DASHBOARD_PROJECT_ANALYSIS: (projectId: string) => `/app/dashboard/${projectId}/analysis`,
  DASHBOARD_PROJECT_DETAILS: (projectId: string) => `/app/dashboard/${projectId}/details`,
  DASHBOARD_PROJECT_ESTIMATION: (projectId: string) => `/app/dashboard/${projectId}/estimation`,
  DASHBOARD_PROJECT_OFFER: (projectId: string) => `/app/dashboard/${projectId}/offer`,
  DASHBOARD_PROJECT_PRESENTATION: (projectId: string) => `/app/dashboard/${projectId}/presentation`,
  DASHBOARD_PROJECT_TIMING: (projectId: string) => `/app/dashboard/${projectId}/timing`,
  EXTERNAL: '/external',
  GROUP: '/app/group',
  HOME: '/',
  RATES: '/app/rates',
  TEMPLATES: '/app/templates',
} as const;

export type AppRouteValue = (typeof AppRoute)[keyof typeof AppRoute];
