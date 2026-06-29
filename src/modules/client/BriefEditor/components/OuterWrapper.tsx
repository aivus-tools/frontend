import React from 'react';

import styles from '../BriefEditor.module.css';

interface OuterWrapperProps {
  footerVisible: boolean;
  footerHeight: number;
  fill?: boolean;
  children: React.ReactNode;
}

export const OuterWrapper = (props: OuterWrapperProps) => {
  const heightValue = props.fill
    ? '100%'
    : props.footerVisible
      ? `calc(100dvh - var(--aivus-header-h) - ${props.footerHeight}px)`
      : 'calc(100dvh - var(--aivus-header-h))';

  return (
    <div className={styles.outerWrapper} style={{ height: heightValue }}>
      {props.children}
    </div>
  );
};
