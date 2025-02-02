import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { checkEmail, login, register } from './services/authService';
import { fetchUserByEmail } from './services/userService';
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
			authorize: login,
		}),
	],
	callbacks: {
		async signIn({ user }) {
			try {
				const { name, email } = user;
				const exist = await checkEmail({ email: user.email as string });
				if (!exist) {
					if (name && email) {
						const ok = await register({ name, email, authType: 'GOOGLE' });
						return Promise.resolve(ok);
					} else {
						console.error('No name and email', user);
						return Promise.resolve(false);
					}
				}
				return Promise.resolve(true);
			} catch (error) {
				console.error(error);
				return Promise.resolve(false);
			}
		},
		async session({ session }) {
			const aivusUser = await fetchUserByEmail(session.user.email);
			session.user.role = aivusUser.role;
			session.user.id = aivusUser.id;
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
