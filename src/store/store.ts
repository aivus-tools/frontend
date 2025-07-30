import type { TypedStartListening } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/store/rootReducer';
import { briefApi } from '@/services/client/briefApi';
import { categoriesApi } from '@/services/client/categoriesApi';
import { offersApi } from '@/services/client/offersApi';
import { userApi } from '@/services/client/userApi';
import { listenerMiddleware } from '@/lib/listenerMiddleware';

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        briefApi.middleware,
        userApi.middleware,
        categoriesApi.middleware,
        offersApi.middleware,
        listenerMiddleware.middleware
      ),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
