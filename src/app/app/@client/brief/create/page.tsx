'use client';

import { AppRoute } from '@/constants/appRoute';
import { AuthenticatedBriefEditor } from '@/modules/client/BriefEditor/AuthenticatedBriefEditor';

export default function CreateBriefPage() {
  const handleBriefCreated = (briefId: string) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', AppRoute.BRIEF_DETAIL(briefId));
    }
  };

  return <AuthenticatedBriefEditor onBriefCreated={handleBriefCreated} />;
}
