import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { checkEmail, login, register } from './services/server/authService';
import { fetchUserByEmail } from './services/server/userService';
import logger from './lib/logger';

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
					const user = await login(credentials);

					return {
						id: `${user.id}`,
						name: user.name,
						email: user.email,
						image: null,
						accessToken: user.accessToken,
					};
				} catch (error) {
					logger.error('authorize error', error);
					return null;
				}
			},
		}),
	],
	callbacks: {
		async signIn({ account, user }) {
			if (account?.provider === 'google') {
				try {
					const { name, email } = user;
					const exist = await checkEmail({ email: user.email as string });
					if (!exist) {
						if (name && email) {
							const ok = await register({ name, email, authType: 'GOOGLE' });
							return Promise.resolve(ok);
						} else {
							logger.error('No name and email', user);
							return Promise.resolve(false);
						}
					}
					return Promise.resolve(true);
				} catch (error) {
					logger.error('signIn error', error);
					return Promise.resolve(false);
				}
			}
			return Promise.resolve(true);
		},
		async session({ session, token }) {
			session.user.accessToken = token.accessToken as string;
			const aivusUser = await fetchUserByEmail(session.user.email);
			session.user.role = aivusUser.group;
			session.user.id = `${aivusUser.id}`;
			logger.info('update session', session);
			return session;
		},
		authorized: async ({ auth }) => {
			return !!auth;
		},
		async jwt({ token, user }) {
			if (user) {
				token.accessToken = user.accessToken;
			}
			return token;
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
