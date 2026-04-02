import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import {
  projectSlice,
  setProjectId,
  setMode,
  selectProjectId,
  selectMode,
  selectIsNewBrief,
  ProjectState,
} from '../project';
import { NEW_BRIEF_SLUG } from '@/constants/constants';

const createStore = (preloadedState?: Partial<ProjectState>) => {
  return configureStore({
    reducer: { project: projectSlice.reducer },
    preloadedState:
      preloadedState != null ? { project: { projectId: null, mode: 'view' as const, ...preloadedState } } : undefined,
  });
};

describe('project slice', () => {
  describe('initial state', () => {
    it('has null projectId', () => {
      const store = createStore();
      expect(selectProjectId(store.getState())).toBe(null);
    });

    it('has view mode', () => {
      const store = createStore();
      expect(selectMode(store.getState())).toBe('view');
    });

    it('is not a new brief', () => {
      const store = createStore();
      expect(selectIsNewBrief(store.getState())).toBe(false);
    });
  });

  describe('setProjectId', () => {
    it('sets projectId to the given value', () => {
      const store = createStore();
      store.dispatch(setProjectId('project-123'));
      expect(selectProjectId(store.getState())).toBe('project-123');
    });

    it('keeps mode as view for regular project ids', () => {
      const store = createStore();
      store.dispatch(setProjectId('project-123'));
      expect(selectMode(store.getState())).toBe('view');
    });

    it('switches mode to edit when projectId is new-brief slug', () => {
      const store = createStore();
      store.dispatch(setProjectId(NEW_BRIEF_SLUG));
      expect(selectMode(store.getState())).toBe('edit');
    });

    it('overwrites previous projectId', () => {
      const store = createStore({ projectId: 'old-id' });
      store.dispatch(setProjectId('new-id'));
      expect(selectProjectId(store.getState())).toBe('new-id');
    });
  });

  describe('setMode', () => {
    it('sets mode to edit', () => {
      const store = createStore();
      store.dispatch(setMode('edit'));
      expect(selectMode(store.getState())).toBe('edit');
    });

    it('sets mode to view', () => {
      const store = createStore({ mode: 'edit' });
      store.dispatch(setMode('view'));
      expect(selectMode(store.getState())).toBe('view');
    });

    it('does not affect projectId', () => {
      const store = createStore({ projectId: 'project-123' });
      store.dispatch(setMode('edit'));
      expect(selectProjectId(store.getState())).toBe('project-123');
    });
  });

  describe('selectProjectId', () => {
    it('returns null from initial state', () => {
      const state = { project: { projectId: null, mode: 'view' as const } };
      expect(selectProjectId(state)).toBe(null);
    });

    it('returns stored projectId', () => {
      const state = { project: { projectId: 'abc-123', mode: 'view' as const } };
      expect(selectProjectId(state)).toBe('abc-123');
    });
  });

  describe('selectMode', () => {
    it('returns view from initial state', () => {
      const state = { project: { projectId: null, mode: 'view' as const } };
      expect(selectMode(state)).toBe('view');
    });

    it('returns edit when set', () => {
      const state = { project: { projectId: null, mode: 'edit' as const } };
      expect(selectMode(state)).toBe('edit');
    });
  });

  describe('selectIsNewBrief', () => {
    it('returns true when projectId matches new brief slug', () => {
      const state = { project: { projectId: NEW_BRIEF_SLUG, mode: 'edit' as const } };
      expect(selectIsNewBrief(state)).toBe(true);
    });

    it('returns false for regular projectId', () => {
      const state = { project: { projectId: 'project-123', mode: 'view' as const } };
      expect(selectIsNewBrief(state)).toBe(false);
    });

    it('returns false for null projectId', () => {
      const state = { project: { projectId: null, mode: 'view' as const } };
      expect(selectIsNewBrief(state)).toBe(false);
    });
  });

  describe('reducer', () => {
    it('returns current state for unknown actions', () => {
      const initialState: ProjectState = { projectId: 'test', mode: 'edit' };
      const result = projectSlice.reducer(initialState, { type: 'UNKNOWN_ACTION' });
      expect(result).toEqual(initialState);
    });
  });
});
