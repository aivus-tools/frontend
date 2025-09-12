const BASE_URL = `${process.env.API_URL}/api/v1`;

export const CALLBACK_URL = process.env.CALLBACK_URL ?? '';

// TODO приставку BASE_URL из некоторых роутов нужно будет из этого файла убрать
export const ApiRoute = {
  BRIEF: (id: string | number) => `/service/briefs/${id}`,
  BRIEF_LIST: `/service/briefs`,
  CATEGORY: (id: string | number) => `/service/categories/${id}`,
  CATEGORY_LIST: `/service/categories`,
  CHANGE_ROLE: (id: number | string) => `${BASE_URL}/auth/change-group/${id}`,
  CHECK_EMAIL: `${BASE_URL}/auth/check-email`,
  CONFIRM_EMAIL: (token: string) => `/service/auth/confirm-email?token=${token}`, // TODO проверить, нужен ли тут /service
  ENTRY: (id: string | number) => `/service/entries/${id}`,
  ENTRY_LIST: `/service/entries`,
  GET_USERS: `${BASE_URL}/users`,
  LOGIN: `${BASE_URL}/auth/login`,
  OFFERS_BY_BRIEF_ID: (briefId: string | number) => `/service/offers/brief/${briefId}`,
  OFFER_BY_ID: (id: string | number) => `/service/offers/${id}`,
  OFFER_LIST: `/service/offers`,
  RATE: (id: string | number) => `/service/rates/${id}`,
  RATES: '/service/rates',
  RATES_FORK: '/service/rates/fork',
  REGISTER: `${BASE_URL}/auth/register`,
  USER_CHANGE_GROUP: (userId: string | number) => `/service/users/${userId}/change-group`, // TODO проверить, нужен ли тут /service
  USER_INFO: `${BASE_URL}/users/me`,
} as const;
