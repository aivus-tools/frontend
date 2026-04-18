'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Empty, Spin } from 'antd';
import { useGetBriefAiShareViewQuery } from '@/services/client/briefAiApi';
import { BriefSharedView } from '@/modules/client/BriefEditorV2/BriefSharedView';
import { t } from '@/lib/i18n';

export default function SharedBriefPage() {
  const params = useParams();
  const token = params.token as string;
  const { data, isLoading, isError } = useGetBriefAiShareViewQuery(token);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size='large' />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description={t('SHARED_BRIEF_NOT_FOUND')} />
      </div>
    );
  }

  return <BriefSharedView data={data} />;
}
