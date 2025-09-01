import { Popover, Typography, Space } from 'antd';
import SettingsIcon from '@/icons/settings-icon.svg';
import { useState } from 'react';
import { LinkButton } from '../LinkButtons/LinkButtons';
import LinkIcon from '@/icons/link-angle-icon.svg';
import UnLinkIcon from '@/icons/unlink-icon.svg';
import styles from './SurchargePopover.module.css';
import { InputNumberRight, Line } from '../../styled';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changeOverallSurcharge } from '@/store/slices/offer/slice';
import { selectOverallSurcharge } from '@/store/slices/offer/selectors';
import { t } from '@/lib/i18n';

const { Text } = Typography;

export const SurchargePopover = () => {
  const [open, setOpen] = useState(false);
  const { surcharge, linked } = useAppSelector(selectOverallSurcharge);
  const dispatch = useAppDispatch();
  const changeSurcharge = ({ surcharge, linked }: { surcharge?: number; linked?: boolean }) =>
    dispatch(
      changeOverallSurcharge({
        surcharge,
        linked,
      })
    );

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const setSurchargeValue = (value: number | null) => {
    changeSurcharge({
      surcharge: value ?? 0,
    });
  };

  const toggleLink = () => {
    changeSurcharge({
      linked: !linked,
    });
  };

  const renderContent = () => {
    return (
      <div className={styles.popoverContent}>
        <div className={styles.header}>
          <Text strong className={styles.title}>
            {t('MARKUP')}
          </Text>
          <button onClick={hide} className={styles.closeButton}>
            ✕
          </button>
        </div>
        <Line />
        <div className={styles.surchargeSection}>
          <span className={styles.label}>{t('OVERALL_MURKUP')}</span>
          <Space>
            <InputNumberRight
              value={surcharge}
              controls={false}
              min={0}
              onChange={setSurchargeValue}
              suffix='%'
              style={{ width: 80 }}
            />
            <LinkButton link={linked} onClickAction={toggleLink} />
          </Space>
        </div>
        <Line />
        <div className={styles.explanation}>
          <div className={styles.explanationItem}>
            <LinkIcon width={24} height={24} />
            <span className={styles.explanationText}>{t('IF_LINKED_THE_OVERALL_')}</span>
          </div>
          <div className={styles.explanationItem}>
            <UnLinkIcon width={24} height={24} />
            <span className={styles.explanationText}>{t('IF_UNLINKED_THE_OVERALL_')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Popover content={renderContent()} trigger='click' open={open} placement='bottom' onOpenChange={handleOpenChange}>
      <button>
        <SettingsIcon />
      </button>
    </Popover>
  );
};
