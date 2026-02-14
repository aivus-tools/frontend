import { ratesApi } from '@/services/client/ratesApi';

export const useRateCards = () => {
  return ratesApi.useGetRateCardsQuery();
};
