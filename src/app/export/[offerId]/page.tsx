'use client';

import { useParams } from 'next/navigation';
import { ExportPage } from '@/modules/vendor/export/ExportPage';

export default function OfferExportPage() {
  const params = useParams<{ offerId: string }>();
  return <ExportPage offerId={params.offerId} />;
}
