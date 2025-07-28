'use client';
import { SettingsItemProps } from './SettingsItem.props';
import styles from './SettingsItem.module.css';
import cn from 'classnames';
import ArrowIcon from '@/icons/arrow-left-bold-icon.svg';
import { useState } from 'react';

export const SettingsItem = ({ title, children, className, ...props }: SettingsItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleItem = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn(styles.item, className)} {...props}>
      <div className={cn(styles.header)} onClick={toggleItem}>
        <div className={cn(styles.title)}>{title}</div>
        <ArrowIcon
          className={cn(styles.icon, {
            [styles.opened]: isOpen,
          })}
        />
      </div>
      {isOpen && <div className={cn(styles.content)}>{children}</div>}
    </div>
  );
};
