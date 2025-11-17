const BASE_URL = `${process.env.API_URL}/api/v1`;

export const CALLBACK_URL = process.env.CALLBACK_URL ?? '';

/**
 * API pathnames (without domain) - used for HMAC signature generation
 */
export const ApiPathname = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  CHECK_EMAIL: '/api/v1/auth/check-email',
  RESEND_CONFIRMATION: '/api/v1/auth/resend-confirmation',
  USER_INFO: '/api/v1/users/me',
  CHANGE_ROLE: (id: number | string) => `/api/v1/auth/change-group/${id}`,
  GET_USERS: '/api/v1/users',
  USER_CHANGE_GROUP: (userId: string | number) => `/api/v1/users/${userId}/change-group`,
} as const;

// TODO приставку BASE_URL из некоторых роутов нужно будет из этого файла убрать
export const ApiRoute = {
  BRIEF: (id: string | number) => `/service/briefs/${id}`,
  BRIEF_LIST: `/service/briefs`,
  CATEGORY: (id: string | number) => `/service/categories/${id}`,
  CATEGORY_LIST: `/service/categories`,
  CHANGE_ROLE: (id: number | string) => `${BASE_URL}/auth/change-group/${id}`,
  CHECK_EMAIL: `${BASE_URL}/auth/check-email`,
  CONFIRM_EMAIL: (token: string) => `/service/auth/confirm-email?token=${token}`,
  RESEND_CONFIRMATION: `${BASE_URL}/auth/resend-confirmation`,
  RESEND_CONFIRMATION_SERVICE: `/service/auth/resend-confirmation`,
  ENTRY: (id: string | number) => `/service/entries/${id}`,
  ENTRY_LIST: `/service/entries`,
  GET_USERS: `${BASE_URL}/users`,
  LOGIN: `${BASE_URL}/auth/login`,
  OFFERS_BY_PROJECT_ID: (projectId: string | number) => `/service/offers/project/${projectId}`,
  OFFER_BY_ID: (id: string | number) => `/service/offers/${id}`,
  OFFER_LIST: `/service/offers`,
  PROJECT: (id: string | number) => `/service/projects/${id}`,
  PROJECT_LIST: `/service/projects`,
  RATE: (id: string | number) => `/service/rates/${id}`,
  RATES: '/service/rates',
  RATES_FORK: '/service/rates/fork',
  REGISTER: `${BASE_URL}/auth/register`,
  USER_CHANGE_GROUP: (userId: string | number) => `/service/users/${userId}/change-group`,
  USER_INFO: `${BASE_URL}/users/me`,
} as const;
