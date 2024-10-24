'use client';
import { AddItemProps } from './AddItem.props';
import styles from './AddItem.module.css';
import cn from 'classnames';
import AddIcon from '@/icons/add-icon.svg';

export const AddItem = ({ text, className, ...props }: AddItemProps) => {
	return (
		<div className={cn(styles.addItem, className)} {...props}>
			<div className={cn(styles.icon)}>
				<AddIcon />
			</div>
			<div> {text} </div>
		</div>
	);
};
