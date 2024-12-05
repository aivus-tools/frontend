import styles from './dashboard.module.css';
import { THeadItem, ProjectItem } from '@/components';
import cn from 'classnames';
import { dashboardTHeads } from '@/handbook/handbook';
import { THead } from '@/interfaces/app.interface';
import { Project } from '@/interfaces/app.interface';

import { initialData } from './mock';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
	const navigate = useNavigate();
	return (
		<main className={cn(styles.dashboard)}>
			<div className={cn(styles.grid, styles.header)}>
				{dashboardTHeads.map((item: THead, index: number) => (
					<THeadItem
						key={`thead_${index}`}
						className={cn({
							[styles.alignRight]: item.className && item.className === 'alignRight',
						})}
						text={item.text}
					/>
				))}
			</div>
			<div className={cn(styles.content)}>
				{initialData.map((item: Project) => (
					<ProjectItem
						className={cn(styles.projectItem)}
						key={`project_${item.id}`}
						item={item}
						onClick={() => navigate('/projects/estimation')}
					/>
				))}
			</div>
		</main>
	);
};
