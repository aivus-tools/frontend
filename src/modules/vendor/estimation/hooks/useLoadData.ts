import { useAppSelector } from '@/store/hooks';
import { categoriesApi } from '@/services/client/categoriesApi';
import { offersApi } from '@/services/client/offersApi';

export const useLoadData = (external?: boolean) => {
  const projectId = useAppSelector((state) => state.project.projectId);

  const categoriesQuery = categoriesApi.useGetCategoriesQuery(undefined, { skip: external });
  const entriesQuery = categoriesApi.useGetEntriesFullQuery(undefined, { skip: external });
  // Changed from getOffersByBriefId to getOffersByProjectId
  offersApi.useGetOffersByProjectIdQuery(projectId!, {
    skip: !projectId || projectId === 'new-brief' || !!external,
  });

  return categoriesQuery.isLoading || entriesQuery.isLoading;
};
