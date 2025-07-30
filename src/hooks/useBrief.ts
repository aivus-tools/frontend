import { useAppSelector } from '@/lib/hooks';
import { briefApi } from '@/services/client/briefApi';
import { selectIsNewBrief, selectProjectId } from '@/store/slices/project';

export const useBrief = () => {
  const isNew = useAppSelector(selectIsNewBrief);
  const projectId = useAppSelector(selectProjectId);
  return briefApi.useGetBriefQuery(projectId!, { skip: isNew || !projectId });
};
