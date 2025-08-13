import React from 'react';
import styles from './SidebarDescription.module.css';

interface Props {
  title: string;
}

export const SidebarDescription: React.FC<Props> = ({ title }) => {
  return <div className={styles.text}>{title}</div>;
};
