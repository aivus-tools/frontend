import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import { OfferData } from '@/modules/vendor/estimation/types';

export interface SidebarState {
  isOpen: boolean;
  type: 'offer' | 'rate';
  data: OfferData | null;
}

const initialState: SidebarState = {
  isOpen: false,
  type: 'offer',
  data: null,
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
      state.data = null;
    },
    setSidebarType: (state, action) => {
      state.type = action.payload;
    },
    setSidebarData: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { openSidebar, closeSidebar, setSidebarType, setSidebarData } = sidebarSlice.actions;

export const selectIsSidebarOpen = (state: RootState) => state.sidebar.isOpen;
export const selectSidebarType = (state: RootState) => state.sidebar.type;
export const selectSidebarData = (state: RootState) => state.sidebar.data;
