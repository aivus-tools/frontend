'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Estimation } from '@/modules/vendor/estimation/Estimation';
import { useGetTemplateQuery } from '@/services/client/templatesApi';
import { useAppDispatch } from '@/store/hooks';
import { setOfferDetails, setMetaData, setTemplateId } from '@/store/slices/offer/slice';
import { OfferDetails } from '@/types/store.interface';
import { PageSpinner } from '@/components/PageSpinner';

export default function TemplateEditPage() {
  const params = useParams();
  const templateId = params.templateId as string;
  const dispatch = useAppDispatch();
  const { data: template, isLoading } = useGetTemplateQuery(templateId);

  // Load template data into Redux
  useEffect(() => {
    if (template?.details) {
      const details: OfferDetails =
        typeof template.details === 'string' ? JSON.parse(template.details) : (template.details as OfferDetails);

      dispatch(setOfferDetails(details));

      // Set template mode so listener saves to template API
      dispatch(setTemplateId(templateId));

      // Set minimal metaData so the UI works (Estimation reads metaData for certain checks)
      dispatch(
        setMetaData({
          id: template.id,
          uuid: template.uuid,
          projectName: template.name,
          projectId: null,
          status: 'DRAFT',
          cost: template.cost ?? null,
          profit: template.profit ?? null,
          deadline: '',
          source: 'PLATFORM',
          isLocked: false,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt ?? '',
        })
      );
    }

    // Cleanup: reset template mode when leaving
    return () => {
      dispatch(setTemplateId(null));
    };
  }, [template, templateId, dispatch]);

  if (isLoading) {
    return <PageSpinner />;
  }

  // Render Estimation component (NOT in external mode — we want real categories from API)
  return <Estimation />;
}
