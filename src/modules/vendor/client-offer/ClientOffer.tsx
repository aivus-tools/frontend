'use client';

import React from 'react';
import { GuidanceProvider } from '@/context/GuidanceProvider';
import { useAppSelector } from '@/store/hooks';
import { selectOfferDetails } from '@/store/slices/offer/selectors';
import { ClientOfferTable } from './ClientOfferTable';
import { Guidance } from './components/Guidance';
import { Wrapper, Column } from './components/styled';

export function ClientOffer() {
  const offerDetails = useAppSelector(selectOfferDetails);

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

