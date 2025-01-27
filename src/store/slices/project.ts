import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ProjectState {
	projectId: string | null;
}

const initialState: ProjectState = {
	projectId: null,
};

export const projectSlice = createSlice({
	name: 'project',
	initialState,
	reducers: {
		setProjectId: (state, action: PayloadAction<string>) => {
			state.projectId = action.payload;
		},
	},
});

export const { setProjectId } = projectSlice.actions;

export const selectProjectId = (state: { project: ProjectState }) => state.project.projectId;
