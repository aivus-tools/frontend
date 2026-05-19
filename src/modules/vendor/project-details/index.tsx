'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectMode } from '@/store/slices/project';
import dynamic from 'next/dynamic';
import ViewProjectDetails from './view/Details';
import { PageSpinner } from '@/components/PageSpinner';
import i18n from 'i18n-iso-countries';
import { getLocale } from '@/lib/i18n';

const FormProjectDetails = dynamic(() => import('./form/Details'), { ssr: false, loading: () => <PageSpinner /> });

export default function Page() {
  const mode = useAppSelector(selectMode);
  const [isClient, setIsClient] = useState(false);

  // Register locale and set isClient only on the client side
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    i18n.registerLocale(require(`i18n-iso-countries/langs/${getLocale()}.json`));
    setIsClient(true);
  }, []);

  // While component is not mounted on client - show placeholder (e.g., <PageSpinner />)
  if (!isClient) return <PageSpinner />;

  return mode === 'edit' ? <FormProjectDetails /> : <ViewProjectDetails />;
}
