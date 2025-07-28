import logger from '@/lib/logger';
import { revalidateTag } from 'next/cache';

export const invalidateUserCache = () => {
  logger.info('Invalidating user cache');
  revalidateTag('user-email');
};
