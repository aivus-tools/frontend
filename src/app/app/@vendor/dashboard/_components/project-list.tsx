'use client';
import cn from 'classnames';
import { dashboardTHeads } from '@/handbook/handbook';
import { THead } from '@/interfaces/app.interface';
import { Project } from '@/interfaces/app.interface';
import { useRouter } from 'next/navigation';

import styles from './project-list.module.css';
import { useEffect, useMemo } from 'react';
import { THeadItem } from '@/components/THeadItem/THeadItem';
import { ProjectItem } from '@/components/ProjectItem/ProjectItem';
import { useBriefs } from '@/hooks/useBriefs';
import { Brief, Details } from '@/types/brief';
import { format } from 'date-fns';

const statusMap = {
	DRAFT: 'Reviewing',
	RFP: 'RFP',
	REVIEWING: 'Reviewing',
	ONGOING: 'Ongoing',
} as const;

const mapBriefsToProjects = (briefs: Brief[]): Project[] => {
	if (!briefs || !Array.isArray(briefs)) {
		return [];
	}

	return briefs.map((brief: Brief) => {
		const details: Details = brief.details;
		return {
			id: brief.id,
			title: details.projectName,
			assignee: details.internalManagersAndProducers,
			clientName: details.clientName,
			clientContact: '?????????',
			status: statusMap[brief.status],
			cost: details.budget,
			expenses: 0,
			profit: 0,
			deadline: '?????????',
			createdAt: format(new Date(brief.createdAt), 'MM/dd/yyyy'),
		};
	});
};

export const ProjectList = () => {
	const router = useRouter();

	const { data: briefs = [] } = useBriefs();

	const data = useMemo(() => mapBriefsToProjects(briefs), [briefs]);

	useEffect(() => {
		data.forEach((item: Project) => {
			router.prefetch(`/app/dashboard/${item.id}/details`);
		});
	}, [router, data]);

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
				{data.map((item: Project) => (
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
