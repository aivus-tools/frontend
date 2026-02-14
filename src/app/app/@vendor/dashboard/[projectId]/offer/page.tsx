import { ClientOffer } from '@/modules/vendor/client-offer';
import { OfferTabs } from '@/modules/OfferTabs/OfferTabs';
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <OfferTabs />
      </Suspense>
      <ClientOffer />
    </>
  );
}
