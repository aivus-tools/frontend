'use client';
import cn from 'classnames';
import { dashboardTHeads } from '@/handbook/handbook';
import { THead } from '@/types/app.interface';
import { useRouter } from 'next/navigation';

import styles from './project-list.module.css';
import React, { useEffect, useMemo } from 'react';
import { THeadItem } from '@/components/THeadItem/THeadItem';
import { ProjectItem } from '@/components/ProjectItem/ProjectItem';
import { useProjects } from '@/hooks/useProjects';
import { Project, ProjectListItem } from '@/types/project.interface.';
import { format } from 'date-fns';
import { formatPrice } from '@/helpers/helper';
import Spinner from '@/components/Spinner';
import { AppRoute } from '@/constants/appRoute';

const mapProjectsToListItems = (projects: Project[]): ProjectListItem[] => {
  if (!projects || !Array.isArray(projects)) {
    return [];
  }

  return projects.map((project: Project) => {
    return {
      id: project.id,
      title: project.name,
      assignee: '', // TODO: Get from team
      clientName: '', // TODO: Get from brief.details
      clientContact: '', // TODO: Get from brief.details
      status: project.status,
      cost: formatPrice(0), // TODO: Calculate from offer
      expenses: formatPrice(0), // TODO: Calculate from offer
      profit: formatPrice(0), // TODO: Calculate from offer
      deadline: '', // TODO: Get from offer
      createdAt: format(new Date(project.createdAt), 'MM/dd/yyyy'),
    };
  });
};

export const ProjectList = () => {
  const router = useRouter();

  const { data: projects = [], isLoading } = useProjects();

  const data = useMemo(() => mapProjectsToListItems(projects), [projects]);

  useEffect(() => {
    data.forEach((item: ProjectListItem) => {
      router.prefetch(AppRoute.DASHBOARD_PROJECT_DETAILS(item.id));
    });
  }, [router, data]);

  if (isLoading) {
    return <Spinner />;
  }

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
        {data.map((item: ProjectListItem) => (
          <ProjectItem
            className={cn(styles.projectItem)}
            key={`project_${item.id}`}
            item={item}
            onClick={() => router.push(AppRoute.DASHBOARD_PROJECT_DETAILS(item.id))}
          />
        ))}
      </div>
    </main>
  );
};
