'use client';
import cn from 'classnames';
import { dashboardTHeads } from '@/handbook/handbook';
import { THead } from '@/types/app.interface';
import { useRouter } from 'next/navigation';

import styles from './project-list.module.css';
import React, { useEffect, useMemo } from 'react';
import { THeadItem } from '@/components/THeadItem/THeadItem';
import { useProjects } from '@/hooks/useProjects';
import { Project, ProjectListItem } from '@/types/project.interface';
import { Offer } from '@/types/offer.interface';
import { format } from 'date-fns';
import Spinner from '@/components/Spinner';
import { AppRoute } from '@/constants/appRoute';
import { useGetAllOffersQuery } from '@/services/client/offersApi';
import { ProjectOfferCard } from '@/modules/vendor/dashboard/ProjectOfferCard/ProjectOfferCard';

const mapProjectsToListItems = (projects: Project[]): ProjectListItem[] => {
  if (!projects || !Array.isArray(projects)) {
    return [];
  }

  return projects.map((project: Project) => {
    return {
      id: project.id,
      title: project.name,
      assignee: '-',
      clientName: project.clientName || '-',
      clientContact: '-',
      status: project.status,
      cost: '-',
      expenses: '-',
      profit: '-',
      deadline: '-',
      createdAt: format(new Date(project.createdAt), 'MM/dd/yyyy'),
    };
  });
};

export const ProjectList = () => {
  const router = useRouter();

  const { data: projects = [], isLoading } = useProjects();
  const { data: allOffers = [] } = useGetAllOffersQuery();

  const data = useMemo(() => mapProjectsToListItems(projects), [projects]);

  // Group offers by project ID
  const offersByProject = useMemo(() => {
    const map: Record<string, Offer[]> = {};
    allOffers.forEach((offer) => {
      const pid = offer.projectId;
      if (pid) {
        if (!map[pid]) map[pid] = [];
        map[pid].push(offer);
      }
    });
    return map;
  }, [allOffers]);

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
          <ProjectOfferCard
            key={`project_${item.id}`}
            item={item}
            offers={offersByProject[item.id] || []}
            onClick={() => router.push(AppRoute.DASHBOARD_PROJECT_DETAILS(item.id))}
          />
        ))}
      </div>
    </main>
  );
};
