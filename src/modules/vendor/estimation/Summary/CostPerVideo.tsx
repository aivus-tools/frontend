'use client';

import { styled } from 'styled-components';
import { Flex } from 'antd';
import EyeCrossed from '@/icons/eye-crossed.svg';
import Eye from '@/icons/eye.svg';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectGrandTotal, selectShowCostPerVideo } from '@/store/slices/offer/selectors';
import { changeShowCostPerVideo } from '@/store/slices/offer/slice';
import { useBrief } from '@/hooks/useBrief';
import { t } from '@/lib/i18n';

const Label = styled.div`
  display: flex;
  justify-content: space-between;
  text-align: left;
  padding: 4px 0;
  background-color: var(--white);
  padding-right: 40px;
  gap: 8px;
  font-weight: 500;
  font-size: 13px;
`;
const TotalSum = styled.div`
  font-weight: 600;
  font-size: 13px;
  min-width: 90px;
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const EmptyBlockTotalSum = styled.div`
  background-color: var(--white);
`;

export const CostPerVideo = () => {
  const { data: brief } = useBrief();
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector(selectShowCostPerVideo);
  const { totalValue, clientTotalValue } = useAppSelector(selectGrandTotal);
  const handleVisible = () => {
    dispatch(changeShowCostPerVideo(!isVisible));
  };

  if (!brief) {
    return null;
  }

  const { number } = brief.details.mainVideoDuration;
  const countOfVideos = Number.isFinite(Number(number)) ? Number(number) : 1;

  return (
    <>
      <EmptyBlockTotalSum style={{ borderRadius: '6px 0 0 6px' }}>
        <Flex align='center' justify='center' style={{ height: '100%', cursor: 'pointer' }} onClick={handleVisible}>
          {isVisible ? <Eye /> : <EyeCrossed />}
        </Flex>
      </EmptyBlockTotalSum>
      <Label style={{ gridColumn: 'span 6' }}>
        <Flex align='center' justify='end'>
          {t('COST_PER_VIDEO', String(countOfVideos))}
        </Flex>
        <Flex align='center'>
          <TotalSum>{`$ ${totalValue / countOfVideos}`}</TotalSum>
        </Flex>
      </Label>
      <div />
      <Flex
        justify='flex-end'
        align='center'
        style={{ gridColumn: 'span 5', paddingRight: '16px', backgroundColor: 'var(--white)' }}
      >
        <TotalSum>{`$ ${clientTotalValue / countOfVideos}`}</TotalSum>
      </Flex>
    </>
  );
};
