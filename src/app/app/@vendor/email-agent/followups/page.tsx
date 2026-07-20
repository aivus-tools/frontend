'use client';

import { Alert } from 'antd';
import { t } from '@/lib/i18n';
import { DraftReviewList } from '@/modules/vendor/emailAgent/DraftReviewList/DraftReviewList';
import { FollowupDashboard } from '@/modules/vendor/emailAgent/FollowupDashboard/FollowupDashboard';

import styles from './page.module.css';

export default function Page() {
  return (
    <div className={styles.sections}>
      <Alert
        type='info'
        showIcon
        message={t('EMAIL_AGENT_FOLLOWUPS_INTRO_TITLE')}
        description={t('EMAIL_AGENT_FOLLOWUPS_INTRO_BODY')}
      />
      <DraftReviewList />
      <FollowupDashboard />
    </div>
  );
}
