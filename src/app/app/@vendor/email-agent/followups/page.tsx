'use client';

import { EmailAgentSubnav } from '@/modules/vendor/emailAgent/EmailAgentSubnav/EmailAgentSubnav';
import { DraftReviewList } from '@/modules/vendor/emailAgent/DraftReviewList/DraftReviewList';
import { FollowupDashboard } from '@/modules/vendor/emailAgent/FollowupDashboard/FollowupDashboard';

import styles from './page.module.css';

export default function Page() {
  return (
    <>
      <EmailAgentSubnav active='followups' />
      <div className={styles.sections}>
        <DraftReviewList />
        <FollowupDashboard />
      </div>
    </>
  );
}
