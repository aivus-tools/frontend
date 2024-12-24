export const routes = {
	GET_USERS: `${process.env.API_URL}/api/v1/users`,
	REGISTER: `${process.env.API_URL}/api/v1/auth/register`,
	LOGIN: `${process.env.API_URL}/api/v1/auth/login`,
	CHECK_EMAIL: `${process.env.API_URL}/api/v1/auth/check-email`,
	changeRole: (id: number | string) => `${process.env.API_URL}/api/v1/auth/change-role/${id}`,
};
