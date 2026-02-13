'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Brief } from '@/types/brief.interface';
import { PrStatus } from '@/components/PrStatus/PrStatus';
import { formatPrice } from '@/helpers/helper';
import { format } from 'date-fns';
import { t } from '@/lib/i18n';

import styles from './BriefCard.module.css';

interface BriefCardProps {
  brief: Brief;
}

const getAccentColor = (status?: string): string => {
  switch (status) {
    case 'RFP':
      return '#2288FF';
    case 'Reviewing':
      return '#FD8258';
    case 'Ongoing':
      return '#A5C500';
    case 'Completed':
      return '#A5C500';
    default:
      return '#99A1B7';
  }
};

const getRowBg = (status?: string): string => {
  switch (status) {
    case 'RFP':
      return '#F4FBFF';
    case 'Ongoing':
    case 'Completed':
      return '#FCFFF0';
    default:
      return '#FFFFFF';
  }
};

export const BriefCard: React.FC<BriefCardProps> = ({ brief }) => {
  const router = useRouter();

  const projectName = brief.details?.projectName || 'Untitled Brief';
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
          <span className={styles.proposalCount}>0</span>
        </div>

        {/* Best Offer */}
        <div className={styles.offerCell}>
          <div className={styles.offerValue}>
            {brief.details?.budget ? `$ ${formatPrice(brief.details.budget)}` : '--'}
          </div>
        </div>

        {/* Average Offer Cost */}
        <div className={styles.offerCell}>
          <div className={styles.offerValue}>--</div>
        </div>

        {/* Created */}
        <div className={styles.dateCell}>
          <div className={styles.dateValue}>{formattedCreated}</div>
        </div>
      </div>
    </div>
  );
};
