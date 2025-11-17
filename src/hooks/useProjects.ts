import { projectsApi } from '@/services/client/projectsApi';

export const useProjects = () => {
  return projectsApi.useGetAllProjectsQuery();
};
