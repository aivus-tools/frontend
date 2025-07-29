'use client';
import styles from './PrStatus.module.css';
import cn from 'classnames';
import { ProjectStatus } from '@/types/project.interface.';
import { PROJECT_STATUS } from '@/lib/constants';

interface Props {
  status: ProjectStatus;
}

export const PrStatus = ({ status }: Props) => {
  console.log('status:', status);
  return (
    <div
      className={cn(styles.status, {
        [styles.rfp]: status === PROJECT_STATUS.RFP,
        [styles.reviewing]: status === PROJECT_STATUS.REVIEWING,
        [styles.ongoing]: status === PROJECT_STATUS.ONGOING,
        [styles.draft]: status === PROJECT_STATUS.DRAFT,
        [styles.completed]: status === PROJECT_STATUS.COMPLETED,
      })}
    >
      {status}
    </div>
  );
};
