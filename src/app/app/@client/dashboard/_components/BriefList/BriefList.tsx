'use client';

import React from 'react';
import cn from 'classnames';
import { Empty } from 'antd';
import { t } from '@/lib/i18n';
import { useGetBriefsQuery } from '@/services/client/briefApi';
import { Brief } from '@/types/brief.interface';
import { THeadItem } from '@/components/THeadItem/THeadItem';
import Spinner from '@/components/Spinner';
import { BriefCard } from '../BriefCard/BriefCard';

import styles from './BriefList.module.css';

const clientDashboardTHeads = [
  { text: t('PROJECT'), showIcon: true },
  { text: t('ACTIVITY') },
  { text: t('DASHBOARD_STATUS') },
  { text: t('NUM_PROPOSALS') },
  { text: t('BEST_OFFER'), className: 'alignRight' },
  { text: t('AVERAGE_OFFER_COST'), className: 'alignRight' },
  { text: t('CREATED') },
];

export const BriefList = () => {
  const { data: briefs = [], isLoading } = useGetBriefsQuery();

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
              [styles.alignRight]: item.className === 'alignRight',
            })}
            text={item.text}
            showIcon={item.showIcon}
          />
        ))}
      </div>
      <div className={styles.content}>
        {briefs.map((brief: Brief) => (
          <BriefCard key={brief.id} brief={brief} />
        ))}
      </div>
    </div>
  );
};
