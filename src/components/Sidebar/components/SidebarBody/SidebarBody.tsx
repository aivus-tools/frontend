import { SidebarDescription } from './components/SidebarDescription/SidebarDescription';
import { OfferData } from '@/modules/vendor/estimation/types';
import React from 'react';
import { SidebarQuantity } from './components/SidebarQuantity/SidebarQuantity';
import ArrowDown from '@/icons/arrow-down.svg';
import { t } from '@/lib/i18n';

import styles from './SidebarBody.module.css';
import { Collapse } from 'antd';
import { SidebarExpenses } from './components/SidebarExpenses/SidebarExpenses';
import { SidebarForClient } from './components/SidebarForClient/SidebarForClient';
import { SidebarInput } from '@/components/Sidebar/components/SidebarBody/components/SidebarInput/SidebarInput';
import { ValueOf } from 'next/dist/shared/lib/constants';
import { changeOfferRow } from '@/store/slices/offer/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectOfferById } from '@/store/slices/offer/selectors';
import { RootState } from '@/store/store';

interface Props {
  initialOfferData: OfferData | null;
}

export const SidebarBody: React.FC<Props> = ({ initialOfferData }) => {
  const dispatch = useAppDispatch();
  const offer = useAppSelector((state: RootState) => selectOfferById(state, initialOfferData?.id ?? -1));

  if (!offer) {
    return null;
  }

  const handleChange = (id: number, key: keyof OfferData) => (data: ValueOf<OfferData> | null) => {
    dispatch(changeOfferRow({ id, [key]: data }));
  };

  const renderCollapse = (label: string, children: React.ReactNode, extra?: React.ReactNode) => {
    return (
      <div className={styles.section}>
        <Collapse
          className={styles.collapse}
          defaultActiveKey={['0']}
          expandIcon={({ isActive }) => (
            <ArrowDown className={`${styles.collapseIcon} ` + (isActive ? styles.collapseIconActive : '')} />
          )}
          ghost
          style={{ width: '100%' }}
          items={[
            {
              key: '0',
              label: (
                <div className={styles.collapseLabelWrapper}>
                  <div className={styles.collapseLabel}>{label}</div>
                  {extra}
                </div>
              ),
              children,
              classNames: { header: styles.collapseHeader },
            },
          ]}
        />
      </div>
    );
  };

  return (
    <div className={styles.content}>
      <SidebarDescription title={offer.item} />

      {renderCollapse(t('QUANTITY'), <SidebarQuantity offer={offer} handleChange={handleChange} />)}

      {renderCollapse(t('EXPENSES'), <SidebarExpenses offer={offer} handleChange={handleChange} />)}

      {renderCollapse(
        t('FOR_CLIENT'),
        <SidebarForClient offer={offer} handleChange={handleChange} />,
        <SidebarInput
          type='input'
          label={t('MARKUP')}
          labelPositon='left'
          value={offer.surcharge}
          width={70}
          icon='%'
          onChange={(value) => handleChange(offer.id, 'surcharge')(value)}
        />
      )}
    </div>
  );
};
