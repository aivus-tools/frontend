import { describe, it, expect } from 'vitest';
import {
  sidebarSlice,
  openSidebar,
  closeSidebar,
  setSidebarInfo,
  selectIsSidebarOpen,
  selectSidebarInfo,
  SidebarState,
  OfferSidebarInfo,
  RateSidebarInfo,
} from './sidebar';

const reducer = sidebarSlice.reducer;

const initialState: SidebarState = {
  isOpen: false,
  info: null,
};

describe('sidebarSlice', () => {
  it('has correct initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('openSidebar sets isOpen to true', () => {
    const state = reducer(initialState, openSidebar());
    expect(state.isOpen).toBe(true);
    expect(state.info).toBeNull();
  });

  it('closeSidebar sets isOpen to false and clears info', () => {
    const offerInfo: OfferSidebarInfo = {
      type: 'offer',
      data: { id: '1', name: 'Row', rate: 100, units: [], estimate: 100 } as never,
    };
    const openState: SidebarState = { isOpen: true, info: offerInfo };
    const state = reducer(openState, closeSidebar());
    expect(state.isOpen).toBe(false);
    expect(state.info).toBeNull();
  });

  it('setSidebarInfo sets offer info', () => {
    const offerInfo: OfferSidebarInfo = {
      type: 'offer',
      data: { id: '1', name: 'Test', rate: 50, units: [], estimate: 50 } as never,
    };
    const state = reducer(initialState, setSidebarInfo(offerInfo));
    expect(state.info).toEqual(offerInfo);
    expect(state.info!.type).toBe('offer');
  });

  it('setSidebarInfo sets rate info', () => {
    const rateInfo: RateSidebarInfo = {
      type: 'rate',
      data: { id: 'r1', name: 'Camera', price: 500 } as never,
    };
    const state = reducer(initialState, setSidebarInfo(rateInfo));
    expect(state.info).toEqual(rateInfo);
    expect(state.info!.type).toBe('rate');
  });

  it('setSidebarInfo replaces existing info', () => {
    const first: OfferSidebarInfo = {
      type: 'offer',
      data: { id: '1' } as never,
    };
    const second: RateSidebarInfo = {
      type: 'rate',
      data: { id: 'r2' } as never,
    };
    let state = reducer(initialState, setSidebarInfo(first));
    state = reducer(state, setSidebarInfo(second));
    expect(state.info).toEqual(second);
  });

  it('openSidebar preserves info', () => {
    const info: OfferSidebarInfo = { type: 'offer', data: { id: '1' } as never };
    const stateWithInfo: SidebarState = { isOpen: false, info };
    const state = reducer(stateWithInfo, openSidebar());
    expect(state.isOpen).toBe(true);
    expect(state.info).toEqual(info);
  });
});

describe('sidebar selectors', () => {
  it('selectIsSidebarOpen returns isOpen', () => {
    const root = { sidebar: { isOpen: true, info: null } } as never;
    expect(selectIsSidebarOpen(root)).toBe(true);
  });

  it('selectSidebarInfo returns info', () => {
    const info: OfferSidebarInfo = { type: 'offer', data: { id: '1' } as never };
    const root = { sidebar: { isOpen: false, info } } as never;
    expect(selectSidebarInfo(root)).toEqual(info);
  });

  it('selectSidebarInfo returns null when no info', () => {
    const root = { sidebar: { isOpen: false, info: null } } as never;
    expect(selectSidebarInfo(root)).toBeNull();
  });
});
