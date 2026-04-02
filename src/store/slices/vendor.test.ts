import { describe, it, expect } from 'vitest';
import { vendorSlice, setVendorId, selectVendorId, VendorState } from './vendor';

const reducer = vendorSlice.reducer;

const initialState: VendorState = {
  vendorId: null,
};

describe('vendorSlice', () => {
  it('has correct initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('setVendorId sets the vendor id', () => {
    const state = reducer(initialState, setVendorId('vendor-123'));
    expect(state.vendorId).toBe('vendor-123');
  });

  it('setVendorId replaces existing vendor id', () => {
    const state1 = reducer(initialState, setVendorId('vendor-1'));
    const state2 = reducer(state1, setVendorId('vendor-2'));
    expect(state2.vendorId).toBe('vendor-2');
  });
});

describe('vendor selectors', () => {
  it('selectVendorId returns vendorId', () => {
    const root = { vendor: { vendorId: 'v-1' } };
    expect(selectVendorId(root)).toBe('v-1');
  });

  it('selectVendorId returns null when not set', () => {
    const root = { vendor: { vendorId: null } };
    expect(selectVendorId(root)).toBeNull();
  });
});
