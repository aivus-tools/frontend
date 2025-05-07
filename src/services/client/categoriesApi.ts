import { Category } from '@/types/categories';
import { Entry } from '@/types/entries';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categoriesApi = createApi({
	reducerPath: 'categoriesApi',
	baseQuery: fetchBaseQuery({ baseUrl: '/service' }),
	endpoints: (builder) => ({
		createCategory: builder.mutation<void, { name: string; parentCategoryId: number }>({
			query: (body) => ({
				url: '/categories',
				method: 'POST',
				body,
			}),
		}),
		getCategories: builder.query<Category[], void>({
			query: () => '/categories',
		}),
		getCategory: builder.query<Category, string>({
			query: (id) => `/categories/${id}`,
		}),
		updateCategory: builder.mutation<Category, Pick<Category, 'name' | 'parentCategoryId' | 'id'>>({
			query: (body) => ({
				url: `/categories/${body.id}`,
				method: 'PATCH',
				body,
			}),
		}),
		deleteCategory: builder.mutation<void, string>({
			query: (id) => ({
				url: `/categories/${id}`,
				method: 'DELETE',
			}),
		}),
		getEntries: builder.query<{ entries: Entry[] }, void>({
			query: () => `/entries`,
		}),
		getEntry: builder.query<Entry, string>({
			query: (id) => `/entries/${id}`,
		}),
	}),
});
