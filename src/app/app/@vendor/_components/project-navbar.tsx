'use client';
import { Button } from 'antd';
import { ProjectTabs } from './project-tabs';
import { useSelectedLayoutSegments } from 'next/navigation';
import { useEffect } from 'react';
import { selectProjectId, setProjectId } from '@/store/slices/project';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';

export const ProjectNavbar = () => {
	const [, projectId] = useSelectedLayoutSegments();
	const storedProjectId = useAppSelector(selectProjectId);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (storedProjectId !== projectId) {
			dispatch(setProjectId(projectId));
		}
	}, [projectId, dispatch, storedProjectId]);

	return (
		<div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<ProjectTabs />
			<div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
				<Button type='primary'>Share</Button>
			</div>
		</div>
	);
};
