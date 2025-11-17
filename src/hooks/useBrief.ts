import { useAppSelector } from '@/store/hooks';
import { projectsApi } from '@/services/client/projectsApi';
import { briefApi } from '@/services/client/briefApi';
import { selectIsNewBrief, selectProjectId } from '@/store/slices/project';

export const useBrief = () => {
  const isNew = useAppSelector(selectIsNewBrief);
  const projectId = useAppSelector(selectProjectId);

  // Load project first
  const { data: project } = projectsApi.useGetProjectByIdQuery(projectId!, {
    skip: isNew || !projectId,
  });

  // Then load brief if project has briefId
  const briefQuery = briefApi.useGetBriefQuery(project?.briefId ?? '', {
    skip: isNew || !project?.briefId,
  });

  return briefQuery;
};
