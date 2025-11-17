'use client';
import styles from './ProjectItem.module.css';
import cn from 'classnames';
import { PrStatus } from '../PrStatus/PrStatus';
import { Percent } from '../Percent/Percent';
import { ProjectListItem } from '@/types/project.interface.';
import { PROJECT_STATUS } from '@/constants/constants';

interface Props {
  item: ProjectListItem;
  className?: string;
  onClick?: () => void;
}

export const ProjectItem = ({ item, onClick, className }: Props) => {
  return (
    <div
      className={cn(styles.project, className, {
        [styles.rfp]: item.status === PROJECT_STATUS.RFP,
        [styles.reviewing]: item.status === PROJECT_STATUS.REVIEWING,
        [styles.ongoing]: item.status === PROJECT_STATUS.ONGOING,
        [styles.draft]: item.status === PROJECT_STATUS.DRAFT,
        [styles.completed]: item.status === PROJECT_STATUS.COMPLETED,
      })}
      onClick={onClick}
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
        <div className={cn(styles.cost)}>$ {item.cost}</div>
        <div className={cn(styles.expenses)}>$ {item.expenses}</div>
      </div>
      <div className={cn(styles.column, styles.alignRight)}>
        <div className={cn(styles.cost, styles.blue)}>$ {item.profit}</div>
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
