'use client';
import cn from 'classnames';
import { useRouter, useSearchParams } from 'next/navigation';

import styles from './project-list.module.css';
import React, { useEffect, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Project, ProjectListItem } from '@/types/project.interface';
import { Offer } from '@/types/offer.interface';
import { format } from 'date-fns';
import Spinner from '@/components/Spinner';
import { AppRoute } from '@/constants/appRoute';
import { useGetAllOffersQuery } from '@/services/client/offersApi';
import { useGetArchivedProjectsQuery } from '@/services/client/projectsApi';
import { ProjectOfferCard } from '@/modules/vendor/dashboard/ProjectOfferCard/ProjectOfferCard';
import { t } from '@/lib/i18n';
import { InboxOutlined } from '@ant-design/icons';

const mapProjectsToListItems = (projects: Project[]): ProjectListItem[] => {
  if (!projects || !Array.isArray(projects)) {
    return [];
  }

  return projects.map((project: Project) => ({
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
  }));
};

export const ProjectList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = searchParams.get('view');
  const statusFilter = searchParams.get('status');
  const isArchiveView = view === 'archive';

  const { data: activeProjects = [], isLoading: isLoadingActive } = useProjects();
  const { data: archivedProjects = [], isLoading: isLoadingArchived } = useGetArchivedProjectsQuery();
  const { data: allOffers = [] } = useGetAllOffersQuery();

  const isLoading = isArchiveView ? isLoadingArchived : isLoadingActive;

  const offersByProject = useMemo(() => {
    const map: Record<string, Offer[]> = {};
    allOffers.forEach((offer) => {
      const pid = offer.projectId;
      if (pid) {
        if (!map[pid]) { map[pid] = []; }
        map[pid].push(offer);
      }
    });
    return map;
  }, [allOffers]);

  const projects = isArchiveView ? archivedProjects : activeProjects;

  const data = useMemo(() => mapProjectsToListItems(projects), [projects]);

  const filteredData = useMemo(() => {
    if (statusFilter && !isArchiveView) {
      return data.filter((p) => {
        const projectOffers = offersByProject[p.id] || [];
        return projectOffers.some((o) => o.status === statusFilter);
      });
    }
    return data;
  }, [data, statusFilter, isArchiveView, offersByProject]);

  useEffect(() => {
    filteredData.forEach((item: ProjectListItem) => {
      router.prefetch(AppRoute.DASHBOARD_PROJECT_ESTIMATION(item.id));
    });
  }, [router, filteredData]);

  if (isLoading) {
    return <Spinner />;
  }

  // Empty state for archive view
  if (isArchiveView && filteredData.length === 0) {
    return (
      <main className={cn(styles.dashboard)}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            color: '#78829d',
          }}
        >
          <InboxOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }} />
          <div style={{ fontSize: 16, fontWeight: 500 }}>{t('NO_ARCHIVED_PROJECTS')}</div>
        </div>
      </main>
    );
  }

  return (
    <main className={cn(styles.dashboard)}>
      <div className={cn(styles.content)}>
        {filteredData.map((item: ProjectListItem) => {
          const projectOffers = offersByProject[item.id] || [];
          const visibleOffers = statusFilter && !isArchiveView
            ? projectOffers.filter((o) => o.status === statusFilter)
            : projectOffers;
          return (
            <ProjectOfferCard
              key={`project_${item.id}`}
              item={item}
              offers={visibleOffers}
              isArchived={isArchiveView}
              onClick={() => router.push(AppRoute.DASHBOARD_PROJECT_ESTIMATION(item.id))}
            />
          );
        })}
      </div>
    </main>
  );
};
