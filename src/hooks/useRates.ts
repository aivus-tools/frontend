import { ratesApi } from '@/services/client/ratesApi';

export const useRates = () => {
  return ratesApi.useGetRatesQuery();
};
