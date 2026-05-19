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
  fullWidth?: boolean;
}

export const Tabs = (props: TabsProps) => {
  const orientation = props.orientation ?? 'horizontal';
  const isVertical = orientation === 'vertical';
  const navClasses = [styles.nav];
  if (isVertical) {
    navClasses.push(styles.navVertical);
  }
  if (props.fullWidth && !isVertical) {
    navClasses.push(styles.navFullWidth);
  }

  return (
    <nav className={navClasses.join(' ')}>
      {props.items.map((x) => {
        const isActive = props.activeKey === x.key;
        const classes = [styles.tab];
        if (isVertical) {
          classes.push(styles.tabVertical);
        }
        if (props.fullWidth && !isVertical) {
          classes.push(styles.tabFullWidth);
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
