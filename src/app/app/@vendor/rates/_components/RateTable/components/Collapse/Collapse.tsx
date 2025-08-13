import { Collapse } from 'antd';
import ArrowDown from '@/icons/arrow-down.svg';
import React from 'react';

import styles from './Collapse.module.css';

interface Props {
  label: string;
  content: React.ReactNode;
  extra?: React.ReactNode;
}

export const TableCollapse: React.FC<Props> = ({ label, content, extra }) => {
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
              <div className={styles.collapseLabel}>{label}</div>
              {extra}
            </div>
          ),
          children: content,
          classNames: { header: styles.collapseHeader },
        },
      ]}
    />
  );
};
