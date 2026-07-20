'use client';

import { useRouter, useSelectedLayoutSegments } from 'next/navigation';
import { Segmented } from 'antd';
import { AppRoute } from '@/constants/appRoute';
import { t } from '@/lib/i18n';

import styles from './EmailAgentSubnav.module.css';

export type EmailAgentTab = 'feed' | 'followups' | 'settings';

const ROUTE_BY_TAB: Record<EmailAgentTab, string> = {
  feed: AppRoute.EMAIL_AGENT,
  followups: AppRoute.EMAIL_AGENT_FOLLOWUPS,
  settings: AppRoute.EMAIL_AGENT_SETTINGS,
};

const resolveActive = (segments: string[]): EmailAgentTab => {
  const first = segments[0];
  if (first === 'settings') {
    return 'settings';
  }
  if (first === 'followups') {
    return 'followups';
  }
  return 'feed';
};

export const EmailAgentSubnav = () => {
  const router = useRouter();
  const segments = useSelectedLayoutSegments();
  const active = resolveActive(segments);

  const options = [
    { value: 'feed', label: t('EMAIL_AGENT_TAB_FEED') },
    { value: 'followups', label: t('EMAIL_AGENT_TAB_FOLLOWUPS') },
    { value: 'settings', label: t('EMAIL_AGENT_TAB_SETTINGS') },
  ];

  const handleChange = (value: string | number) => {
    const route = ROUTE_BY_TAB[value as EmailAgentTab];
    if (route) {
      router.push(route);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Segmented block size='large' value={active} options={options} onChange={handleChange} />
    </div>
  );
};
