import { combineReducers } from '@reduxjs/toolkit';
import { projectSlice } from './slices/project';
import { offerSlice } from './slices/offer/slice';
import { briefApi } from '@/services/client/briefApi';
import { categoriesApi } from '@/services/client/categoriesApi';
import { offersApi } from '@/services/client/offersApi';
import { userApi } from '@/hooks/useChangeGroup';
import { vendorSlice } from './slices/vendor';

export const rootReducer = combineReducers({
	[projectSlice.reducerPath]: projectSlice.reducer,
	[offerSlice.reducerPath]: offerSlice.reducer,
	[vendorSlice.reducerPath]: vendorSlice.reducer,
	[briefApi.reducerPath]: briefApi.reducer,
	[categoriesApi.reducerPath]: categoriesApi.reducer,
	[offersApi.reducerPath]: offersApi.reducer,
	[userApi.reducerPath]: userApi.reducer,
});
