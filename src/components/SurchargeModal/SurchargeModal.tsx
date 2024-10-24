'use client';
import { SurchargeModalProps } from './SurchargeModal.props';
import styles from './SurchargeModal.module.css';
import cn from 'classnames';
import { EditableInput } from '@/components';
import UnlinkIcon from '@/icons/unlink-icon.svg';
import LinkAngleIcon from '@/icons/link-angle-icon.svg';

export const SurchargeModal = ({ className, ...props }: SurchargeModalProps) => {
	return (
		<div className={cn(styles.surcharge, className)} {...props}>
			<div className={cn(styles.title)}>Surcharge</div>
			<div className={cn(styles.overall)}>
				<div className={cn(styles.overallTitle)}>Overall Surcharge</div>
				<div className={cn(styles.input)}>
					<EditableInput type='number' value={10} />
				</div>
				<LinkAngleIcon className={cn(styles.icon)} />
			</div>
			<div className={cn(styles.list)}>
				<div className={cn(styles.item)}>
					<div className={cn(styles.icon)}>
						<LinkAngleIcon className={cn(styles.icon)} />
					</div>
					<div className={cn(styles.text)}>
						If linked, the Overall Surcharge Percentage is added to all items in the calculation.
					</div>
				</div>
				<div className={cn(styles.item)}>
					<div className={cn(styles.icon)}>
						<UnlinkIcon className={cn(styles.icon)} />
					</div>
					<div className={cn(styles.text)}>
						If unlinked, the Overall Surcharge percentage is added only to the linked items.
					</div>
				</div>
			</div>
		</div>
	);
};
