'use client';

import React from 'react';
import { Typography } from 'antd';

import styles from './CategoryRow.module.css';

interface CategoryRowProps {
  name: string;
}

export const CategoryRow = (props: CategoryRowProps) => {
  return (
    <div className={styles.wrapper}>
      <Typography.Text className={styles.name}>{props.name}</Typography.Text>
    </div>
  );
};
