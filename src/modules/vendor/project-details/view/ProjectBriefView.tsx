'use client';

import { useParams } from 'next/navigation';
import { Empty } from 'antd';
import { projectsApi, useGetVendorProjectBriefDocumentsQuery } from '@/services/client/projectsApi';
import { NEW_BRIEF_SLUG } from '@/constants/constants';
import { ApiRoute } from '@/constants/apiRoute';
import { PageSpinner } from '@/components/PageSpinner';
import { t } from '@/lib/i18n';
import { BriefSharedView } from '@/modules/client/BriefEditor/BriefSharedView';
import { BriefShareView } from '@/types/briefAi.interface';

export default function ProjectBriefView() {
  const params = useParams();
  const projectId = params.projectId as string | undefined;

  const { data: project, isLoading } = projectsApi.useGetProjectByIdQuery(projectId ?? '', {
    skip: !projectId || projectId === NEW_BRIEF_SLUG,
    refetchOnMountOrArgChange: true,
  });

  const { data: briefDocuments, isLoading: isDocsLoading } = useGetVendorProjectBriefDocumentsQuery(projectId ?? '', {
    skip: !projectId || projectId === NEW_BRIEF_SLUG || !project?.briefId,
  });

  if (isLoading || isDocsLoading) {
    return <PageSpinner />;
  }

  if (!project?.briefId || !briefDocuments?.length) {
    return <Empty description={t('BRIEF_V3_DOCUMENT_MISSING')} />;
  }

  const data: BriefShareView = {
    token: '',
    briefId: project.briefId,
    title: project.name,
    documentLanguage: '',
    conversationStatus: 'finalized',
    documents: briefDocuments,
    createdAt: null,
  };

  return (
    <BriefSharedView
      data={data}
      getPdfUrl={(docId) => ApiRoute.VENDOR_PROJECT_BRIEF_DOCUMENT_PDF(projectId as string, docId)}
    />
  );
}
