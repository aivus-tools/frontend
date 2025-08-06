import React from 'react';
import styles from './SiderContent.module.css';
import { SiderContentProps } from './SiderContent.props';
import cn from 'classnames';

export const SiderContent: React.FC<SiderContentProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn(styles.siderContent, className)} {...props}>
      {children}
    </div>
  );
};
