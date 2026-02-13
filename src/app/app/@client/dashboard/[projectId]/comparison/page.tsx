'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ComparisonTable } from '@/modules/client/ComparisonTable/ComparisonTable';

export default function ComparisonPage() {
  const params = useParams();
  const briefId = params.projectId as string;

  return <ComparisonTable briefId={briefId} />;
}
