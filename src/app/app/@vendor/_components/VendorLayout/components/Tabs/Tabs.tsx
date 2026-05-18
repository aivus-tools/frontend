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
  orientation?: 'horizontal' | 'vertical';
}

export const Tabs = (props: TabsProps) => {
  const orientation = props.orientation ?? 'horizontal';
  const isVertical = orientation === 'vertical';
  const navClass = isVertical ? `${styles.nav} ${styles.navVertical}` : styles.nav;

  return (
    <nav className={navClass}>
      {props.items.map((x) => {
        const isActive = props.activeKey === x.key;
        const classes = [styles.tab];
        if (isVertical) {
          classes.push(styles.tabVertical);
        }
        if (isActive) {
          classes.push(isVertical ? styles.tabVerticalActive : styles.tabActive);
        }
        return (
          <button key={x.key} className={classes.join(' ')} onClick={props.onChange(x.key)}>
            {x.label}
          </button>
        );
      })}
    </nav>
  );
};
