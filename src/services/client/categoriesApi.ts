import { Category } from '@/types/categories.interface';
import { Entry, UnitOption } from '@/types/entries.interface';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRoute } from '@/constants/apiRoute';

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  endpoints: (builder) => ({
    createCategory: builder.mutation<void, { name: string; parentCategoryId: number }>({
      query: (body) => ({
        url: ApiRoute.CATEGORY_LIST,
        method: 'POST',
        body,
      }),
    }),
    getCategories: builder.query<Category[], void>({
      query: () => ApiRoute.CATEGORY_LIST,
    }),
    getCategory: builder.query<Category, string>({
      query: (id) => ApiRoute.CATEGORY(id),
    }),
    updateCategory: builder.mutation<Category, Pick<Category, 'name' | 'parentCategoryId' | 'id'>>({
      query: (body) => ({
        url: ApiRoute.CATEGORY(body.id),
        method: 'PATCH',
        body,
      }),
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: ApiRoute.CATEGORY(id),
        method: 'DELETE',
      }),
    }),
    getEntries: builder.query<{ entries: Entry[] }, void>({
      query: () => ApiRoute.ENTRY_LIST,
    }),
    getEntriesFull: builder.query<{ entries: Entry[] }, void>({
      query: () => `${ApiRoute.ENTRY_LIST}?full=true`,
    }),
    getEntry: builder.query<Entry, string>({
      query: (id) => ApiRoute.ENTRY(id),
    }),
    getUnits: builder.query<{ units: UnitOption[] }, void>({
      query: () => ApiRoute.UNIT_LIST,
    }),
  }),
});
