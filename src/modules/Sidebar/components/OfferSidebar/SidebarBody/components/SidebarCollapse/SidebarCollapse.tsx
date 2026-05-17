import { Collapse } from 'antd';
import ArrowDown from '@/icons/arrow-down.svg';
import React from 'react';

import styles from './SidebarCollapse.module.css';

interface Props {
  label: string;
  content: React.ReactNode;
  extra?: React.ReactNode;
}

export const SidebarCollapse = (props: Props) => {
  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
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
            <div className={styles.collapseLabelWrapper} onClick={handleLabelClick}>
              <div className={styles.collapseLabel}>{props.label}</div>
              {props.extra}
            </div>
          ),
          children: props.content,
          classNames: { header: styles.collapseHeader },
        },
      ]}
    />
  );
};
