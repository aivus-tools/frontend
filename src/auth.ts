import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { routes } from './service-routes';
import { createSession } from './app/lib/session';
import { User } from './services/types';

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Google,
		Credentials({
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {
				const response = await fetch(routes.LOGIN, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(credentials),
				});

				const user = await response.json();
				return user;
			},
		}),
	],
	callbacks: {
		async signIn({ user }) {
			try {
				console.log('user', user);

				const response = await fetch(routes.GET_USERS);
				const users: User[] = await response.json();
				const userExist = users.find((u) => u.email === user.email);

				if (!userExist) {
					const res = await fetch(routes.REGISTER, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							email: user.email,
							password: '123',
							name: user.name,
						}),
					});

					if (res.ok) {
						const response = await fetch(routes.GET_USERS);
						const users: User[] = await response.json();
						const newUser = users.find((u) => u.email === user.email);
						if (newUser) {
							await createSession(newUser!.role, newUser!.id);
							return Promise.resolve(true);
						}
					}
				}

				if (userExist) {
					await createSession(userExist.role, userExist.id);
					return Promise.resolve(true);
				}

				return Promise.resolve(false);
			} catch (error) {
				console.error(error);
				return Promise.resolve(false);
			}
		},
	},
});
