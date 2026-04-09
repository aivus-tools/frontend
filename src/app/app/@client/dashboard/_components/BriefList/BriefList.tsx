'use client';

import React from 'react';
import cn from 'classnames';
import { Empty } from 'antd';
import { t } from '@/lib/i18n';
import { useGetBriefAiListQuery } from '@/services/client/briefAiApi';
import { THeadItem } from '@/components/THeadItem/THeadItem';
import Spinner from '@/components/Spinner';
import { BriefCard } from '../BriefCard/BriefCard';

import styles from './BriefList.module.css';

const clientDashboardTHeads = [
  { text: t('PROJECT'), showIcon: true },
  { text: t('DASHBOARD_STATUS') },
  { text: t('BRIEF_LIST_MESSAGES') },
  { text: t('BRIEF_LIST_VERSION') },
  { text: t('BRIEF_LIST_OFFERS') },
  { text: t('BRIEF_LIST_SHARE_STATUS') },
  { text: t('CREATED') },
  { text: '' },
];

export const BriefList = () => {
  const { data: briefs = [], isLoading } = useGetBriefAiListQuery();

  if (isLoading) {
    return <Spinner />;
  }

  if (!briefs.length) {
    return (
      <div className={styles.dashboard}>
        <Empty description={t('NO_BRIEFS')} />
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
