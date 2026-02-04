'use client';

import React from 'react';
import { GuidanceProvider } from '@/context/GuidanceProvider';
import { useAppSelector } from '@/store/hooks';
import { selectOfferDetails, selectOfferMetaData } from '@/store/slices/offer/selectors';
import { selectProjectId } from '@/store/slices/project';
import { useGetOffersByProjectIdQuery } from '@/services/client/offersApi';
import { ClientOfferTable } from './ClientOfferTable';
import { Guidance } from './components/Guidance';
import { Wrapper, Column } from './components/styled';

export function ClientOffer() {
  const projectId = useAppSelector(selectProjectId);
  const offerDetails = useAppSelector(selectOfferDetails);
  const metaData = useAppSelector(selectOfferMetaData);

  const hasOfferData = metaData !== null || offerDetails.offers.length > 0;

  const { isLoading } = useGetOffersByProjectIdQuery(projectId!, {
    skip: !projectId || projectId === 'new-brief' || hasOfferData,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <GuidanceProvider>
      <Wrapper>
        <Column style={{ flex: '1 1 70%' }}>
          <ClientOfferTable offers={offerDetails.offers} />
        </Column>
        <Column style={{ flex: '1 1 30%', justifyContent: 'space-between' }}>
          <Guidance />
        </Column>
      </Wrapper>
    </GuidanceProvider>
  );
}

