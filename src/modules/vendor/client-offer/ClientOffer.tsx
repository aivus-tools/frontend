'use client';

import React, { useState, useEffect } from 'react';
import { t } from '@/lib/i18n';
import { GuidanceProvider } from '@/context/GuidanceProvider';
import { useAppSelector } from '@/store/hooks';
import { selectOfferDetails, selectOfferMetaData } from '@/store/slices/offer/selectors';
import { selectProjectId } from '@/store/slices/project';
import { useGetOffersByProjectIdQuery } from '@/services/client/offersApi';
import { useOfferSync } from '@/hooks/useOfferSync';
import { ClientOfferTable } from './ClientOfferTable';
import { Guidance } from './components/Guidance';
import { Wrapper, Column } from './components/styled';

export function ClientOffer() {
  const [isMounted, setIsMounted] = useState(false);
  const projectId = useAppSelector(selectProjectId);
  const offerDetails = useAppSelector(selectOfferDetails);
  const metaData = useAppSelector(selectOfferMetaData);

  useOfferSync();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasOfferData = metaData !== null || offerDetails.offers.length > 0;

  const { isLoading } = useGetOffersByProjectIdQuery(projectId!, {
    skip: !isMounted || !projectId || projectId === 'new-brief' || hasOfferData,
  });

  const showLoading = isMounted && isLoading;

  return (
    <GuidanceProvider>
      <Wrapper>
        {showLoading ? (
          <div>{t('LOADING')}</div>
        ) : (
          <>
            <Column style={{ flex: '1 1 70%' }}>
              <ClientOfferTable offers={offerDetails.offers} />
            </Column>
            <Column style={{ flex: '1 1 30%', justifyContent: 'space-between' }}>
              <Guidance />
            </Column>
          </>
        )}
      </Wrapper>
    </GuidanceProvider>
  );
}

