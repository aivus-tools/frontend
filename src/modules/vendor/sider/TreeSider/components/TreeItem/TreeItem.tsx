'use client';

import React from 'react';
import { Flex } from 'antd';
import Eye from '@/icons/eye.svg';
import EyeCrossed from '@/icons/eye-crossed.svg';
import styles from './TreeItem.module.css';
import cn from 'classnames';
import { Category, OfferData } from '@/types/estimation.interface';

interface TreeItemProps {
  data: {
    key: string;
    title: string;
    type: 'category' | 'subcategory' | 'offer';
    data: Category | OfferData;
  };
  isVisible: boolean;
  onVisibilityToggle: () => void;
}

export const TreeItem: React.FC<TreeItemProps> = ({ data, isVisible, onVisibilityToggle }) => {
  const { title, type } = data;

  const handleVisibilityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVisibilityToggle();
  };

  return (
    <div className={cn(styles.treeItem, styles[type])}>
      <Flex align='center' justify='space-between' className={styles.content}>
        <span className={styles.title}>{title}</span>
        <div className={styles.visibilityToggle} onClick={handleVisibilityClick}>
          {isVisible ? <Eye className={styles.eyeIcon} /> : <EyeCrossed className={styles.eyeIcon} />}
        </div>
      </Flex>
    </div>
  );
};
