'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { BriefEditorLayout } from '@/modules/client/BriefEditorV2/BriefEditorLayout';

export default function BriefV3DetailPage() {
  const params = useParams();
  const briefId = params.briefId as string;

  return <BriefEditorLayout mode='authenticated' briefId={briefId} />;
}
