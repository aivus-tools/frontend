import { useAppSelector } from '@/store/hooks';
import { selectGrandTotal } from '@/store/slices/offer/selectors';
import { SiderContent } from '../../../components/SiderContent/SiderContent';
import { PriceBlock } from '../../../components/PriceBlock/PriceBlock';
import { t } from '@/lib/i18n';

export const GrandTotalSider = () => {
  const { totalValue, clientTotalValue } = useAppSelector(selectGrandTotal);

  const diff = clientTotalValue - totalValue;
  const percent = clientTotalValue !== 0 ? (diff / clientTotalValue) * 100 : 0;

  return (
    <SiderContent>
      <PriceBlock title={t('TOTAL_CLIENTS_COST')} amount={clientTotalValue} />
      <PriceBlock title={t('EXPENCES')} amount={totalValue} highlight />
      <PriceBlock
        title={t('REVENUE_AND_MARKUP')}
        amount={diff}
        percentDiff={Math.abs(percent)}
        percentPositive={percent >= 0}
      />
    </SiderContent>
  );
};
