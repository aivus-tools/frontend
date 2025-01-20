const BASE_URL = `${process.env.API_URL}/api/v1`;

export const routes = {
	GET_USERS: `${BASE_URL}/users`,
	REGISTER: `${BASE_URL}/auth/register`,
	LOGIN: `${BASE_URL}/auth/login`,
	CHECK_EMAIL: `${BASE_URL}/auth/check-email`,
	changeRole: (id: number | string) => `${BASE_URL}/auth/change-role/${id}`,
	getUserByEmail: (email: string) => `${BASE_URL}/users/user?email=${email}`,
};
