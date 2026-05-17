'use client';

import { AppRoute } from '@/constants/appRoute';
import { BriefEditorLayout } from '@/modules/client/BriefEditor/BriefEditorLayout';

export default function CreateBriefPage() {
  const handleBriefCreated = (briefId: string) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', AppRoute.BRIEF_DETAIL(briefId));
    }
  };

  return <BriefEditorLayout mode='authenticated' onBriefCreated={handleBriefCreated} />;
}
