import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { checkEmail, login, register } from '@/services/server/authService';
import logger from '@/lib/logger';
import { AUTH_TYPES, GROUPS } from '@/constants/constants';
import { updateUserSession } from '@/services/server/userService';
import type { Groups } from '@/types/user.interface';

// Get environment variables for Google OAuth
const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

// Create providers array
const providers = [];

// Add Google provider
if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

// Add Credentials provider
providers.push(
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
          vendorId: user.vendorId,
          image: null,
        };
      } catch (error) {
        logger.error('authorize error', error);
        return null;
      }
    },
  })
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: Boolean(process.env.DEBUG),
  providers,
  session: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  callbacks: {
    async signIn(all) {
      const { account, user } = all;
      if (account?.provider === 'google') {
        try {
          const { name, email } = user;
          if (!email) {
            logger.error('Google signIn: No email from Google', user);
            return false;
          }

          logger.info('Google signIn: checking email', { email });
          const result = await checkEmail({ email: email as string });
          logger.info('Google signIn: checkEmail result', result);

          if (result.exists) {
            // User exists - log in via Google
            logger.info('Google signIn: user exists, logging in');
            const aivusUser = await login({ email: email, password: '', authType: AUTH_TYPES.google });
            logger.info('Google signIn: login result', aivusUser);
            user.group = aivusUser.group;
            user.id = `${aivusUser.id}`;
            user.vendorId = aivusUser.vendorId;
            user.clientId = aivusUser.clientId;
            return true;
          }

          // User does not exist - register them
          if (name && email) {
            logger.info('Google signIn: user does not exist, registering', { name, email });
            const aivusUser = await register({ name, email, authType: AUTH_TYPES.google, password: '' });
            logger.info('Google signIn: register result', aivusUser);
            user.group = aivusUser.group ?? GROUPS.confirmed;
            user.id = `${aivusUser.id}`;
            user.vendorId = aivusUser.vendorId;
            user.clientId = aivusUser.clientId;
            return true;
          }

          logger.error('Google signIn: No name and email from Google', user);
          return false;
        } catch (error) {
          logger.error('Google signIn error', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // On first sign-in (when user object is present), save data to token
      if (user) {
        token.group = user.group;
        token.id = user.id;
        token.vendorId = user.vendorId;
        token.clientId = user.clientId;
      }

      // If update() was called with data - use it immediately (takes priority)
      if (trigger === 'update' && session?.user) {
        if (session.user.group) token.group = session.user.group;
        if (session.user.vendorId) token.vendorId = session.user.vendorId;
        if (session.user.clientId) token.clientId = session.user.clientId;
        if (session.user.name) token.name = session.user.name;
        return token;
      }

      // Otherwise update token from API only on explicit update() call
      if (token.id && trigger === 'update') {
        try {
          const aivusUser = await updateUserSession({
            userId: token.id as string,
            userGroup: (token.group as string) || GROUPS.unconfirmed,
          });
          token.group = aivusUser.group;
          token.vendorId = aivusUser.vendorId;
          token.clientId = aivusUser.clientId;
        } catch (error) {
          logger.warn('Failed to update JWT from API, keeping existing token data', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Simply copy data from token to session
      session.user.group = token.group as Groups;
      session.user.id = (token.id as string) || (token.sub as string);
      session.user.vendorId = token.vendorId as string | undefined;
      session.user.clientId = token.clientId as string | undefined;
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
