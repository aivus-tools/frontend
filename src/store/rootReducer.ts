import { combineReducers } from '@reduxjs/toolkit';
import { projectSlice } from './slices/project';
import { briefApi } from '@/services/client/briefApi';

export const rootReducer = combineReducers({
	[projectSlice.reducerPath]: projectSlice.reducer,
	[briefApi.reducerPath]: briefApi.reducer,
});
