import type { TypedStartListening } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/store/rootReducer';
import { categoriesApi } from '@/services/client/categoriesApi';
import { ratesApi } from '@/services/client/ratesApi';
import { offersApi } from '@/services/client/offersApi';
import { projectsApi } from '@/services/client/projectsApi';
import { userApi } from '@/services/client/userApi';
import { sharesApi } from '@/services/client/sharesApi';
import { templatesApi } from '@/services/client/templatesApi';
import { chatApi } from '@/services/client/chatApi';
import { comparisonApi } from '@/services/client/comparisonApi';
import { xlsxApi } from '@/services/client/xlsxApi';
import { profileApi } from '@/services/client/profileApi';
import { vendorSettingsApi } from '@/services/client/vendorSettingsApi';
import { briefAiApi } from '@/services/client/briefAiApi';
import { publicBriefApi } from '@/services/client/publicBriefApi';
import { preVendorsApi } from '@/services/client/preVendorsApi';
import { emailAgentApi } from '@/services/client/emailAgentApi';
import { listenerMiddleware } from '@/lib/listenerMiddleware';

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        userApi.middleware,
        categoriesApi.middleware,
        ratesApi.middleware,
        offersApi.middleware,
        projectsApi.middleware,
        sharesApi.middleware,
        templatesApi.middleware,
        chatApi.middleware,
        comparisonApi.middleware,
        xlsxApi.middleware,
        profileApi.middleware,
        vendorSettingsApi.middleware,
        briefAiApi.middleware,
        publicBriefApi.middleware,
        preVendorsApi.middleware,
        emailAgentApi.middleware,
        listenerMiddleware.middleware
      ),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
