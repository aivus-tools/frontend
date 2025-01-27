import { configureStore } from '@reduxjs/toolkit';
import { projectSlice } from '../store/slices/project';

export const makeStore = () => {
	return configureStore({
		reducer: {
			[projectSlice.reducerPath]: projectSlice.reducer,
		},
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
