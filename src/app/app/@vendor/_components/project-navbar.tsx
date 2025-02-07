'use client';
import { Button } from 'antd';
import { ProjectTabs } from './project-tabs';
import { useSetProject } from '../hooks/useSetProject';

export const ProjectNavbar = () => {
	useSetProject();

	return (
		<div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<ProjectTabs />
			<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
				<Button type='primary'>Share</Button>
			</div>
		</div>
	);
};
