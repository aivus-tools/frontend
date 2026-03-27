'use client';
import { useEffect } from 'react';
import logger from '@/lib/logger';

export const VersionLogger = ({ creationDate }: { creationDate?: string }) => {
  useEffect(() => {
    logger.log('Build date', creationDate);
  }, [creationDate]);
  return null;
};
