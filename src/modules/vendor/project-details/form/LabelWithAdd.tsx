import React from 'react';
import { Typography } from 'antd';
import AddIcon from '@/icons/add-icon.svg';

import styles from './LabelWithAdd.module.css';

interface LabelWithAddProps {
  text: string;
  onClick: () => void;
}

export const LabelWithAdd = (props: LabelWithAddProps) => {
  return (
    <div className={styles.labelContainer}>
      <Typography.Text>{props.text}</Typography.Text>
      <div className={styles.iconButton} onClick={props.onClick}>
        <AddIcon color={'var(--gray-light)'} />
      </div>
    </div>
  );
};
