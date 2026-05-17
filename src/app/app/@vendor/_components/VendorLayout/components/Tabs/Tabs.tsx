import React from 'react';

import styles from './Tabs.module.css';

interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  onChange: (key: string) => (e: React.MouseEvent<HTMLButtonElement>) => void;
  items: TabItem[];
  activeKey?: string;
}

export const Tabs = (props: TabsProps) => {
  return (
    <nav className={styles.nav}>
      {props.items.map((x) => {
        const isActive = props.activeKey === x.key;
        const tabClass = isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab;
        return (
          <button key={x.key} className={tabClass} onClick={props.onChange(x.key)}>
            {x.label}
          </button>
        );
      })}
    </nav>
  );
};
