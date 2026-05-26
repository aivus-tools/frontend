'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BriefEditorLayout } from '@/modules/client/BriefEditor/BriefEditorLayout';
import { AppRoute } from '@/constants/appRoute';

const RESERVED_BRIEF_SEGMENTS = new Set(['create', 'create-v2', 'claim']);

export default function BriefV3DetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const briefId = params.briefId as string;
  const isReserved = RESERVED_BRIEF_SEGMENTS.has(briefId);
  const finalizingTaskId = searchParams.get('finalizingTask');

  useEffect(() => {
    if (isReserved) {
      router.replace(AppRoute.CREATE_BRIEF);
    }
  }, [isReserved, router]);

  if (isReserved) {
    return null;
  }

  return <BriefEditorLayout mode='authenticated' briefId={briefId} initialFinalizingTaskId={finalizingTaskId} />;
}
