import React from 'react';

import styles from '../BriefEditor.module.css';

interface GeneratingViewProps {
  title: string;
  subtitle: string;
}

export const GeneratingView = (props: GeneratingViewProps) => {
  return (
    <div className={styles.generatingOverlay}>
      <div className={styles.spinner} />
      <h3 className={styles.generatingTitle}>{props.title}</h3>
      <p className={styles.generatingSubtitle}>{props.subtitle}</p>
    </div>
  );
};
