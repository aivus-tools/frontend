'use client';
import { ModalProps } from './Modal.props';
import styles from './Modal.module.css';
import cn from 'classnames';
import CloseIcon from '@/icons/close-icon.svg';

export const Modal = ({ onClose, children, className, ...props }: ModalProps) => {
	return (
		<div className={cn(className, styles.overlay)} onClick={onClose} {...props}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<CloseIcon className={styles.closeButton} onClick={onClose} />
				{children}
			</div>
		</div>
	);
};
