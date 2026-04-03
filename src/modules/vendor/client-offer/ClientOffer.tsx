'use client';

import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { GuidanceProvider } from '@/context/GuidanceProvider';
import { useAppSelector } from '@/store/hooks';
import { selectOfferDetails, selectOfferMetaData } from '@/store/slices/offer/selectors';
import { selectProjectId } from '@/store/slices/project';
import { useGetOffersByProjectIdQuery, useGetOfferExportDataQuery } from '@/services/client/offersApi';
import { useOfferSync } from '@/hooks/useOfferSync';
import { CoverPage } from '@/modules/vendor/export/CoverPage';
import { TopSheet } from '@/modules/vendor/export/TopSheet';
import { AssumptionsPage } from '@/modules/vendor/export/AssumptionsPage';
import { BudgetDetail } from '@/modules/vendor/export/BudgetDetail';
// import { Guidance } from './components/Guidance';
import { Wrapper, Column } from './components/styled';

export function ClientOffer() {
  const [isMounted, setIsMounted] = useState(false);
  const projectId = useAppSelector(selectProjectId);
  const offerDetails = useAppSelector(selectOfferDetails);
  const metaData = useAppSelector(selectOfferMetaData);
  const offerId = metaData?.id;

  useOfferSync();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasOfferData = metaData !== null || offerDetails.offers.length > 0;

  const { isLoading: isLoadingOffers } = useGetOffersByProjectIdQuery(projectId!, {
    skip: !isMounted || !projectId || projectId === 'new-brief' || hasOfferData,
  });

  const { data: exportData, isLoading: isLoadingExport } = useGetOfferExportDataQuery(offerId!, {
    skip: !offerId,
  });

  const showLoading = isMounted && (isLoadingOffers || isLoadingExport);

  return (
    <GuidanceProvider>
      <Wrapper>
        {showLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spin size='large' />
          </div>
        ) : exportData ? (
          <Column style={{ flex: '1 1 100%' }}>
            <div style={{ maxWidth: 1340, margin: '0 auto' }}>
              <CoverPage data={exportData} />
              <TopSheet data={exportData} />
              {!!exportData.offer.assumptionsExclusions && <AssumptionsPage data={exportData} />}
              <BudgetDetail data={exportData} />
            </div>
          </Column>
        ) : (
          <Column style={{ flex: '1 1 100%' }}>
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#99A1B7' }}>No offer data available</div>
          </Column>
        )}
      </Wrapper>
    </GuidanceProvider>
  );
}
