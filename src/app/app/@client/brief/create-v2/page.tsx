'use client';

import { AppRoute } from '@/constants/appRoute';
import { BriefEditorLayout } from '@/modules/client/BriefEditorV2/BriefEditorLayout';

export default function CreateBriefV2Page() {
  const handleBriefCreated = (briefId: string) => {
    if (typeof window !== 'undefined') {
      // Preserve component state (startText, pendingAttachments) by replacing
      // URL without remounting the React tree.
      window.history.replaceState(null, '', AppRoute.BRIEF_V2_DETAIL(briefId));
    }
  };

  return <BriefEditorLayout mode='authenticated' onBriefCreated={handleBriefCreated} />;
}
