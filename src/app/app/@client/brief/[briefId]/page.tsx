'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetBriefAiDetailQuery } from '@/services/client/briefAiApi';
import Spinner from '@/components/Spinner';
import { BriefEditorLayout } from '@/modules/client/BriefEditorV2/BriefEditorLayout';
import { BriefReadOnlyView } from '@/modules/client/BriefEditorV2/BriefReadOnlyView';

export default function BriefV2DetailPage() {
  const params = useParams();
  const briefId = params.briefId as string;
  const { data: brief, isLoading } = useGetBriefAiDetailQuery(briefId);

  if (isLoading) {
    return <Spinner />;
  }
  if (!brief) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#99a1b7' }}>Brief not found</div>;
  }

  if (brief.status === 'COMPLETED') {
    return <BriefReadOnlyView brief={brief} />;
  }

  return <BriefEditorLayout briefId={briefId} />;
}
