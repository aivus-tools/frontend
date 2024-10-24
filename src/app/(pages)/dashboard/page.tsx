'use client';
import styles from './page.module.css';
import withLayout from '@/layout/Layout';
import withAuth from '@/layout/withAuth/withAuth';
import { SidebarDash, THeadItem, ProjectItem } from '@/components';
import cn from 'classnames';
import { dashboardTHeads } from '@/handbook/handbook';
import { THead } from '@/interfaces/app.interface';
import { Project } from '@/interfaces/app.interface';

const Dashboard = () => {
	const initialData: Project[] = [
		{
			id: 123,
			title: 'CoSpring OLV campaign',
			assignee: 'Assigned to me',
			clientName: 'The Coca Cola Company',
			clientContact: 'Emily Smith, Internal comms manager',
			status: 'RFP',
			cost: 32620.8,
			expenses: 20727,
			profit: 11893.8,
			deadline: 'May 21, 2024',
			createdAt: 'Mar 11, 2024',
		},
		{
			id: 124,
			title: 'Winter Engagement Drive',
			assignee: 'Assigned to Emily Smith',
			clientName: 'The Coca Cola Company',
			clientContact: 'Emily Smith, Internal comms manager',
			status: 'Reviewing',
			cost: 32620.8,
			expenses: 20727,
			profit: 11893.8,
			deadline: 'May 21, 2024',
			createdAt: 'Mar 11, 2024',
		},
		{
			id: 125,
			title: 'Autumn Digital Surge',
			assignee: 'Assigned to me',
			clientName: 'The Coca Cola Company',
			clientContact: 'Emily Smith, Internal comms manager',
			status: 'Ongoing',
			cost: 32620.8,
			expenses: 20727,
			profit: 11893.8,
			deadline: 'May 21, 2024',
			createdAt: 'Mar 11, 2024',
		},
		{
			id: 126,
			title: 'Summer Breeze Outreach',
			assignee: 'Assigned to Michael Johnson',
			clientName: 'The Coca Cola Company',
			clientContact: 'Emily Smith, Internal comms manager',
			status: 'Ongoing',
			cost: 32620.8,
			expenses: 20727,
			profit: 11893.8,
			deadline: 'May 21, 2024',
			createdAt: 'Mar 11, 2024',
		},
	];

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
					<ProjectItem className={cn(styles.projectItem)} key={`project_${item.id}`} item={item} />
				))}
			</div>
		</main>
	);
};

export default withAuth(withLayout(Dashboard, 'dark', <SidebarDash />));
