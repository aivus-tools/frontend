import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface VendorState {
  vendorId: string | null;
}

const initialState: VendorState = {
  vendorId: null,
};

export const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    setVendorId: (state, action: PayloadAction<string>) => {
      state.vendorId = action.payload;
    },
  },
});

export const { setVendorId } = vendorSlice.actions;

export const selectVendorId = (state: { vendor: VendorState }) => state.vendor.vendorId;
