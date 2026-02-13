import { Estimation } from '@/modules/vendor/estimation/Estimation';
import { OfferTabs } from '@/modules/OfferTabs/OfferTabs';
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <OfferTabs />
      </Suspense>
      <Estimation />
    </>
  );
}
