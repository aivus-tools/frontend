'use client';

import React, { use } from 'react';
import { ComparisonTable } from '@/modules/client/ComparisonTable/ComparisonTable';

interface BriefComparisonPageProps {
  params: Promise<{ briefId: string }>;
}

export default function BriefComparisonPage(props: BriefComparisonPageProps) {
  const { briefId } = use(props.params);
  return <ComparisonTable briefId={briefId} />;
}
