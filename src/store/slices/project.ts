import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ProjectState {
	projectId: string | null;
	mode: 'edit' | 'view';
}

const initialState: ProjectState = {
	projectId: null,
	mode: 'view',
};

export const projectSlice = createSlice({
	name: 'project',
	initialState,
	reducers: {
		setProjectId: (state, action: PayloadAction<string>) => {
			state.projectId = action.payload;
		},
		setMode: (state, action: PayloadAction<ProjectState['mode']>) => {
			state.mode = action.payload;
		},
	},
});

export const { setProjectId, setMode } = projectSlice.actions;

export const selectProjectId = (state: { project: ProjectState }) => state.project.projectId;
export const selectMode = (state: { project: ProjectState }) => state.project.mode;
