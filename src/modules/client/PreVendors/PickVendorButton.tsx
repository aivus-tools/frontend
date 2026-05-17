import React from 'react';
import { Button } from 'antd';
import { getLocale, t } from '@/lib/i18n';
import { RatingRunetaLogo } from './RatingRunetaLogo';

import styles from './PickVendorButton.module.css';

interface PickVendorButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const PickVendorButton = (props: PickVendorButtonProps) => {
  const isRu = getLocale() === 'ru';
  const label = t('PRE_VENDORS_PICK_VENDOR_BUTTON');

  if (isRu) {
    return (
      <button type='button' className={styles.pickVendorButtonRu} onClick={props.onClick} disabled={props.disabled}>
        <RatingRunetaLogo variant='button' height={18} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Button onClick={props.onClick} disabled={props.disabled}>
      {label}
    </Button>
  );
};
