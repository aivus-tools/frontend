import React from 'react';
import { Button } from 'antd';
import { getLocale, t } from '@/lib/i18n';
import { RatingRunetaLogo } from './RatingRunetaLogo';
import { PickVendorButtonRu } from './styles';

interface PickVendorButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const PickVendorButton: React.FC<PickVendorButtonProps> = (props) => {
  const isRu = getLocale() === 'ru';
  const label = t('PRE_VENDORS_PICK_VENDOR_BUTTON');

  if (isRu) {
    return (
      <PickVendorButtonRu type='button' onClick={props.onClick} disabled={props.disabled}>
        <RatingRunetaLogo variant='button' height={18} />
        <span>{label}</span>
      </PickVendorButtonRu>
    );
  }

  return (
    <Button onClick={props.onClick} disabled={props.disabled}>
      {label}
    </Button>
  );
};
