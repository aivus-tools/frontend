import { combineReducers } from '@reduxjs/toolkit';
import { projectSlice } from './slices/project';
import { briefApi } from '@/services/client/briefApi';
import { userApi } from '@/hooks/useChangeGroup';

export const rootReducer = combineReducers({
	[projectSlice.reducerPath]: projectSlice.reducer,
	[briefApi.reducerPath]: briefApi.reducer,
	[userApi.reducerPath]: userApi.reducer,
});
