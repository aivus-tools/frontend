const BASE_URL = `${process.env.API_URL}/api/v1`;

export const CALLBACK_URL = process.env.CALLBACK_URL;

export const ApiRoute = {
  GET_USERS: `${BASE_URL}/users`,
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  CHECK_EMAIL: `${BASE_URL}/auth/check-email`,
  USER_INFO: `${BASE_URL}/users/me`,
  changeRole: (id: number | string) => `${BASE_URL}/auth/change-group/${id}`,
};
