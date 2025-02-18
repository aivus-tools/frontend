import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/store/rootReducer';
import { briefApi } from '@/services/client/briefApi';

export const makeStore = () => {
	return configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(briefApi.middleware),
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
