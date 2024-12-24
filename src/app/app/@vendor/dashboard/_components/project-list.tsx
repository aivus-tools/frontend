'use client';
import { THeadItem, ProjectItem } from '@/components';
import cn from 'classnames';
import { dashboardTHeads } from '@/handbook/handbook';
import { THead } from '@/interfaces/app.interface';
import { Project } from '@/interfaces/app.interface';
import { useRouter } from 'next/navigation';

import { initialData } from './mock';
import styles from './project-list.module.css';

export const ProjectList = () => {
	const router = useRouter();
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
						onClick={() => router.push(`/app/dashboard/${item.id}/details`)}
					/>
				))}
			</div>
		</main>
	);
};
