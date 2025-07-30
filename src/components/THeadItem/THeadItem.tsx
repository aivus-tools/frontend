import { DetailedHTMLProps, HTMLAttributes } from 'react';
import styles from './THeadItem.module.css';
import cn from 'classnames';
import SettingsIcon from '@/icons/settings-icon.svg';

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  text: string;
  showIcon?: boolean;
}

export const THeadItem = ({ text, showIcon = false, className }: Props) => {
  return (
    <div className={cn(styles.item, className)}>
      {showIcon && <SettingsIcon className={cn(styles.icon)} />}
      <div className={cn(styles.text)}>{text}</div>
    </div>
  );
};
