'use client';
import { useSelectedLayoutSegments } from 'next/navigation';
import { useEffect } from 'react';
import { selectProjectId, setProjectId } from '@/store/slices/project';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export const useSetProject = () => {
  const [, projectId] = useSelectedLayoutSegments();
  const storedProjectId = useAppSelector(selectProjectId);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (projectId && storedProjectId !== projectId) {
      dispatch(setProjectId(projectId));
    }
  }, [projectId, dispatch, storedProjectId]);
};
