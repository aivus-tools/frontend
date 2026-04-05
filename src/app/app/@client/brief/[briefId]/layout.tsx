'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { BriefTabBar } from '@/modules/client/BriefEditorV2/BriefTabBar';

export default function BriefDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const briefId = params.briefId as string;

  return (
    <>
      <BriefTabBar briefId={briefId} />
      {children}
    </>
  );
}
