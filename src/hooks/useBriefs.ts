import { briefApi } from '@/services/client/briefApi';

export const useBriefs = () => {
  return briefApi.useGetBriefsQuery();
};
