import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { checkEmail, login, register } from './services/server/authService';
import logger from './lib/logger';
import { AUTH_TYPES } from './lib/constants';
import { Groups } from './types/user';

export const { handlers, signIn, signOut, auth } = NextAuth({
	debug: Boolean(process.env.DEBUG),
	providers: [
		Google,
		Credentials({
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {
				try {
					const user = await login({ ...credentials, authType: AUTH_TYPES.credentials });

					return {
						id: `${user.id}`,
						name: user.name,
						email: user.email,
						image: null,
					};
				} catch (error) {
					logger.error('authorize error', error);
					return null;
				}
			},
		}),
	],
	callbacks: {
		async signIn(all) {
			const { account, user } = all;
			if (account?.provider === 'google') {
				try {
					const { name, email } = user;
					const exist = await checkEmail({ email: email as string });
					if (exist) {
						const aivusUser = await login({ email: email, password: '', authType: AUTH_TYPES.google });
						user.group = aivusUser.group;
						user.id = `${aivusUser.id}`;

						return Promise.resolve(true);
					}
					if (!exist) {
						if (name && email) {
							const ok = await register({ name, email, authType: 'GOOGLE' });
							return Promise.resolve(ok);
						} else {
							logger.error('No name and email', user);
							return Promise.resolve('/auth');
						}
					}
					return Promise.resolve(true);
				} catch (error) {
					logger.error('signIn error', error);
					return Promise.resolve('/auth');
				}
			}
			return Promise.resolve(true);
		},
		async jwt({ token, user }) {
			if (user) {
				token.group = user.group;
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			session.user.group = token.group as Groups;
			session.user.id = token.id as string;
			logger.info('update session', session);
			return session;
		},
		authorized: async ({ auth }) => {
			return !!auth;
		},
	},
	logger: {
		error(error, ...message) {
			logger.error('NextAuth error', message, error);
		},
		warn(code, ...message) {
			logger.warn(code, message);
		},
		debug(code, ...message) {
			logger.debug(code, message);
		},
	},
});
