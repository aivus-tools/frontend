'use client';

import React from 'react';
import cn from 'classnames';
import { Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';
import { useGetBriefAiListQuery } from '@/services/client/briefAiApi';
import { THeadItem } from '@/components/THeadItem/THeadItem';
import Spinner from '@/components/Spinner';
import { BriefCard } from '../BriefCard/BriefCard';

import styles from './BriefList.module.css';

export const BriefList = () => {
  const router = useRouter();
  const { data: briefs = [], isLoading } = useGetBriefAiListQuery();

  const clientDashboardTHeads = [
    { text: t('PROJECT'), showIcon: true },
    { text: t('DASHBOARD_STATUS') },
    { text: t('BRIEF_LIST_MESSAGES') },
    { text: t('BRIEF_LIST_OFFERS') },
    { text: t('CREATED') },
    { text: '' },
  ];

  if (isLoading) {
    return <Spinner />;
  }

  if (!briefs.length) {
    return (
      <div className={styles.dashboard}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            color: '#78829d',
          }}
        >
          <InboxOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }} />
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{t('NO_BRIEFS')}</div>
          <Button
            type='primary'
            style={{ marginTop: 16, background: '#FD8258', borderColor: '#FD8258' }}
            onClick={() => router.push('/app/brief/create-v2')}
          >
            {t('CREATE_A_BRIEF')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={cn(styles.grid, styles.header)}>
        {clientDashboardTHeads.map((item, index) => (
          <THeadItem
            key={`thead_${index}`}
            className={cn({
              [styles.alignRight]: false,
            })}
            text={item.text}
            showIcon={item.showIcon}
          />
        ))}
      </div>
      <div className={styles.content}>
        {briefs.map((brief) => (
          <BriefCard key={brief.id} brief={brief} />
        ))}
      </div>
    </div>
  );
};
