'use client';

import { useParams } from 'next/navigation';
import { ThreadActivityView } from '@/modules/vendor/emailAgent/ThreadActivityView/ThreadActivityView';

export default function Page() {
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId;

  if (!threadId) {
    return null;
  }

  return <ThreadActivityView threadId={threadId} />;
}
