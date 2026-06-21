'use client';

import { useParams } from 'next/navigation';
import { BrandedBriefWorkspace } from '@/modules/client/BriefEditor/BrandedBriefWorkspace';

export default function BrandedBriefDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const briefId = params.briefId as string;

  return <BrandedBriefWorkspace slug={slug} initialBriefId={briefId} />;
}
