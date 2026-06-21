import { useEffect, useState } from 'react';
import { PUBLIC_APP_URL } from '@/constants/constants';

export const usePublicAppOrigin = (): string => {
  const [origin, setOrigin] = useState<string>(PUBLIC_APP_URL);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  return origin;
};
