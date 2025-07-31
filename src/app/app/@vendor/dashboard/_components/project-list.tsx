'use client';
import cn from 'classnames';
import { dashboardTHeads } from '@/handbook/handbook';
import { THead } from '@/types/app.interface';
import { useRouter } from 'next/navigation';

import styles from './project-list.module.css';
import { useEffect, useMemo } from 'react';
import { THeadItem } from '@/components/THeadItem/THeadItem';
import { ProjectItem } from '@/components/ProjectItem/ProjectItem';
import { useBriefs } from '@/hooks/useBriefs';
import { Brief } from '@/types/brief.interface';
import { format } from 'date-fns';
import { Project } from '@/types/project.interface.';
import { formatPrice } from '@/helpers/helper';
import Spinner from '@/components/Spinner';
import { AppRoute } from '@/constants/appRoute';

const mapBriefsToProjects = (briefs: Brief[]): Project[] => {
  if (!briefs || !Array.isArray(briefs)) {
    return [];
  }

  return briefs.map((brief: Brief) => {
    const { details } = brief;

    const { options } = details;
    const assignee = details.collaborators
      .map((email) => {
        const collaborator = options?.collaborators?.find((person) => person.email === email);
        if (!collaborator) {
          return null;
        }
        return `${collaborator.firstName} ${collaborator.surname}`;
      })
      .filter(Boolean)
      .join(', ');

    return {
      id: brief.id,
      title: details.projectName,
      assignee,
      clientName: details.clientName,
      clientContact: '?????????',
      status: brief.status,
      cost: formatPrice(details.budget ?? 0),
      expenses: formatPrice(0),
      profit: formatPrice(0),
      deadline: '?????????',
      createdAt: format(new Date(brief.createdAt), 'MM/dd/yyyy'),
    };
  });
};

export const ProjectList = () => {
  const router = useRouter();

  const { data: briefs = [], isLoading } = useBriefs();

  const data = useMemo(() => mapBriefsToProjects(briefs), [briefs]);

  useEffect(() => {
    data.forEach((item: Project) => {
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
        {data.map((item: Project) => (
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
