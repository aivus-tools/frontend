import { createAction } from '@reduxjs/toolkit';
import { TSection, TRow } from '@/app/interfaces/app.interface';

// Объявление actions
export const setTableData = createAction<TSection[]>('estimates/setTableData');
export const removeItem = createAction<number>('estimates/removeItem');
export const addItem = createAction<{ sectionId: number; newRow: TRow; isSubSection: boolean }>('estimates/addItem');
export const addSection = createAction<TSection>('estimates/addSection');
export const updateItem = createAction<{ sectionId: number; rowId: number; field: string; value: string | number }>('estimates/updateItem');
export const updateSectionVisibility = createAction<{ sectionId: number; isHidden: boolean }>('estimates/updateSectionVisibility');


