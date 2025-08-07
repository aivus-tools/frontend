import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { OfferData } from '@/types/estimation.interface';
import { Rate } from '@/types/rate.interface';

export interface OfferSidebarInfo {
  type: 'offer';
  data: OfferData;
}
export interface RateSidebarInfo {
  type: 'rate';
  data: Rate;
}

export interface SidebarState {
  isOpen: boolean;
  info: OfferSidebarInfo | RateSidebarInfo | null;
}

const initialState: SidebarState = {
  isOpen: false,
  info: null,
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    openSidebar: (state) => {
      state.isOpen = true;
    },
    closeSidebar: (state) => {
      state.isOpen = false;
      state.info = null;
    },
    setSidebarInfo: (state, action) => {
      state.info = action.payload;
    },
  },
});

export const { openSidebar, closeSidebar, setSidebarInfo } = sidebarSlice.actions;

export const selectIsSidebarOpen = (state: RootState) => state.sidebar.isOpen;
export const selectSidebarInfo = (state: RootState) => state.sidebar.info;
