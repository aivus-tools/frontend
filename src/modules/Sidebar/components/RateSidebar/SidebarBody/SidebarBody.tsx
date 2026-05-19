import { t } from '@/lib/i18n';
import { formatPrice } from '@/helpers/helper';

import { RateCardItem } from '@/types/rate.interface';

import styles from './SidebarBody.module.css';

interface Props {
  item: RateCardItem | null;
}

export const SidebarBody = (props: Props) => {
  if (!props.item) {
    return <div className={styles.content}>{t('NO_RATE_SELECTED')}</div>;
  }

  return (
    <div className={styles.content}>
      <div style={{ padding: '12px 0' }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{props.item.itemName}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--gray)' }}>{t('BASE_PRICE_LABEL')}</span>
          <span style={{ fontWeight: 600 }}>$ {formatPrice(Number(props.item.price))}</span>
        </div>
        {/* {item.unitLabel && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--gray)' }}>{t('UNITS')}</span>
            <span style={{ fontWeight: 500 }}>{item.unitLabel}</span>
          </div>
        )} */}
      </div>
    </div>
  );
};
