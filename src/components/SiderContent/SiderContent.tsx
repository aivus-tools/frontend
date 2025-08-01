import React from 'react';
import styles from './SiderContent.module.css';
import { SiderContentProps } from './SiderContent.props';

export const SiderContent: React.FC<SiderContentProps> = ({ children, className, ...props }) => {
  return (
    <div className={[styles.siderContent, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  );
};
