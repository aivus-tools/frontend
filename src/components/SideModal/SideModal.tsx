'use client';
import { SideModalProps } from './SideModal.props';
import styles from './SideModal.module.css';
import cn from 'classnames';
import CloseIcon from '@/icons/close-icon.svg';

export const SideModal = ({ isOpen, onClose, children, className, ...props }: SideModalProps) => {
  return (
    <div
      className={cn(styles.overlay, className, {
        [styles.open]: isOpen,
      })}
      onClick={onClose}
      {...props}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <CloseIcon className={styles.closeButton} onClick={onClose} />
        {children}
      </div>
    </div>
  );
};
