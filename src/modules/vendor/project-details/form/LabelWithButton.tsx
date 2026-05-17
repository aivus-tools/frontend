import React, { PropsWithChildren } from 'react';
import { Typography } from 'antd';

import styles from './LabelWithButton.module.css';

interface LabelWithSideProps {
  text: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const LabelWithSide = (props: PropsWithChildren<LabelWithSideProps>) => {
  return (
    <div className={styles.labelContainer} onClick={props.onClick}>
      <Typography.Text>{props.text}</Typography.Text>
      <div className={styles.side}>{props.children}</div>
    </div>
  );
};
