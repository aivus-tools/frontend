'use client';

import ArrowIcon from '@/icons/arrow-icon.svg';

import styles from './title.module.css';

interface ArrowButtonProps {
  isOpen: boolean;
  onClick?: () => void;
}

export const ArrowButton = (props: ArrowButtonProps) => {
  const className = props.isOpen ? `${styles.arrowButton} ${styles.arrowButtonOpen}` : styles.arrowButton;
  return (
    <div className={className} onClick={props.onClick}>
      <ArrowIcon />
    </div>
  );
};
