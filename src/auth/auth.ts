import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { checkEmail, login, register } from '@/services/server/authService';
import logger from '@/lib/logger';
import { AUTH_TYPES, GROUPS } from '@/constants/constants';
import { updateUserSession } from '@/services/server/userService';
import { AppRoute } from '@/constants/appRoute';

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
            group: user.group,
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
          const result = await checkEmail({ email: email as string });
          if (result.exists) {
            if (result.authType === AUTH_TYPES.credentials) {
              return Promise.resolve('/auth?type=' + AUTH_TYPES.credentials);
            }

            const aivusUser = await login({ email: email, password: '', authType: AUTH_TYPES.google });
            user.group = aivusUser.group;
            user.id = `${aivusUser.id}`;

            return Promise.resolve(true);
          }
          if (!result.exists) {
            if (name && email) {
              const aivusUser = await register({ name, email, authType: AUTH_TYPES.google, password: '' });
              user.group = aivusUser.group ?? GROUPS.unconfirmed;
              user.id = `${aivusUser.id}`;
              return Promise.resolve(true);
            } else {
              logger.error('No name and email', user);
              return Promise.resolve(AppRoute.AUTH);
            }
          }
          return Promise.resolve(true);
        } catch (error) {
          logger.error('signIn error', error);
          return Promise.resolve(AppRoute.AUTH);
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
      const aivusUser = await updateUserSession({
        userId: token.id as string,
      });
      session.user.group = aivusUser.group;
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
