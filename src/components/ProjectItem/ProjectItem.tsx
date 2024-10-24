'use client';
import { ProjectItemProps } from './ProjectItem.props';
import styles from './ProjectItem.module.css';
import cn from 'classnames';
import { Percent, PrStatus } from '@/components';
import { formatPrice } from '@/helpers/helper';

export const ProjectItem = ({ item, className, ...props }: ProjectItemProps) => {
	return (
		<div
			className={cn(styles.project, className, {
				[styles.rfp]: item.status === 'RFP',
				[styles.reviewing]: item.status === 'Reviewing',
				[styles.ongoing]: item.status === 'Ongoing',
			})}
			{...props}
		>
			<div className={cn(styles.column, styles.main)}>
				<div className={cn(styles.title)}>{item.title}</div>
				<div className={cn(styles.assignee)}>{item.assignee}</div>
			</div>
			<div className={cn(styles.column)}>
				<div className={cn(styles.clientName)}>{item.clientName}</div>
				<div className={cn(styles.contact)}>{item.clientContact}</div>
			</div>
			<div className={cn(styles.column)}>
				<div className={cn(styles.clientName)}>
					<PrStatus status={item.status} />
				</div>
			</div>
			<div className={cn(styles.column, styles.alignRight)}>
				<div className={cn(styles.cost)}>$ {formatPrice(item.cost)}</div>
				<div className={cn(styles.expenses)}>$ {formatPrice(item.expenses)}</div>
			</div>
			<div className={cn(styles.column, styles.alignRight)}>
				<div className={cn(styles.cost, styles.blue)}>$ {formatPrice(item.profit)}</div>
				<Percent className={cn(styles.percent)} mark='average' size='s' type='transparent' count={36} />
			</div>
			<div className={cn(styles.column)}>
				<div className={cn(styles.date)}>{item.deadline}</div>
				<div className={cn(styles.left)}>33d left</div>
			</div>
			<div className={cn(styles.column)}>
				<div className={cn(styles.date)}>{item.createdAt}</div>
				<div className={cn(styles.left)}>3d running</div>
			</div>
		</div>
	);
};
