'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { makeSelectCostPerVideo } from '@/store/slices/offer/selectors';
import { useBrief } from '@/hooks/useBrief';

export function useCostPerVideo() {
  const { data: brief } = useBrief();

  const count = useMemo(() => {
    const number = Number(brief?.details?.mainVideoDuration?.number);

    return Number.isFinite(number) && number > 0 ? number : 1;
  }, [brief?.details?.mainVideoDuration?.number]);

  const selectCostPerVideo = useMemo(() => makeSelectCostPerVideo(), []);
  const { vendor, client } = useAppSelector((state) => selectCostPerVideo(state, count));

  return {
    count,
    vendorCostPerVideo: vendor,
    clientCostPerVideo: client,
  };
}
