'use client';

import { EmailAgentSubnav } from '@/modules/vendor/emailAgent/EmailAgentSubnav/EmailAgentSubnav';
import { ThreadFeed } from '@/modules/vendor/emailAgent/ThreadFeed/ThreadFeed';

export default function Page() {
  return (
    <>
      <EmailAgentSubnav active='feed' />
      <ThreadFeed />
    </>
  );
}
