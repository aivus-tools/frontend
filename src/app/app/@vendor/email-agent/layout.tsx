'use client';

import { PropsWithChildren } from 'react';
import { EmailAgentSubnav } from '@/modules/vendor/emailAgent/EmailAgentSubnav/EmailAgentSubnav';

import styles from './layout.module.css';

export default function EmailAgentLayout(props: PropsWithChildren) {
  return (
    <div className={styles.section}>
      <EmailAgentSubnav />
      <div className={styles.content}>{props.children}</div>
    </div>
  );
}
