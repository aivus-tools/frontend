import { combineReducers } from '@reduxjs/toolkit';
import { projectSlice } from './slices/project';
import { offerSlice } from './slices/offer/slice';
import { categoriesApi } from '@/services/client/categoriesApi';
import { offersApi } from '@/services/client/offersApi';
import { projectsApi } from '@/services/client/projectsApi';
import { userApi } from '@/services/client/userApi';
import { vendorSlice } from './slices/vendor';
import { ratesApi } from '@/services/client/ratesApi';
import { sidebarSlice } from './slices/sidebar';
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

export const rootReducer = combineReducers({
  [projectSlice.reducerPath]: projectSlice.reducer,
  [sidebarSlice.reducerPath]: sidebarSlice.reducer,
  [offerSlice.reducerPath]: offerSlice.reducer,
  [vendorSlice.reducerPath]: vendorSlice.reducer,
  [categoriesApi.reducerPath]: categoriesApi.reducer,
  [ratesApi.reducerPath]: ratesApi.reducer,
  [offersApi.reducerPath]: offersApi.reducer,
  [projectsApi.reducerPath]: projectsApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [sharesApi.reducerPath]: sharesApi.reducer,
  [templatesApi.reducerPath]: templatesApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [comparisonApi.reducerPath]: comparisonApi.reducer,
  [xlsxApi.reducerPath]: xlsxApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [vendorSettingsApi.reducerPath]: vendorSettingsApi.reducer,
  [briefAiApi.reducerPath]: briefAiApi.reducer,
  [publicBriefApi.reducerPath]: publicBriefApi.reducer,
  [preVendorsApi.reducerPath]: preVendorsApi.reducer,
  [emailAgentApi.reducerPath]: emailAgentApi.reducer,
});
