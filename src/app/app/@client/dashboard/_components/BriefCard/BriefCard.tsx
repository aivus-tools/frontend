'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Brief } from '@/types/brief.interface';
import { PrStatus } from '@/components/PrStatus/PrStatus';
import { formatPrice } from '@/helpers/helper';
import { format } from 'date-fns';
import { t } from '@/lib/i18n';
import { PROJECT_STATUS } from '@/constants/constants';

import styles from './BriefCard.module.css';

interface BriefCardProps {
  brief: Brief;
}

const getAccentColor = (status?: string): string => {
  switch (status) {
    case PROJECT_STATUS.RFP:
      return '#2288FF';
    case PROJECT_STATUS.REVIEWING:
      return '#FD8258';
    case PROJECT_STATUS.ONGOING:
      return '#A5C500';
    case PROJECT_STATUS.COMPLETED:
      return '#A5C500';
    default:
      return '#99A1B7';
  }
};

const getRowBg = (status?: string): string => {
  switch (status) {
    case PROJECT_STATUS.RFP:
      return '#F4FBFF';
    case PROJECT_STATUS.ONGOING:
    case PROJECT_STATUS.COMPLETED:
      return '#FCFFF0';
    default:
      return '#FFFFFF';
  }
};

export const BriefCard: React.FC<BriefCardProps> = ({ brief }) => {
  const router = useRouter();

  const projectName = brief.details?.projectName || t('UNTITLED_BRIEF');
  const formattedCreated = brief.createdAt
    ? format(new Date(brief.createdAt), 'MMM dd, yyyy')
    : '';

  const handleClick = () => {
    router.push(`/app/dashboard/${brief.id}`);
  };

  return (
    <div
      className={styles.card}
      style={{ backgroundColor: getRowBg(brief.status) }}
      onClick={handleClick}
    >
      <div className={styles.row}>
        {/* Project name */}
        <div className={styles.projectCell}>
          <div
            className={styles.accent}
            style={{ backgroundColor: getAccentColor(brief.status) }}
          />
          <div>
            <div className={styles.projectName}>{projectName.toUpperCase()}</div>
            <div className={styles.assignee}>
              {brief.clientId ? t('ASSIGNED_TO', 'me') : ''}
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className={styles.activityCell}>
          <div className={styles.activityText}>
            {brief.details?.description || ''}
          </div>
        </div>

        {/* Status */}
        <div className={styles.statusCell}>
          <PrStatus status={brief.status} />
        </div>

        {/* # of Proposals */}
        <div className={styles.proposalsCell}>
          <span className={styles.proposalCount}>{t('N_A')}</span>
        </div>

        {/* Best Offer */}
        <div className={styles.offerCell}>
          <div className={styles.offerValue}>
            {brief.details?.budget ? `$ ${formatPrice(brief.details.budget)}` : t('N_A')}
          </div>
        </div>

        {/* Average Offer Cost */}
        <div className={styles.offerCell}>
          <div className={styles.offerValue}>{t('N_A')}</div>
        </div>

        {/* Created */}
        <div className={styles.dateCell}>
          <div className={styles.dateValue}>{formattedCreated}</div>
        </div>
      </div>
    </div>
  );
};
