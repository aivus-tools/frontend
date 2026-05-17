'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { resolveAppTitle } from '@/app/app/_metadata';

const TITLE_SUFFIX = ' | Aivus';

export const PageTitleSync = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const title = resolveAppTitle(pathname ?? '');
    document.title = title === 'Aivus' ? title : `${title}${TITLE_SUFFIX}`;
  }, [pathname]);

  return null;
};
