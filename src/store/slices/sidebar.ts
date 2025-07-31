import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';
import React from 'react';

export interface SidebarState {
  content: React.ReactNode;
  isOpen: boolean;
  title: React.ReactNode;
}

const initialState: SidebarState = {
  content: null,
  isOpen: false,
  title: '',
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
    },
    setSidebarContent: (state, action) => {
      state.content = action.payload;
    },
    setSidebarTitle: (state, action) => {
      state.title = action.payload;
    },
  },
});

export const { openSidebar, closeSidebar, setSidebarContent, setSidebarTitle } = sidebarSlice.actions;

export const selectIsSidebarOpen = (state: RootState) => state.sidebar.isOpen;
export const selectSidebarTitle = (state: RootState) => state.sidebar.title;
export const selectSidebarContent = (state: RootState) => state.sidebar.content;
